import { ClinicalTone } from '../shared/ui/status-badge/status-badge.component';
import {
  BloodComponent,
  DonationRequest,
  DonationRequestQuery,
  RequestStatus,
  Urgency,
} from '../models/DonationRequest';

/** A request as the board shows it: the API row plus its deadline on this browser's clock. */
export type RequestCardView = DonationRequest & {
  /** Epoch ms of the deadline on the client clock (from remainingSeconds), or null when closed. */
  deadlineAt: number | null;
};

/** The clinical filter panel (US-WEB-03). Empty values mean "all". */
export type RequestFilters = {
  urgency: Urgency | null;
  component: BloodComponent | null;
  bloodTypeIds: string[];
  status: RequestStatus | null;
};

export const EMPTY_FILTERS: RequestFilters = { urgency: null, component: null, bloodTypeIds: [], status: null };

/** Number of filter groups in use, for the "N filtros activos" counter. */
export function activeFilterCount(filters: RequestFilters): number {
  return [filters.urgency, filters.component, filters.bloodTypeIds.length ? 1 : null, filters.status].filter(
    (value) => value !== null && value !== undefined,
  ).length;
}

/** Filters as API query params: the backend filters, never the browser. */
export function filtersToQuery(filters: RequestFilters): DonationRequestQuery {
  return {
    urgency: filters.urgency,
    component: filters.component,
    bloodTypeId: filters.bloodTypeIds.length ? [...filters.bloodTypeIds] : undefined,
    status: filters.status,
  };
}

/** Whether a request (e.g. one just published) belongs on a board filtered like this. */
export function matchesFilters(request: DonationRequest, filters: RequestFilters): boolean {
  return (
    (!filters.urgency || request.urgency === filters.urgency) &&
    (!filters.component || request.component === filters.component) &&
    (!filters.bloodTypeIds.length || filters.bloodTypeIds.includes(request.bloodType?.id)) &&
    (!filters.status || request.status === filters.status)
  );
}

export function toCardView(request: DonationRequest, receivedAt = Date.now()): RequestCardView {
  const remaining = request.remainingSeconds;
  return { ...request, deadlineAt: remaining === null || remaining === undefined ? null : receivedAt + remaining * 1000 };
}

/** Seconds left until the deadline at `now`, or null when there is no countdown. */
export function secondsLeft(view: RequestCardView, now: number): number | null {
  return view.deadlineAt === null ? null : Math.round((view.deadlineAt - now) / 1000);
}

/** "35m rest.", "18h rest.", "2d rest.", "Vencida hace 5m" (Stitch card badge). */
export function formatCountdown(seconds: number | null): string | null {
  if (seconds === null) return null;
  const abs = Math.abs(seconds);
  let text: string;
  if (abs < 60) text = `${abs}s`;
  else if (abs < 3600) text = `${Math.floor(abs / 60)}m`;
  else if (abs < 86400) {
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    text = m && h < 10 ? `${h}h ${m}m` : `${h}h`;
  } else text = `${Math.floor(abs / 86400)}d`;
  return seconds < 0 ? `Vencida hace ${text}` : `${text} rest.`;
}

export const URGENCY_TONES: Record<Urgency, ClinicalTone> = {
  CodeRed: 'urgent',
  Priority: 'info',
  Standard: 'neutral',
};

/** Material Symbol per urgency (alarm for Código Rojo, schedule for Prioritario). */
export const URGENCY_ICONS: Record<Urgency, string> = {
  CodeRed: 'alarm',
  Priority: 'schedule',
  Standard: 'event',
};

export type CodeRedSummary = {
  /** Center with the most active Código Rojo requests. */
  centerName: string;
  /** Active Código Rojo requests at that center. */
  count: number;
  /** Active Código Rojo requests in the whole network. */
  total: number;
  /** Other centers with an active Código Rojo. */
  otherCenters: number;
};

/** The network banner: which center has an active Código Rojo and how many requests are in course. */
export function summarizeCodeRed(requests: DonationRequest[], total = requests.length): CodeRedSummary | null {
  const open = requests.filter((r) => r.urgency === 'CodeRed' && r.status !== 'Completed' && r.status !== 'Cancelled');
  if (!open.length) return null;
  const byCenter = new Map<string, number>();
  for (const request of open) {
    const name = request.donationCenter?.name ?? 'Sede sin registrar';
    byCenter.set(name, (byCenter.get(name) ?? 0) + 1);
  }
  const [centerName, count] = [...byCenter.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  return { centerName, count, total: Math.max(total, open.length), otherCenters: byCenter.size - 1 };
}

/** Local midnight as ISO (UTC): "completed today" for the Completado column. */
export function startOfToday(now = new Date()): string {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return midnight.toISOString();
}
