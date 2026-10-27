import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Clinical meaning of a status (US-WEB-09): viable/confirmed green, urgent red, observation amber. */
export type ClinicalTone = 'urgent' | 'observation' | 'viable' | 'info' | 'neutral';

/** Material icon per tone, so color is never the only signal. */
export const TONE_ICONS: Record<ClinicalTone, string> = {
  urgent: 'emergency',
  observation: 'visibility',
  viable: 'check_circle',
  info: 'info',
  neutral: 'radio_button_unchecked',
};

/** Status pill from the design system: `<vd-status-badge tone="viable" label="Viable" />`. */
@Component({
  selector: 'vd-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="'vd-badge vd-badge--' + tone()">
      <span class="material-icons icon" aria-hidden="true">{{ icon() }}</span>
      <span>{{ label() }}</span>
    </span>
  `,
  styles: `
    :host { display: inline-flex; }
    .icon { font-size: 0.875rem; width: 0.875rem; height: 0.875rem; line-height: 1; }
  `,
})
export class StatusBadgeComponent {
  readonly tone = input<ClinicalTone>('neutral');
  readonly label = input.required<string>();
  readonly icon = computed(() => TONE_ICONS[this.tone()]);
}
