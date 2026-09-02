import * as SecureStore from "expo-secure-store";
import { AuthTokens } from "../models/auth.types";

const STORAGE_KEY = "keycloak_auth_tokens";

export async function saveTokens(tokens: AuthTokens) {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokens));
}

export async function loadTokens(): Promise<AuthTokens | null> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}
