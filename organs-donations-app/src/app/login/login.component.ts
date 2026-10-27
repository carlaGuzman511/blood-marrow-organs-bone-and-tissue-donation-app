import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { PortalAccess } from '../auth/roles';
import { SessionSedeService } from '../auth/session-sede.service';
import { DonationCenter } from '../models/DonationPost';
import { HomeService } from '../services/home.service';
import { environment } from '../../environments/environment';

/** Texts that change with the selected tab (Stitch: acceso_y_autenticacion_clinica_portal_web). */
export const ACCESS_COPY: Record<PortalAccess, { submit: string; emailPlaceholder: string }> = {
  clinical: {
    submit: 'Ingresar al Portal Clínico',
    emailPlaceholder: 'doctor@hospitalvitalis.org o enfermeria@salud.gob',
  },
  admin: {
    submit: 'Ingresar al Panel de Coordinación CENATRA',
    emailPlaceholder: 'coordinador@cenatra.salud.gob.mx',
  },
};

/**
 * Portal login (US-WEB-01). Picks the role tab and the sede, then hands over to Keycloak
 * (PKCE). Signed-in staff without a sede for this session only pick the sede here.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly sessionSede = inject(SessionSedeService);
  private readonly homeService = inject(HomeService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly access = signal<PortalAccess>('clinical');
  readonly copy = computed(() => ACCESS_COPY[this.access()]);
  readonly centers = signal<DonationCenter[]>([]);
  readonly centerCount = signal<number | null>(null);
  readonly loadingCenters = signal(true);
  readonly centersError = signal(false);
  /** Already signed in (e.g. new tab): only the sede is missing. */
  readonly pickSedeOnly = signal(this.authService.isLoggedIn());
  readonly donorAppUrl = environment.donorAppUrl;
  readonly donorAppIsExternal = /^https?:\/\//.test(environment.donorAppUrl);

  readonly form = this.fb.nonNullable.group({
    sedeId: ['', Validators.required],
    email: ['', Validators.email],
  });

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      if (!this.authService.canUsePortal()) {
        this.router.navigateByUrl('/no-autorizado');
        return;
      }
      if (this.sessionSede.sede()) {
        this.router.navigateByUrl('/solicitudes');
        return;
      }
    }
    const current = this.sessionSede.sede();
    if (current) {
      this.access.set(current.access);
      this.form.patchValue({ sedeId: current.id });
    }
    this.loadCenters();
  }

  selectAccess(access: PortalAccess): void {
    this.access.set(access);
  }

  get sedeInvalid(): boolean {
    const control = this.form.controls.sedeId;
    return control.invalid && (control.touched || control.dirty);
  }

  get emailInvalid(): boolean {
    const control = this.form.controls.email;
    return control.invalid && control.touched;
  }

  /** "Ingresar": Keycloak with the institutional email as login hint. */
  submit(): void {
    this.start(false);
  }

  /** "Continuar con Google Workspace": Keycloak's Google identity provider. */
  continueWithGoogle(): void {
    this.start(true);
  }

  private start(google: boolean): void {
    this.form.markAllAsTouched();
    const sede = this.selectedSede();
    if (!sede || (!google && this.form.controls.email.invalid)) return;

    if (this.pickSedeOnly()) {
      this.sessionSede.set(sede);
      this.router.navigateByUrl('/solicitudes');
      return;
    }
    this.authService.login({ sede, email: google ? undefined : this.form.controls.email.value, google });
  }

  private selectedSede() {
    const id = this.form.controls.sedeId.value;
    const center = this.centers().find((c) => c.id === id);
    return center ? { id: center.id, name: center.name, access: this.access() } : null;
  }

  loadCenters(): void {
    this.loadingCenters.set(true);
    this.centersError.set(false);
    this.homeService
      .searchDonationCenters({ pageSize: 100 })
      .pipe(
        catchError(() => {
          this.centersError.set(true);
          return of(null);
        }),
        finalize(() => this.loadingCenters.set(false)),
      )
      .subscribe((page) => {
        if (!page) return;
        this.centers.set(page.items);
        this.centerCount.set(page.totalCount);
      });
  }
}
