import axios from "axios";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL ??
  "http://192.168.0.5:7140";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
