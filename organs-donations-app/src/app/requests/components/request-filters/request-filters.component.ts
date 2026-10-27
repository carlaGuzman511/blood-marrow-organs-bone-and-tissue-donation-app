import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BloodType } from '../../../models/DonationPost';
import {
  BloodComponent,
  COMPONENT_LABELS,
  RequestStatus,
  STATUS_OPTIONS,
  URGENCY_OPTIONS,
  Urgency,
} from '../../../models/DonationRequest';
import { RequestFilters, activeFilterCount } from '../../request-view';

/**
 * "Filtros Operativos Clínicos" (US-WEB-03). Emits the new filters on every change; the page
 * sends them to the API (debounced). Blood groups are toggle chips and can be combined.
 */
@Component({
  selector: 'app-request-filters',
  standalone: true,
  templateUrl: './request-filters.component.html',
  styleUrl: './request-filters.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestFiltersComponent {
  readonly filters = input.required<RequestFilters>();
  readonly bloodTypes = input<BloodType[]>([]);
  readonly filtersChange = output<RequestFilters>();
  readonly reset = output<void>();

  readonly urgencyOptions = URGENCY_OPTIONS;
  readonly componentOptions = (Object.keys(COMPONENT_LABELS) as BloodComponent[]).map((value) => ({
    value,
    label: COMPONENT_LABELS[value],
  }));
  readonly statusOptions = STATUS_OPTIONS;
  readonly activeCount = computed(() => activeFilterCount(this.filters()));

  setUrgency(value: string): void {
    this.emit({ urgency: (value || null) as Urgency | null });
  }

  setComponent(value: string): void {
    this.emit({ component: (value || null) as BloodComponent | null });
  }

  setStatus(value: string): void {
    this.emit({ status: (value || null) as RequestStatus | null });
  }

  toggleBloodType(id: string): void {
    const selected = this.filters().bloodTypeIds;
    this.emit({ bloodTypeIds: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] });
  }

  isSelected(id: string): boolean {
    return this.filters().bloodTypeIds.includes(id);
  }

  private emit(change: Partial<RequestFilters>): void {
    this.filtersChange.emit({ ...this.filters(), ...change });
  }
}
