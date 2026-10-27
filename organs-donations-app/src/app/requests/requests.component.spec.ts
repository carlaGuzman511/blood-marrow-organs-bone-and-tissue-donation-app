import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, of, throwError } from 'rxjs';
import { FILTER_DEBOUNCE_MS, RequestsComponent } from './requests.component';
import { DonationRequestService } from './services/donation-request.service';
import { HomeService } from '../services/home.service';
import { SessionSedeService } from '../auth/session-sede.service';
import { DonationRequest, DonationRequestPage, DonationRequestQuery } from '../models/DonationRequest';
import { EMPTY_FILTERS } from './request-view';
import { aRequest, pageOf } from './testing';

describe('RequestsComponent (US-WEB-02 / 03 / 05)', () => {
  let fixture: ComponentFixture<RequestsComponent>;
  let component: RequestsComponent;
  let queries: DonationRequestQuery[];
  let respond: (q: DonationRequestQuery) => Observable<DonationRequestPage>;
  let changeStatus: jasmine.Spy;
  let dialogResult: unknown;

  const boardQueries = () => queries.filter((q) => q.urgency !== 'CodeRed' || q.open !== true);
  const text = (id: string) => (fixture.nativeElement.querySelector(`[data-testid="${id}"]`) as HTMLElement | null)?.textContent?.trim();

  function setup() {
    queries = [];
    respond = (q) => of(pageOf(q.status === 'SearchingDonors' ? [aRequest()] : [], q.status === 'SearchingDonors' ? 3 : 0));
    changeStatus = jasmine.createSpy('changeStatus');
    dialogResult = { reason: '' };
    sessionStorage.clear();

    TestBed.configureTestingModule({
      imports: [RequestsComponent],
      providers: [
        {
          provide: DonationRequestService,
          useValue: {
            list: (q: DonationRequestQuery) => {
              queries.push(q);
              return respond(q);
            },
            changeStatus,
          },
        },
        { provide: HomeService, useValue: { getBloodTypes: () => of([]), getDonationTypes: () => of([]) } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(dialogResult) }) } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
      ],
    });
    TestBed.inject(SessionSedeService).set({ id: 'sede-1', name: 'Hospital Viedma', access: 'clinical' });
    fixture = TestBed.createComponent(RequestsComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => fixture?.destroy());

  it('loads the four phase columns for the session sede, with their counts', fakeAsync(() => {
    setup();
    fixture.detectChanges();

    const statuses = boardQueries().map((q) => q.status);
    expect(statuses).toEqual(['SearchingDonors', 'DonorsOnTheWay', 'LabValidation', 'Completed']);
    expect(boardQueries().every((q) => q.donationCenterId === 'sede-1')).toBeTrue();
    expect(boardQueries()[3].statusChangedSince).toBeTruthy();

    fixture.detectChanges();
    const counts = Array.from(fixture.nativeElement.querySelectorAll('[data-testid="column-count"]')).map((e) => (e as HTMLElement).textContent?.trim());
    expect(counts).toEqual(['3', '0', '0', '0']);
    expect(text('active-count')).toBe('3 Activas');
    discardPeriodicTasks();
  }));

  it('sends the filters to the API, debounced: quick changes make one query', fakeAsync(() => {
    setup();
    fixture.detectChanges();
    queries = [];

    component.onFiltersChange({ ...EMPTY_FILTERS, urgency: 'Priority' });
    component.onFiltersChange({ ...EMPTY_FILTERS, urgency: 'CodeRed', bloodTypeIds: ['bt-o-neg'] });
    tick(FILTER_DEBOUNCE_MS - 1);
    expect(boardQueries().length).toBe(0);
    tick(1);

    expect(boardQueries().length).toBe(4);
    expect(boardQueries().every((q) => q.urgency === 'CodeRed' && q.bloodTypeId?.[0] === 'bt-o-neg')).toBeTrue();
    discardPeriodicTasks();
  }));

  it('a phase filter queries only that column', fakeAsync(() => {
    setup();
    fixture.detectChanges();
    queries = [];
    component.onFiltersChange({ ...EMPTY_FILTERS, status: 'LabValidation' });
    tick(FILTER_DEBOUNCE_MS);
    expect(boardQueries().map((q) => q.status)).toEqual(['LabValidation']);
    discardPeriodicTasks();
  }));

  it('drops a stale response and keeps the spinner until the latest one arrives', fakeAsync(() => {
    setup();
    const slow = new Subject<DonationRequestPage>();
    const fast = new Subject<DonationRequestPage>();
    let round = 0;
    respond = (q) => {
      if (q.urgency === 'CodeRed' && q.open) return of(pageOf([]));
      if (q.status !== 'SearchingDonors') return of(pageOf([]));
      round++;
      return round === 1 ? slow : fast;
    };
    fixture.detectChanges();
    expect(component.loading()).toBeTrue();

    component.onFiltersChange({ ...EMPTY_FILTERS, component: 'BoneMarrow' });
    tick(FILTER_DEBOUNCE_MS);
    expect(component.loading()).toBeTrue();

    fast.next(pageOf([aRequest({ id: 'new', code: 'REQ-2' })], 1));
    fast.complete();
    expect(component.loading()).toBeFalse();

    slow.next(pageOf([aRequest({ id: 'old', code: 'REQ-1' })], 9));
    slow.complete();
    expect(component.columns()[0].items.map((i) => i.id)).toEqual(['new']);
    expect(component.loading()).toBeFalse();
    discardPeriodicTasks();
  }));

  it('shows an explicit empty state with "Limpiar filtros", which reloads everything', fakeAsync(() => {
    setup();
    fixture.detectChanges();
    respond = () => of(pageOf([]));
    component.onFiltersChange({ ...EMPTY_FILTERS, urgency: 'Standard' });
    tick(FILTER_DEBOUNCE_MS);
    fixture.detectChanges();

    expect(text('empty-state')).toContain('Ninguna solicitud coincide');
    queries = [];
    (fixture.nativeElement.querySelector('[data-testid="empty-clear"]') as HTMLButtonElement).click();
    tick();
    expect(component.filters()).toEqual(EMPTY_FILTERS);
    expect(boardQueries().length).toBe(4);
    expect(boardQueries().every((q) => !q.urgency)).toBeTrue();
    discardPeriodicTasks();
  }));

  it('moves a card optimistically after confirming, and keeps the server version', fakeAsync(() => {
    setup();
    fixture.detectChanges();
    const saved = new Subject<DonationRequest>();
    changeStatus.and.returnValue(saved);
    const card = component.columns()[0].items[0];

    component.requestMove({ request: card, to: 'DonorsOnTheWay' });

    expect(changeStatus).toHaveBeenCalledWith(card.id, 'DonorsOnTheWay', '');
    expect(component.columns()[0].items.length).toBe(0);
    expect(component.columns()[1].items[0].id).toBe(card.id);
    expect(component.columns()[0].total).toBe(2);
    expect(component.columns()[1].total).toBe(1);

    saved.next(aRequest({ status: 'DonorsOnTheWay', allowedNextStatuses: ['LabValidation'] }));
    saved.complete();
    expect(component.columns()[1].items[0].allowedNextStatuses).toEqual(['LabValidation']);
    discardPeriodicTasks();
  }));

  it('rolls the card back when the API refuses the move', fakeAsync(() => {
    setup();
    fixture.detectChanges();
    changeStatus.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { detail: 'Otra persona la movió.' } })));
    const card = component.columns()[0].items[0];

    component.requestMove({ request: card, to: 'DonorsOnTheWay' });

    expect(component.columns()[0].items[0].id).toBe(card.id);
    expect(component.columns()[0].total).toBe(3);
    expect(component.columns()[1].items.length).toBe(0);
    expect(TestBed.inject(MatSnackBar).open).toHaveBeenCalledWith('Otra persona la movió.', 'Cerrar', jasmine.any(Object));
    discardPeriodicTasks();
  }));

  it('does nothing when the move is not confirmed', fakeAsync(() => {
    setup();
    fixture.detectChanges();
    dialogResult = undefined;
    component.requestMove({ request: component.columns()[0].items[0], to: 'DonorsOnTheWay' });
    expect(changeStatus).not.toHaveBeenCalled();
    expect(component.columns()[0].items.length).toBe(1);
    discardPeriodicTasks();
  }));

  it('a published request appears first in Buscando Donantes without reloading', fakeAsync(() => {
    setup();
    fixture.detectChanges();
    dialogResult = aRequest({ id: 'created', code: 'REQ-9999' });
    queries = [];

    component.openPublish();

    const first = component.columns()[0];
    expect(first.items[0].id).toBe('created');
    expect(first.total).toBe(4);
    expect(boardQueries().length).toBe(0);
    discardPeriodicTasks();
  }));

  it('shows the network Código Rojo banner with the center and number of requests', fakeAsync(() => {
    setup();
    respond = (q) => (q.urgency === 'CodeRed' && q.open ? of(pageOf([aRequest(), aRequest({ id: 'x' })])) : of(pageOf([])));
    fixture.detectChanges();
    fixture.detectChanges();

    const banner = text('code-red-banner');
    expect(banner).toContain('Hosp. Gral. Metropolitano');
    expect(banner).toContain('2 solicitudes');
    const bannerQuery = queries.find((q) => q.urgency === 'CodeRed' && q.open)!;
    expect(bannerQuery.donationCenterId).toBeUndefined();
    discardPeriodicTasks();
  }));

  it('"Registro Clínico" shows the same filtered data as a paginated table', fakeAsync(() => {
    setup();
    fixture.detectChanges();
    component.onFiltersChange({ ...EMPTY_FILTERS, component: 'PlateletsApheresis' });
    tick(FILTER_DEBOUNCE_MS);
    respond = () => of(pageOf([aRequest()], 25));
    queries = [];

    component.setView('table');
    fixture.detectChanges();

    const q = boardQueries()[0];
    expect(q).toEqual(jasmine.objectContaining({ component: 'PlateletsApheresis', page: 1, pageSize: 10, donationCenterId: 'sede-1' }));
    expect(q.status).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[data-testid="table-row"]').length).toBe(1);

    component.onTablePage({ page: 2, pageSize: 10 });
    expect(boardQueries().at(-1)?.page).toBe(2);
    discardPeriodicTasks();
  }));
});
