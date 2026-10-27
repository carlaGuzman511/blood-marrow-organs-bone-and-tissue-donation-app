import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { SessionSede } from '../../../auth/session-sede.service';
import { BloodType, Donation } from '../../../models/DonationPost';
import {
  BloodComponent,
  COMPONENT_LABELS,
  COMPONENT_SHORT_LABELS,
  DonationRequest,
  DonationRequestBody,
  URGENCY_OPTIONS,
  Urgency,
} from '../../../models/DonationRequest';
import { DonationRequestService, problemFieldErrors, problemMessage } from '../../services/donation-request.service';

export type PublishRequestData = {
  /** The session sede: the request is always published for it (never a hardcoded id). */
  sede: SessionSede;
  bloodTypes: BloodType[];
  donationTypes: Donation[];
};

/** Same rules as the API validator (DonationRequestRequestValidator). */
export const MAX_UNITS = 100;
export const PHONE_PATTERN = /^\+?[0-9 ()-]{6,20}$/;
const MAX_DEADLINE_DAYS = 365;

/** datetime-local value in the future and at most a year ahead. */
export function deadlineValidator(now: () => number = Date.now): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const at = new Date(control.value).getTime();
    if (Number.isNaN(at)) return { deadline: true };
    if (at <= now()) return { pastDeadline: true };
    if (at > now() + MAX_DEADLINE_DAYS * 86_400_000) return { farDeadline: true };
    return null;
  };
}

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** The catalog donation type for a component: blood components are "Sangre", marrow "Médula Ósea". */
export function donationTypeFor(component: BloodComponent | null, types: Donation[]): Donation | null {
  const wanted = component === 'WholeBlood' || component === 'PlateletsApheresis' ? 'sangre' : component === 'BoneMarrow' ? 'medula' : null;
  return wanted ? types.find((t) => normalize(t.name).startsWith(wanted)) ?? null : null;
}

/** "+ Publicar Solicitud Hospitalaria" (US-WEB-05). Saves itself so it can stay open on errors. */
@Component({
  selector: 'app-publish-request-dialog',
  standalone: true,
  imports: [MatDialogModule, ReactiveFormsModule],
  templateUrl: './publish-request-dialog.component.html',
  styleUrl: './publish-request-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishRequestDialogComponent {
  readonly data = inject<PublishRequestData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<PublishRequestDialogComponent, DonationRequest>>(MatDialogRef);
  private readonly service = inject(DonationRequestService);
  private readonly fb = inject(FormBuilder);

  readonly urgencyOptions = URGENCY_OPTIONS;
  readonly componentOptions = (Object.keys(COMPONENT_LABELS) as BloodComponent[]).map((value) => ({ value, label: COMPONENT_LABELS[value] }));
  readonly saving = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly form = this.fb.group({
    patientCode: ['', [Validators.required, Validators.maxLength(40)]],
    medicalRecord: ['', [Validators.required, Validators.maxLength(50)]],
    patientAge: [null as number | null, [Validators.min(0), Validators.max(120)]],
    diagnosis: ['', Validators.maxLength(200)],
    service: ['', Validators.maxLength(100)],
    urgency: [null as Urgency | null, Validators.required],
    deadline: ['', [Validators.required, deadlineValidator()]],
    component: [null as BloodComponent | null, Validators.required],
    unitsRequired: [1 as number | null, [Validators.required, Validators.min(1), Validators.max(MAX_UNITS), Validators.pattern(/^\d+$/)]],
    bloodTypeId: ['', Validators.required],
    donationTypeId: ['', Validators.required],
    bed: ['', [Validators.required, Validators.maxLength(50)]],
    coordinationPhone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  private readonly component = toSignal(this.form.controls.component.valueChanges, { initialValue: null });
  /** Organ/tissue requests pick the organ; blood and marrow resolve their type on their own. */
  readonly autoDonationType = computed(() => donationTypeFor(this.component(), this.data.donationTypes));
  readonly organTypes = computed(() => {
    const blood = donationTypeFor('WholeBlood', this.data.donationTypes)?.id;
    const marrow = donationTypeFor('BoneMarrow', this.data.donationTypes)?.id;
    return this.data.donationTypes.filter((t) => t.id !== blood && t.id !== marrow);
  });
  readonly needsTypePick = computed(() => !!this.component() && !this.autoDonationType());

  constructor() {
    this.form.controls.component.valueChanges.subscribe((component) => {
      const auto = donationTypeFor(component, this.data.donationTypes);
      this.form.controls.donationTypeId.setValue(auto?.id ?? '');
    });
    this.form.valueChanges.subscribe(() => this.serverError.set(null));
  }

  /** Inline error for a field, once touched or after an attempt to publish. */
  error(name: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[name];
    if (!control.errors || !(control.touched || this.submitted())) return null;
    const e = control.errors;
    if (e['server']) return e['server'];
    if (e['required']) return 'Campo requerido';
    if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres`;
    if (e['min'] || e['max'] || e['pattern']) {
      if (name === 'unitsRequired') return `Entre 1 y ${MAX_UNITS} unidades`;
      if (name === 'patientAge') return 'Edad entre 0 y 120';
      if (name === 'coordinationPhone') return 'Teléfono no válido (6 a 20 dígitos)';
    }
    if (e['pastDeadline']) return 'La fecha límite no puede estar en el pasado';
    if (e['farDeadline']) return 'La fecha límite no puede superar un año';
    return 'Valor no válido';
  }

  publish(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    this.serverError.set(null);
    this.service
      .create(this.toBody())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (created) => this.ref.close(created),
        error: (error) => {
          // Keep the dialog open with everything typed; point at the fields the API rejected.
          for (const [field, message] of Object.entries(problemFieldErrors(error))) {
            const control = this.form.get(field);
            if (control) {
              control.setErrors({ ...(control.errors ?? {}), server: message });
              control.markAsTouched();
            }
          }
          this.serverError.set(problemMessage(error, 'No se pudo publicar la solicitud. Revisa los campos marcados.'));
        },
      });
  }

  close(): void {
    this.ref.close();
  }

  private toBody(): DonationRequestBody {
    const v = this.form.getRawValue();
    const text = (value: string | null | undefined) => (value?.trim() ? value.trim() : null);
    const component = v.component as BloodComponent;
    return {
      title: `${COMPONENT_SHORT_LABELS[component]} · Paciente ${v.patientCode!.trim()}`.slice(0, 150),
      description: v.description!.trim(),
      bloodTypeId: v.bloodTypeId!,
      donationTypeId: v.donationTypeId!,
      donationCenterId: this.data.sede.id,
      component,
      urgency: v.urgency as Urgency,
      unitsRequired: Number(v.unitsRequired),
      deadline: new Date(v.deadline!).toISOString(),
      patientCode: v.patientCode!.trim(),
      patientAge: v.patientAge === null || v.patientAge === undefined || `${v.patientAge}` === '' ? null : Number(v.patientAge),
      diagnosis: text(v.diagnosis),
      service: text(v.service),
      bed: text(v.bed),
      medicalRecord: text(v.medicalRecord),
      coordinationPhone: v.coordinationPhone!.trim(),
    };
  }
}
