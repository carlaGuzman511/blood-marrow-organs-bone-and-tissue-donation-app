import { api } from "@/api/axios";
import { DonationPost } from "@/models/App.types";

export const getDonationPosts = async () => {
  const response = await api.get<DonationPost[]>('/api/donation-posts');
  
  return response.data;
}
