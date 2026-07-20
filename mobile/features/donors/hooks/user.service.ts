import { api } from "@/api/axios";
import { User } from "@/models/App.types";

export const getUsers = async () => {
  const response = await api.get<User[]>('/api/users');

  return response.data;
}
