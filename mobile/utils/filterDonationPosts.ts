import type { DonationPost } from '@/models/App.types';
import type { SearchFilters } from '../models/Search.types';
import { normalize } from '@/utils/normalize';

/**
 * Search and blood type are filtered by the API. Only the "service" chip runs here, on the
 * loaded pages: its labels ("Blood Donation") don't match the API's donation type names yet.
 */
export function filterDonationPosts(post: DonationPost, filters: SearchFilters): boolean {
  const service = normalize(filters.values.service);

  return !service || normalize(post.donationType?.name).includes(service);
}
