import { useQuery } from "@tanstack/react-query";
import { getDonor, getDonors } from "@/features/donors/hooks/user.service";
import { usePagedList } from "@/hooks/usePagedList";

export type DonorFilters = { search?: string; bloodTypeId?: string; city?: string };

/** Donors matching the filters, page by page (filtered by the API). */
export function useDonors(filters: DonorFilters = {}, enabled = true) {
  return usePagedList({
    queryKey: ["donors", filters],
    fetchPage: (page) => getDonors({ ...filters, page }),
    enabled,
  });
}

/** One donor by id (works for donors on any page). */
export function useDonor(id?: string) {
  return useQuery({
    queryKey: ["donor", id],
    queryFn: () => getDonor(id!),
    enabled: !!id,
  });
}
