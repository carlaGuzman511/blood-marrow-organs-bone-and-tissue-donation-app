import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { COMPONENT_SHORT_LABELS, RequestStatus, STATUS_LABELS, URGENCY_LABELS } from '../../../models/DonationRequest';
import { RequestCardView, URGENCY_ICONS, URGENCY_TONES, formatCountdown, secondsLeft } from '../../request-view';

export type MoveRequest = { request: RequestCardView; to: RequestStatus };

/**
 * One request on the tactical board (US-WEB-02): folio, ABO/Rh, patient, service and bed,
 * component, units covered over required, urgency label, and the Código Rojo countdown.
 */
@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [MatMenuModule],
  templateUrl: './request-card.component.html',
  styleUrl: './request-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestCardComponent {
  readonly request = input.required<RequestCardView>();
  /** Current time (ms), ticking from the page so every countdown updates together. */
  readonly now = input<number>(Date.now());
  /** True while its phase change is being saved. */
  readonly pending = input(false);
  readonly move = output<MoveRequest>();

  readonly urgencyLabel = computed(() => URGENCY_LABELS[this.request().urgency]);
  readonly urgencyIcon = computed(() => URGENCY_ICONS[this.request().urgency]);
  readonly tone = computed(() => URGENCY_TONES[this.request().urgency]);
  readonly isCodeRed = computed(() => this.request().urgency === 'CodeRed');
  readonly componentLabel = computed(() => COMPONENT_SHORT_LABELS[this.request().component]);
  readonly secondsLeft = computed(() => secondsLeft(this.request(), this.now()));
  /** Countdown shown on Código Rojo and on any overdue open request. */
  readonly countdown = computed(() => {
    const seconds = this.secondsLeft();
    if (seconds === null) return null;
    return this.isCodeRed() || seconds < 0 ? formatCountdown(seconds) : null;
  });
  readonly overdue = computed(() => (this.secondsLeft() ?? 1) < 0);
  readonly patientLabel = computed(() => {
    const code = this.request().patient?.patientCode;
    return code ? `Paciente #${code}` : this.request().title;
  });
  readonly clinicalLine = computed(() =>
    [this.request().patient?.diagnosis, this.request().patient?.service].filter(Boolean).join(' • '),
  );
  readonly locationLine = computed(() =>
    [this.request().donationCenter?.name, this.request().patient?.bed ? `Cama ${this.request().patient?.bed}` : null]
      .filter(Boolean)
      .join(' • '),
  );
  readonly progress = computed(() => Math.min(100, Math.max(0, this.request().progressPercent)));
  readonly moveTargets = computed(() =>
    this.request().allowedNextStatuses.map((status) => ({ status, label: STATUS_LABELS[status] })),
  );
  readonly summary = computed(() => {
    const r = this.request();
    return [
      `${this.urgencyLabel()}${this.countdown() ? ', ' + this.countdown() : ''}`,
      `Grupo ${r.bloodType?.name}`,
      this.patientLabel(),
      `${this.componentLabel()}: ${r.unitsCovered} de ${r.unitsRequired} unidades`,
      r.code,
    ].join('. ');
  });
}
