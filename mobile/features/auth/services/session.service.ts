import { KEYCLOAK_CLIENT_ID, KEYCLOAK_ISSUER } from "../config/keycloak.config";
import { AuthTokens } from "../models/auth.types";
import { setAccessToken } from "./authToken.store";
import { clearTokens, loadTokens, saveTokens } from "./tokenStorage.service";

/**
 * The signed-in session (US-MOB-09). Single source of truth for the tokens: AuthContext mirrors
 * it for the UI and api/axios.ts reads it for every request.
 *
 * - An expired access token is renewed with the refresh token, once, however many requests
 *   need it at the same time.
 * - When Keycloak rejects the refresh token (expired, revoked, user logged out elsewhere) the
 *   session ends and the app shows the login screen.
 * - A network error while refreshing keeps the session: being offline is not a reason to log out.
 */

/** Renew this long before the real expiry, so a token never expires mid-request. */
export const EXPIRY_MARGIN_MS = 30_000;

export type SessionEndReason = "logout" | "expired";
type Listener = (tokens: AuthTokens | null, reason?: SessionEndReason) => void;

let current: AuthTokens | null = null;
let refreshing: Promise<AuthTokens | null> | null = null;
let listener: Listener | null = null;

/** Keycloak answered and said no: the refresh token can't be used again. */
export class RefreshRejectedError extends Error {}

export function isExpired(tokens: AuthTokens, now = Date.now()): boolean {
  return tokens.expiresAt - EXPIRY_MARGIN_MS <= now;
}

export function getSession(): AuthTokens | null {
  return current;
}

/** AuthContext subscribes here to re-render on sign-in, refresh and sign-out. */
export function onSessionChange(next: Listener | null) {
  listener = next;
}

export async function startSession(tokens: AuthTokens) {
  current = tokens;
  setAccessToken(tokens.accessToken);
  listener?.(tokens);
  await saveTokens(tokens);
}

export async function endSession(reason: SessionEndReason) {
  const hadSession = current !== null;
  current = null;
  setAccessToken(null);
  await clearTokens();
  if (hadSession) listener?.(null, reason);
}

/** Calls Keycloak's token endpoint with grant_type=refresh_token. */
export async function requestRefresh(refreshToken: string, previous?: AuthTokens | null): Promise<AuthTokens> {
  const response = await fetch(`${KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      `grant_type=refresh_token&client_id=${encodeURIComponent(KEYCLOAK_CLIENT_ID)}` +
      `&refresh_token=${encodeURIComponent(refreshToken)}`,
  });
  if (!response.ok) throw new RefreshRejectedError(`Token refresh rejected (${response.status})`);

  const body = await response.json();
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? refreshToken,
    idToken: body.id_token ?? previous?.idToken,
    expiresAt: Date.now() + (body.expires_in ?? 300) * 1000,
  };
}

/**
 * Renews the access token. Concurrent callers share one request. Resolves to the new tokens,
 * or null when it couldn't (the session is ended only if Keycloak rejected the refresh token).
 */
export function refreshSession(): Promise<AuthTokens | null> {
  if (!refreshing) {
    refreshing = (async () => {
      const session = current;
      if (!session?.refreshToken) {
        await endSession("expired");
        return null;
      }
      try {
        const next = await requestRefresh(session.refreshToken, session);
        if (current !== session) return current; // signed out (or in again) meanwhile
        await startSession(next);
        return next;
      } catch (error) {
        if (error instanceof RefreshRejectedError && current === session) await endSession("expired");
        return null;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

/** The access token to send now, renewed first if it is about to expire. */
export async function getFreshAccessToken(): Promise<string | null> {
  if (current && isExpired(current)) await refreshSession();
  return current?.accessToken ?? null;
}

/** On app start: loads the saved session and renews it if it expired while the app was closed. */
export async function restoreSession(): Promise<AuthTokens | null> {
  let stored: AuthTokens | null = null;
  try {
    stored = await loadTokens();
  } catch {
    await clearTokens(); // unreadable entry: start clean
  }
  if (!stored?.accessToken) return null;

  current = stored;
  setAccessToken(stored.accessToken);
  if (isExpired(stored)) await refreshSession();
  return current;
}
