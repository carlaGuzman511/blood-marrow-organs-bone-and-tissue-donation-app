import type { DonationPost } from '@/models/App.types';
import type { SearchFilters } from '../models/Search.types';
import { normalize } from '@/utils/normalize';

export function filterDonationPosts(post: DonationPost, filters: SearchFilters): boolean {
  const query = normalize(filters.search);
  const bloodType = normalize(filters.values.bloodType);
  const service = normalize(filters.values.service);
  const searchableText = [
    post.description,
    post.user?.fullName,
    post.donationCenter?.name,
    post.donationCenter?.address,
    post.donationType?.name,
  ].map(normalize);

  return (
    (!query || searchableText.some((value) => value.includes(query))) &&
    (!bloodType || normalize(post.bloodTypeId ?? post.bloodType?.name) === bloodType) &&
    (!service || normalize(post.donationType?.name).includes(service))
  );
}
