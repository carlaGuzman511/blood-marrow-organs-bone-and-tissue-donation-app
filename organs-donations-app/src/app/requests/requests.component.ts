import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, catchError, debounce, finalize, forkJoin, interval, map, merge, of, switchMap, timer } from 'rxjs';
import { SessionSedeService } from '../auth/session-sede.service';
import { BloodType, Donation } from '../models/DonationPost';
import {
  BOARD_COLUMNS,
  DonationRequest,
  DonationRequestPage,
  DonationRequestQuery,
  RequestStatus,
  STATUS_LABELS,
} from '../models/DonationRequest';
import { HomeService } from '../services/home.service';
import { ConfirmMoveDialogComponent, ConfirmMoveData, ConfirmMoveResult } from './components/confirm-move-dialog/confirm-move-dialog.component';
import { PublishRequestDialogComponent, PublishRequestData } from './components/publish-request-dialog/publish-request-dialog.component';
import { MoveRequest, RequestCardComponent } from './components/request-card/request-card.component';
import { RequestFiltersComponent } from './components/request-filters/request-filters.component';
import { RequestTableComponent } from './components/request-table/request-table.component';
import {
  CodeRedSummary,
  EMPTY_FILTERS,
  RequestCardView,
  RequestFilters,
  activeFilterCount,
  filtersToQuery,
  matchesFilters,
  startOfToday,
  summarizeCodeRed,
  toCardView,
} from './request-view';
import { DonationRequestService, problemMessage } from './services/donation-request.service';

export type BoardColumn = { status: RequestStatus; label: string; items: RequestCardView[]; total: number; outOfFilter: boolean };
type ViewMode = 'board' | 'table';
type LoadResult =
  | { view: 'board'; columns: BoardColumn[] }
  | { view: 'table'; page: DonationRequestPage; receivedAt: number }
  | { view: 'error'; message: string };

/** Debounce for filter changes, so quick clicks send one query. */
export const FILTER_DEBOUNCE_MS = 300;
/** Cards per column (the column badge still shows the full count from the API). */
export const COLUMN_PAGE_SIZE = 50;
const REFRESH_MS = 60_000;

/**
 * "Solicitudes Clínicas & Triaje" (Stitch: solicitudes_clinicas_y_urgencias_portal_web).
 * US-WEB-02 tactical board by phase, US-WEB-03 server-side filters, US-WEB-05 publish.
 * Clinical staff see their session sede; Admin / CENATRA sessions see the whole network.
 */
@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, RequestCardComponent, RequestFiltersComponent, RequestTableComponent],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestsComponent implements OnInit {
  private readonly service = inject(DonationRequestService);
  private readonly homeService = inject(HomeService);
  private readonly sessionSede = inject(SessionSedeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly sede = this.sessionSede.sede;
  readonly networkScope = computed(() => this.sede()?.access === 'admin');
  readonly filters = signal<RequestFilters>(EMPTY_FILTERS);
  readonly activeFilters = computed(() => activeFilterCount(this.filters()));
  readonly view = signal<ViewMode>('board');
  readonly columns = signal<BoardColumn[]>(BOARD_COLUMNS.map((status) => emptyColumn(status)));
  readonly tableRows = signal<RequestCardView[]>([]);
  readonly tableTotal = signal(0);
  readonly tablePage = signal(1);
  readonly tablePageSize = signal(10);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly codeRed = signal<CodeRedSummary | null>(null);
  readonly bloodTypes = signal<BloodType[]>([]);
  readonly donationTypes = signal<Donation[]>([]);
  /** Ids whose phase change is being saved. */
  readonly pendingMoves = signal<ReadonlySet<string>>(new Set());
  readonly now = signal(Date.now());

  readonly activeCount = computed(() =>
    this.columns().filter((c) => c.status !== 'Completed').reduce((sum, c) => sum + c.total, 0),
  );
  readonly isEmpty = computed(() =>
    this.view() === 'board' ? this.columns().every((c) => c.total === 0) : this.tableTotal() === 0,
  );

  /** Every reload goes through here; `debounce` is for filter edits. */
  private readonly reload$ = new Subject<{ debounce: boolean }>();
  /** Latest load: an older one finishing late never clears the spinner (US-WEB-03). */
  private loadSeq = 0;

  ngOnInit(): void {
    // Filter edits wait FILTER_DEBOUNCE_MS (a newer edit restarts the wait); other reloads go now
    // and also cancel a pending filter reload.
    const debounced = this.reload$.pipe(debounce((r) => (r.debounce ? timer(FILTER_DEBOUNCE_MS) : of(0))));
    merge(debounced, interval(REFRESH_MS).pipe(map(() => ({ debounce: false }))))
      .pipe(
        // switchMap drops a stale response: only the newest filters ever reach the screen.
        switchMap(() => this.load()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.apply(result));

    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(Date.now()));

    this.homeService.getBloodTypes().pipe(catchError(() => of([]))).subscribe((types) => this.bloodTypes.set(sortBloodTypes(types)));
    this.homeService.getDonationTypes().pipe(catchError(() => of([]))).subscribe((types) => this.donationTypes.set(types));
    this.refresh();
  }

  // ---------- Filters (US-WEB-03) ----------

  onFiltersChange(filters: RequestFilters): void {
    this.filters.set(filters);
    this.tablePage.set(1);
    this.reload$.next({ debounce: true });
  }

  resetFilters(): void {
    this.filters.set(EMPTY_FILTERS);
    this.tablePage.set(1);
    this.reload$.next({ debounce: false });
  }

  setView(view: ViewMode): void {
    if (this.view() === view) return;
    this.view.set(view);
    this.reload$.next({ debounce: false });
  }

  onTablePage(event: { page: number; pageSize: number }): void {
    this.tablePage.set(event.page);
    this.tablePageSize.set(event.pageSize);
    this.reload$.next({ debounce: false });
  }

  refresh(): void {
    this.reload$.next({ debounce: false });
  }

  // ---------- Loading ----------

  private baseQuery(): DonationRequestQuery {
    const sede = this.sede();
    return {
      ...filtersToQuery(this.filters()),
      donationCenterId: this.networkScope() ? null : sede?.id ?? null,
    };
  }

  private load(): Observable<LoadResult> {
    const seq = ++this.loadSeq;
    this.loading.set(true);
    const work: Observable<LoadResult> = this.view() === 'board' ? this.loadBoard() : this.loadTable();
    this.loadCodeRed();
    return work.pipe(
      catchError((error) => of<LoadResult>({ view: 'error', message: problemMessage(error, 'No se pudieron cargar las solicitudes.') })),
      finalize(() => {
        if (seq === this.loadSeq) this.loading.set(false);
      }),
    );
  }

  private loadBoard(): Observable<LoadResult> {
    const base = this.baseQuery();
    const phase = this.filters().status;
    const receivedAt = () => Date.now();
    const columns = BOARD_COLUMNS.map((status) => {
      if (phase && phase !== status) return of(emptyColumn(status, true));
      const query: DonationRequestQuery = { ...base, status, pageSize: COLUMN_PAGE_SIZE };
      // Completado shows what was completed today; older ones live in the Registro Clínico.
      if (status === 'Completed') query.statusChangedSince = startOfToday();
      return this.service.list(query).pipe(
        map((page): BoardColumn => {
          const at = receivedAt();
          return { ...emptyColumn(status), items: page.items.map((r) => toCardView(r, at)), total: page.totalCount };
        }),
      );
    });
    return forkJoin(columns).pipe(map((cols) => ({ view: 'board' as const, columns: cols })));
  }

  private loadTable(): Observable<LoadResult> {
    return this.service
      .list({ ...this.baseQuery(), page: this.tablePage(), pageSize: this.tablePageSize() })
      .pipe(map((page) => ({ view: 'table' as const, page, receivedAt: Date.now() })));
  }

  /** Network banner: open Código Rojo requests anywhere, whatever the filters. */
  private loadCodeRed(): void {
    this.service
      .list({ urgency: 'CodeRed', open: true, pageSize: 100 })
      .pipe(catchError(() => of(null)))
      .subscribe((page) => {
        if (page) this.codeRed.set(summarizeCodeRed(page.items, page.totalCount));
      });
  }

  private apply(result: LoadResult): void {
    if (result.view === 'error') {
      this.loadError.set(result.message);
      return;
    }
    this.loadError.set(null);
    if (result.view === 'board') {
      // A card being moved keeps its optimistic place until the server answers.
      const pending = this.pendingMoves();
      if (pending.size) return;
      this.columns.set(result.columns);
    } else {
      this.tableRows.set(result.page.items.map((r) => toCardView(r, result.receivedAt)));
      this.tableTotal.set(result.page.totalCount);
    }
  }

  // ---------- Phase changes (US-WEB-02) ----------

  /** Drop targets: only the phases the API says this card may move to. */
  canDrop = (drag: CdkDrag<RequestCardView>, drop: CdkDropList<RequestStatus>): boolean =>
    drag.data.status === drop.data || drag.data.allowedNextStatuses.includes(drop.data);

  onDrop(event: CdkDragDrop<RequestStatus, RequestStatus, RequestCardView>): void {
    if (event.previousContainer === event.container) return;
    this.requestMove({ request: event.item.data, to: event.container.data }, event.currentIndex);
  }

  /** Confirm, then move the card at once and roll back if the API refuses. */
  requestMove(move: MoveRequest, index = 0): void {
    const { request, to } = move;
    if (this.pendingMoves().has(request.id)) return;
    this.dialog
      .open<ConfirmMoveDialogComponent, ConfirmMoveData, ConfirmMoveResult>(ConfirmMoveDialogComponent, {
        data: { code: request.code, from: request.status, to },
        width: '28rem',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.moveOptimistically(request, to, index, result.reason);
      });
  }

  private moveOptimistically(request: RequestCardView, to: RequestStatus, index: number, reason: string): void {
    const snapshot = this.columns();
    this.columns.set(moveCard(snapshot, request, to, index));
    this.setPending(request.id, true);

    this.service
      .changeStatus(request.id, to, reason)
      .pipe(finalize(() => this.setPending(request.id, false)))
      .subscribe({
        next: (saved) => {
          this.columns.update((cols) => replaceCard(cols, toCardView(saved)));
          this.snackBar.open(`${saved.code} movida a ${STATUS_LABELS[saved.status]}`, 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          // Rollback: the board goes back to how it was before the move.
          this.columns.set(snapshot);
          this.snackBar.open(problemMessage(error, `No se pudo mover ${request.code}.`), 'Cerrar', { duration: 5000 });
        },
      });
  }

  private setPending(id: string, on: boolean): void {
    this.pendingMoves.update((set) => {
      const next = new Set(set);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  // ---------- Publish (US-WEB-05) ----------

  openPublish(): void {
    const sede = this.sede();
    if (!sede) return;
    this.dialog
      .open<PublishRequestDialogComponent, PublishRequestData, DonationRequest>(PublishRequestDialogComponent, {
        data: { sede, bloodTypes: this.bloodTypes(), donationTypes: this.donationTypes() },
        width: '56rem',
        maxWidth: '95vw',
        autoFocus: 'first-tabbable',
      })
      .afterClosed()
      .subscribe((created) => {
        if (!created) return;
        this.addPublished(created);
        this.loadCodeRed();
      });
  }

  /** The new card goes to the top of Buscando Donantes without reloading the page. */
  private addPublished(created: DonationRequest): void {
    const visible = matchesFilters(created, this.filters());
    if (visible) {
      const card = toCardView(created);
      this.columns.update((cols) =>
        cols.map((c) => (c.status === created.status ? { ...c, items: [card, ...c.items.filter((i) => i.id !== card.id)], total: c.total + 1 } : c)),
      );
      if (this.view() === 'table') this.refresh();
    }
    const note = visible ? 'en Buscando Donantes' : '(no coincide con los filtros activos)';
    this.snackBar.open(`Solicitud ${created.code} publicada ${note}`, 'Cerrar', { duration: 4000 });
  }

  trackColumn = (_: number, column: BoardColumn) => column.status;
}

function emptyColumn(status: RequestStatus, outOfFilter = false): BoardColumn {
  return { status, label: STATUS_LABELS[status], items: [], total: 0, outOfFilter };
}

/** Moves a card between columns, keeping each column's count right. */
export function moveCard(columns: BoardColumn[], card: RequestCardView, to: RequestStatus, index = 0): BoardColumn[] {
  const moved: RequestCardView = { ...card, status: to, allowedNextStatuses: [] };
  return columns.map((column) => {
    if (column.status === card.status) {
      return { ...column, items: column.items.filter((i) => i.id !== card.id), total: Math.max(0, column.total - 1) };
    }
    if (column.status === to) {
      const items = [...column.items];
      items.splice(Math.min(index, items.length), 0, moved);
      return { ...column, items, total: column.total + 1, outOfFilter: false };
    }
    return column;
  });
}

/** Puts the server's version of a card in place (wherever it is now). */
export function replaceCard(columns: BoardColumn[], saved: RequestCardView): BoardColumn[] {
  const placed = columns.some((c) => c.items.some((i) => i.id === saved.id));
  if (!placed) return columns;
  return columns.map((column) => ({
    ...column,
    items: column.items.map((item) => (item.id === saved.id ? saved : item)),
  }));
}

const BLOOD_ORDER = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
function sortBloodTypes(types: BloodType[]): BloodType[] {
  const rank = (name: string) => {
    const i = BLOOD_ORDER.indexOf(name.replace(/\s/g, '').toUpperCase());
    return i < 0 ? 99 : i;
  };
  return [...types].sort((a, b) => rank(a.name) - rank(b.name));
}
