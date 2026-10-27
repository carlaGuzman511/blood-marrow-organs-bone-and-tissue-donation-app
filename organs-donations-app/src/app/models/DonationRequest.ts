import { BloodType, DonationCenter, PagedResult } from './DonationPost';

/** Clinical donation requests: /api/donation-requests (US-API-01/02). Enums travel as text. */
export type Urgency = 'Standard' | 'Priority' | 'CodeRed';
export type BloodComponent = 'WholeBlood' | 'PlateletsApheresis' | 'BoneMarrow' | 'OrganTissue';
export type RequestStatus = 'SearchingDonors' | 'DonorsOnTheWay' | 'LabValidation' | 'Completed' | 'Cancelled';

export type RequestAuthor = { id: string; fullName: string; image?: string };

export type PatientDetails = {
  patientCode: string;
  patientAge?: number | null;
  diagnosis?: string | null;
  service?: string | null;
  bed?: string | null;
  medicalRecord?: string | null;
  coordinationPhone?: string | null;
};

export type DonationRequest = {
  id: string;
  folio: number;
  /** "REQ-8902" */
  code: string;
  title: string;
  description: string;
  image: string;
  urgency: Urgency;
  component: BloodComponent;
  status: RequestStatus;
  bloodType: BloodType;
  donationType: { id: string; name: string };
  donationCenter?: DonationCenter | null;
  author?: RequestAuthor | null;
  unitsRequired: number;
  unitsCovered: number;
  progressPercent: number;
  deadline?: string | null;
  /** Seconds left when the response was built; negative when overdue, null when closed. */
  remainingSeconds?: number | null;
  isOverdue: boolean;
  statusChangedAt?: string | null;
  statusChangedBy?: RequestAuthor | null;
  /** Phases the caller may move it to now: the board's valid drop targets. */
  allowedNextStatuses: RequestStatus[];
  createdAt: string;
  updatedAt: string;
  /** Only for clinical staff, admins and the author. */
  patient?: PatientDetails | null;
};

/** Body of POST /api/donation-requests. */
export type DonationRequestBody = {
  title: string;
  description: string;
  image?: string | null;
  bloodTypeId: string;
  donationTypeId: string;
  donationCenterId: string;
  component: BloodComponent;
  urgency: Urgency;
  unitsRequired: number;
  /** ISO 8601 with offset (UTC). */
  deadline: string;
  patientCode: string;
  patientAge?: number | null;
  diagnosis?: string | null;
  service?: string | null;
  bed?: string | null;
  medicalRecord?: string | null;
  coordinationPhone: string;
};

/** GET /api/donation-requests filters (all applied by the API, never in memory). */
export type DonationRequestQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  urgency?: Urgency | null;
  component?: BloodComponent | null;
  bloodTypeId?: string[];
  status?: RequestStatus | null;
  open?: boolean | null;
  donationCenterId?: string | null;
  statusChangedSince?: string | null;
};

export type DonationRequestPage = PagedResult<DonationRequest>;

// ---------- Labels (Stitch: solicitudes_clinicas_y_urgencias_portal_web) ----------

export const URGENCY_LABELS: Record<Urgency, string> = {
  CodeRed: 'Código Rojo',
  Priority: 'Prioritario',
  Standard: 'Estándar',
};

/** Long labels for selects. */
export const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: 'CodeRed', label: 'Código Rojo (Inmediata / Shock Trauma)' },
  { value: 'Priority', label: 'Prioritario (24 - 48 hrs)' },
  { value: 'Standard', label: 'Cirugía Programada / Estándar' },
];

export const COMPONENT_LABELS: Record<BloodComponent, string> = {
  WholeBlood: 'Sangre Total (Concentrado Eritrocitario)',
  PlateletsApheresis: 'Plaquetas por Aféresis',
  BoneMarrow: 'Médula Ósea / Células Progenitoras',
  OrganTissue: 'Órgano o Tejido (Trasplante)',
};

/** Short labels for cards and tables. */
export const COMPONENT_SHORT_LABELS: Record<BloodComponent, string> = {
  WholeBlood: 'Concentrado Eritrocitario',
  PlateletsApheresis: 'Plaquetas Aféresis',
  BoneMarrow: 'Médula Ósea',
  OrganTissue: 'Órgano / Tejido',
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  SearchingDonors: 'Buscando Donantes',
  DonorsOnTheWay: 'Donantes en Camino',
  LabValidation: 'En Validación Lab',
  Completed: 'Completado',
  Cancelled: 'Cancelada',
};

export const STATUS_OPTIONS: { value: RequestStatus; label: string }[] = [
  { value: 'SearchingDonors', label: 'Buscando Donantes Activos' },
  { value: 'DonorsOnTheWay', label: 'Donantes Confirmados en Camino' },
  { value: 'LabValidation', label: 'En Validación de Laboratorio' },
  { value: 'Completed', label: 'Completado / Despachado' },
];

/** The four columns of the tactical board, in order. */
export const BOARD_COLUMNS: RequestStatus[] = ['SearchingDonors', 'DonorsOnTheWay', 'LabValidation', 'Completed'];
