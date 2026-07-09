import { api } from "@/api/axios";
import { DonationCenter } from "@/models/App.types";

export const getDonationCenters = async () => {
  const response = await api.get<DonationCenter[]>('/api/donation-centers');
  
  return response.data;
}
