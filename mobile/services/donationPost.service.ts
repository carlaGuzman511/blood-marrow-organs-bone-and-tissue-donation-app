import { api } from "@/api/axios";
import { DonationPost } from "@/models/App.types";
import { DonationPostFormData } from "@/schemas/donationPost.schema";

export const getDonationPosts = async () => {
  const response = await api.get<DonationPost[]>('/api/donation-posts');
  
  return response.data;
}

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