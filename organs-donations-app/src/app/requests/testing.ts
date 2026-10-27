import { DonationRequest } from '../models/DonationRequest';

/** A request as the API returns it, for specs. */
export function aRequest(overrides: Partial<DonationRequest> = {}): DonationRequest {
  return {
    id: 'r-1',
    folio: 8902,
    code: 'REQ-8902',
    title: 'Plaquetas Aféresis · Paciente PX-4912',
    description: 'Trauma',
    image: '',
    urgency: 'CodeRed',
    component: 'PlateletsApheresis',
    status: 'SearchingDonors',
    bloodType: { id: 'bt-o-neg', name: 'O-', image: '' },
    donationType: { id: 'dt-blood', name: 'Sangre' },
    donationCenter: { id: 'c-1', name: 'Hosp. Gral. Metropolitano', address: '', image: '', city: 'X', latitude: 0, longitude: 0 },
    unitsRequired: 4,
    unitsCovered: 1,
    progressPercent: 25,
    deadline: '2026-10-26T12:00:00Z',
    remainingSeconds: 35 * 60,
    isOverdue: false,
    allowedNextStatuses: ['DonorsOnTheWay', 'Cancelled'],
    createdAt: '2026-10-26T10:00:00Z',
    updatedAt: '2026-10-26T10:00:00Z',
    patient: { patientCode: 'PX-4912', diagnosis: 'Trauma Shock', service: 'Quirófano Central 3', bed: 'UCI-04', medicalRecord: 'EXP-1', coordinationPhone: '777' },
    ...overrides,
  };
}

export const pageOf = (items: DonationRequest[], totalCount = items.length) => ({
  items,
  totalCount,
  page: 1,
  pageSize: 50,
  totalPages: 1,
});
