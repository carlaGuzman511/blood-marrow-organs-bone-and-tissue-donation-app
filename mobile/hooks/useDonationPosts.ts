import { getDonationPosts } from "@/services/donationPost.service";
import { usePagedList } from "@/hooks/usePagedList";

export type DonationPostFilters = { search?: string; bloodTypeId?: string; donationTypeId?: string; priority?: boolean };

/** The feed, newest first, page by page (filtered by the API). */
export function useDonationPosts(filters: DonationPostFilters = {}, enabled = true) {
  return usePagedList({
    queryKey: ["donation-posts", filters],
    fetchPage: (page) => getDonationPosts({ ...filters, page }),
    enabled,
  });
}
