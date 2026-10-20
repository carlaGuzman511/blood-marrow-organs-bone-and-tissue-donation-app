import { api } from "@/api/axios";
import { Donor } from "@/models/App.types";

export const getDonors = async () => {
  const response = await api.get<Donor[]>('/api/donors');

  return response.data;
}
