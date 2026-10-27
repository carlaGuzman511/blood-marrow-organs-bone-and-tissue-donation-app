import { api } from "@/api/axios";
import { getPage, PageQuery } from "@/api/paging";
import { DonationCenter, PagedResult } from "@/models/App.types";

/** One page of centers. Filters: search (name or address), city, donationTypeId. */
export const getDonationCenters = (query: PageQuery = {}): Promise<PagedResult<DonationCenter>> =>
  getPage<DonationCenter>('/api/donation-centers', query);

export const getDonationCenter = async (id: string): Promise<DonationCenter> => {
  const response = await api.get<DonationCenter>(`/api/donation-centers/${id}`);
  return response.data;
}
