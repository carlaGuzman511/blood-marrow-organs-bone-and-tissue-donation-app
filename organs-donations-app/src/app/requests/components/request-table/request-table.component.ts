import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { COMPONENT_SHORT_LABELS, STATUS_LABELS, URGENCY_LABELS } from '../../../models/DonationRequest';
import { StatusBadgeComponent, ClinicalTone } from '../../../shared/ui/status-badge/status-badge.component';
import { RequestCardView, URGENCY_TONES, formatCountdown, secondsLeft } from '../../request-view';

const STATUS_TONES: Record<string, ClinicalTone> = {
  SearchingDonors: 'urgent',
  DonorsOnTheWay: 'info',
  LabValidation: 'observation',
  Completed: 'viable',
  Cancelled: 'neutral',
};

/** "Registro Clínico": the same filtered data as the board, as a paginated table (US-WEB-02). */
@Component({
  selector: 'app-request-table',
  standalone: true,
  imports: [MatPaginatorModule, StatusBadgeComponent],
  templateUrl: './request-table.component.html',
  styleUrl: './request-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestTableComponent {
  readonly rows = input.required<RequestCardView[]>();
  readonly totalCount = input(0);
  /** 1-based, like the API. */
  readonly page = input(1);
  readonly pageSize = input(10);
  readonly now = input<number>(Date.now());
  readonly pageChange = output<{ page: number; pageSize: number }>();

  readonly urgencyLabels = URGENCY_LABELS;
  readonly urgencyTones = URGENCY_TONES;
  readonly componentLabels = COMPONENT_SHORT_LABELS;
  readonly statusLabels = STATUS_LABELS;
  readonly statusTones = STATUS_TONES;
  readonly pageSizes = [10, 20, 50];

  countdown(row: RequestCardView): string | null {
    return formatCountdown(secondsLeft(row, this.now()));
  }

  onPage(event: PageEvent): void {
    this.pageChange.emit({ page: event.pageIndex + 1, pageSize: event.pageSize });
  }
}
