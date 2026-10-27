import { api } from "@/api/axios";
import { getPage, PageQuery } from "@/api/paging";
import { Donor, PagedResult } from "@/models/App.types";

/** One page of donors (public fields only). Filters: search (name), bloodTypeId, city. */
export const getDonors = (query: PageQuery = {}): Promise<PagedResult<Donor>> =>
  getPage<Donor>('/api/donors', query);

export const getDonor = async (id: string): Promise<Donor> => {
  const response = await api.get<Donor>(`/api/donors/${id}`);
  return response.data;
}
