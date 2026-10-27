import { DonationRequestService } from './services/donation-request.service';
import {
  EMPTY_FILTERS,
  activeFilterCount,
  filtersToQuery,
  formatCountdown,
  matchesFilters,
  secondsLeft,
  summarizeCodeRed,
  toCardView,
} from './request-view';
import { aRequest } from './testing';

describe('request-view', () => {
  it('counts active filter groups (several blood groups are one filter)', () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(activeFilterCount({ urgency: 'CodeRed', component: 'PlateletsApheresis', bloodTypeIds: ['a', 'b'], status: null })).toBe(3);
  });

  it('turns filters into API params, repeating bloodTypeId', () => {
    const query = filtersToQuery({ urgency: 'CodeRed', component: null, bloodTypeIds: ['a', 'b'], status: 'LabValidation' });
    const params = DonationRequestService.toParams(query);
    expect(params.get('urgency')).toBe('CodeRed');
    expect(params.getAll('bloodTypeId')).toEqual(['a', 'b']);
    expect(params.get('status')).toBe('LabValidation');
    expect(params.has('component')).toBeFalse();
  });

  it('knows whether a new request fits the current filters', () => {
    const request = aRequest();
    expect(matchesFilters(request, EMPTY_FILTERS)).toBeTrue();
    expect(matchesFilters(request, { ...EMPTY_FILTERS, urgency: 'Standard' })).toBeFalse();
    expect(matchesFilters(request, { ...EMPTY_FILTERS, bloodTypeIds: ['bt-o-neg'] })).toBeTrue();
  });

  it('counts down on the browser clock from remainingSeconds', () => {
    const view = toCardView(aRequest({ remainingSeconds: 600 }), 1_000_000);
    expect(secondsLeft(view, 1_000_000 + 60_000)).toBe(540);
    expect(secondsLeft(toCardView(aRequest({ remainingSeconds: null })), 0)).toBeNull();
  });

  it('formats the countdown like the Stitch card', () => {
    expect(formatCountdown(35 * 60)).toBe('35m rest.');
    expect(formatCountdown(18 * 3600)).toBe('18h rest.');
    expect(formatCountdown(2 * 3600 + 5 * 60)).toBe('2h 5m rest.');
    expect(formatCountdown(-5 * 60)).toBe('Vencida hace 5m');
    expect(formatCountdown(null)).toBeNull();
  });

  it('summarizes the Código Rojo banner by center', () => {
    const a = { id: 'a', name: 'Hospital A', address: '', image: '', city: '', latitude: 0, longitude: 0 };
    const b = { ...a, id: 'b', name: 'Hospital B' };
    const summary = summarizeCodeRed([
      aRequest({ id: '1', donationCenter: a }),
      aRequest({ id: '2', donationCenter: a }),
      aRequest({ id: '3', donationCenter: b }),
      aRequest({ id: '4', urgency: 'Priority', donationCenter: b }),
    ]);
    expect(summary).toEqual({ centerName: 'Hospital A', count: 2, total: 4, otherCenters: 1 });
    expect(summarizeCodeRed([aRequest({ urgency: 'Standard' })])).toBeNull();
  });
});
