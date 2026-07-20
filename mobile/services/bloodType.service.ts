import { api } from "@/api/axios";
import { BloodType } from "@/models/App.types";

export const getBloodTypes = async () => {
  const response = await api.get<BloodType[]>('/api/blood-types');

  return response.data;
}
