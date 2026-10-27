import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RequestStatus, STATUS_LABELS } from '../../../models/DonationRequest';

export type ConfirmMoveData = { code: string; from: RequestStatus; to: RequestStatus };
/** Closed with the optional reason when confirmed, undefined when cancelled. */
export type ConfirmMoveResult = { reason: string } | undefined;

/** Confirms a phase change before it is sent (US-WEB-02). The reason is kept in the history. */
@Component({
  selector: 'app-confirm-move-dialog',
  standalone: true,
  imports: [MatDialogModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="vd-headline-md">{{ isCancel ? 'Cancelar solicitud' : 'Cambiar fase' }}</h2>
    <mat-dialog-content>
      <p class="vd-body-md">
        <strong>{{ data.code }}</strong>:
        {{ labels[data.from] }} <span aria-hidden="true">→</span><span class="sr-only">a</span> <strong>{{ labels[data.to] }}</strong>
      </p>
      @if (isFinal) {
        <p class="vd-body-sm warn" role="note">Esta fase es final: la solicitud ya no podrá moverse.</p>
      }
      <label class="vd-label-sm label" for="move-reason">Motivo (opcional, queda en el historial)</label>
      <textarea id="move-reason" class="vd-input reason" [formControl]="reason" maxlength="300" rows="3"
                placeholder="Ej. Serología reactiva, donante confirmado…"></textarea>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" class="vd-btn vd-btn--subtle" (click)="ref.close()">Volver</button>
      <button type="button" class="vd-btn vd-btn--primary" (click)="confirm()" data-testid="confirm-move">
        {{ isCancel ? 'Cancelar solicitud' : 'Confirmar cambio' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    p { margin: 0 0 var(--vd-space-sm); color: var(--vd-color-text); }
    .warn { color: var(--vd-tone-observation-fg); background: var(--vd-tone-observation-bg); padding: var(--vd-space-xs) var(--vd-space-sm); border-radius: var(--vd-radius-base); }
    .label { display: block; margin-bottom: var(--vd-space-2xs); color: var(--vd-color-text-muted); }
    .reason { height: auto; min-height: 5rem; padding: var(--vd-space-sm); resize: vertical; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  `,
})
export class ConfirmMoveDialogComponent {
  readonly data = inject<ConfirmMoveData>(MAT_DIALOG_DATA);
  readonly ref = inject<MatDialogRef<ConfirmMoveDialogComponent, ConfirmMoveResult>>(MatDialogRef);
  readonly labels = STATUS_LABELS;
  readonly reason = new FormControl('', { nonNullable: true, validators: [Validators.maxLength(300)] });
  readonly isCancel = this.data.to === 'Cancelled';
  readonly isFinal = this.data.to === 'Completed' || this.data.to === 'Cancelled';

  confirm(): void {
    this.ref.close({ reason: this.reason.value.trim() });
  }
}
