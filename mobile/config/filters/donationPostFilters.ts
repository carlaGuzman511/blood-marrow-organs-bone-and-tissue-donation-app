import { BLOOD_TYPE_FILTER } from './bloodTypeFilter';
import { SERVICE_FILTER } from './servicesFilter';
import type { FilterGroup } from '@/models/Search.types';

export const DONATION_POST_FILTERS: FilterGroup[] = [
  BLOOD_TYPE_FILTER,
  SERVICE_FILTER,
];
