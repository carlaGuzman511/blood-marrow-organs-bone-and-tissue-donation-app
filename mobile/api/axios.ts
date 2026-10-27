import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { endSession, getFreshAccessToken, getSession, refreshSession } from "@/features/auth/services/session.service";

const API_URL = Constants.expoConfig?.extra?.API_URL ??
  "http://192.168.0.5:7140";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

type RetriableConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };

// Bearer token on every call, renewed first if it is about to expire.
api.interceptors.request.use(async (config) => {
  const token = await getFreshAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401: the token was revoked or expired early. Renew it once and retry the call; if the
// refresh token is rejected, or the retry is still a 401, the session ends and the app
// goes back to the login screen (AuthContext listens to the session).
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined;
  if (error.response?.status !== 401 || !config || !getSession()) throw error;

  if (config._authRetried) {
    await endSession("expired");
    throw error;
  }

  config._authRetried = true;
  const tokens = await refreshSession();
  if (!tokens) throw error;

  config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  return api(config);
});
