import { api } from "@/api/axios";
import { Donation } from "@/models/App.types";

export const getDonationTypes = async () => {
  const response = await api.get<Donation[]>('/api/donation-types');
  
  return response.data;
}
