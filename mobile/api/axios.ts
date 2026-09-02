import axios from "axios";
import Constants from "expo-constants";
import { getAccessToken } from "@/features/auth/services/authToken.store";

const API_URL = Constants.expoConfig?.extra?.API_URL ??
  "http://192.168.0.5:7140";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
