import { api } from "@/api/axios";
import { getPage, PageQuery } from "@/api/paging";
import { DonationPost, PagedResult } from "@/models/App.types";
import { DonationPostFormData } from "@/schemas/donationPost.schema";

/** One page of the feed. Filters: search (title or description), bloodTypeId, donationTypeId, priority. */
export const getDonationPosts = (query: PageQuery = {}): Promise<PagedResult<DonationPost>> =>
  getPage<DonationPost>('/api/donation-posts', query);

export const createDonationPost = async (data: DonationPostFormData): Promise<DonationPost> => {
  const payload = {
    city: data.city,
    hospital: data.hospital,
    bloodType: data.bloodType,
    mobile: data.mobile,
    note: data.note,
  };
  const response = await api.post<DonationPost>("/api/donation-posts", payload);

  return response.data;
};