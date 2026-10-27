import { useQuery } from "@tanstack/react-query";
import { getDonationCenter, getDonationCenters } from "@/features/donation-centers/services/donationCenter.service";
import { usePagedList } from "@/hooks/usePagedList";

export type DonationCenterFilters = { search?: string; city?: string; donationTypeId?: string };

/** Centers matching the filters, page by page (filtered by the API). */
export function useDonationCenters(filters: DonationCenterFilters = {}) {
  return usePagedList({
    queryKey: ["donation-centers", filters],
    fetchPage: (page) => getDonationCenters({ ...filters, page }),
  });
}

/** One center by id (works for centers on any page). */
export function useDonationCenter(id?: string) {
  return useQuery({
    queryKey: ["donation-center", id],
    queryFn: () => getDonationCenter(id!),
    enabled: !!id,
  });
}
