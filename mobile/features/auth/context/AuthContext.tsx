import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { jwtDecode } from "jwt-decode";
import { useKeycloakAuth } from "../hooks/useKeycloakAuth";
import { loadTokens, saveTokens, clearTokens } from "../services/tokenStorage.service";
import { setAccessToken } from "../services/authToken.store";
import { KEYCLOAK_CLIENT_ID } from "../config/keycloak.config";
import { AuthTokens, AuthUser } from "../models/auth.types";

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeUser(idToken: string): AuthUser {
  const claims = jwtDecode<Record<string, unknown>>(idToken);
  return {
    sub: String(claims.sub ?? ""),
    email: claims.email as string | undefined,
    name: claims.name as string | undefined,
    picture: claims.picture as string | undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { request, response, promptAsync, discovery, redirectUri } = useKeycloakAuth();

  const applyTokens = useCallback(async (nextTokens: AuthTokens) => {
    setTokens(nextTokens);
    setAccessToken(nextTokens.accessToken);
    await saveTokens(nextTokens);
    if (nextTokens.idToken) {
      setUser(decodeUser(nextTokens.idToken));
    }
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await loadTokens();
      if (stored) {
        setTokens(stored);
        setAccessToken(stored.accessToken);
        if (stored.idToken) setUser(decodeUser(stored.idToken));
      }
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!response || !discovery || !request) return;

    (async () => {
      try {
        if (response.type === "success") {
          const result = await AuthSession.exchangeCodeAsync(
            {
              clientId: KEYCLOAK_CLIENT_ID,
              code: response.params.code,
              redirectUri,
              extraParams: { code_verifier: request.codeVerifier ?? "" },
            },
            discovery
          );

          await applyTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            idToken: result.idToken,
            expiresAt: Date.now() + (result.expiresIn ?? 300) * 1000,
          });
          setError(null);
        } else if (response.type === "error") {
          setError(response.error?.message ?? "Sign-in failed. Please try again.");
        }
      } catch {
        setError("Sign-in failed. Please try again.");
      } finally {
        setIsAuthenticating(false);
      }
    })();
  }, [response, discovery, request, redirectUri, applyTokens]);

  const login = useCallback(async () => {
    setError(null);
    setIsAuthenticating(true);
    try {
      await promptAsync();
    } catch {
      setError("Unable to open the sign-in page. Please try again.");
      setIsAuthenticating(false);
    }
  }, [promptAsync]);

  const logout = useCallback(async () => {
    if (discovery?.revocationEndpoint && tokens?.refreshToken) {
      try {
        await fetch(discovery.revocationEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `token=${encodeURIComponent(tokens.refreshToken)}&token_type_hint=refresh_token&client_id=${encodeURIComponent(KEYCLOAK_CLIENT_ID)}`,
        });
      } catch {
        // best-effort revocation; local sign-out proceeds regardless
      }
    }
    await clearTokens();
    setAccessToken(null);
    setTokens(null);
    setUser(null);
  }, [discovery, tokens]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticating,
      isAuthenticated: !!tokens?.accessToken,
      user,
      error,
      login,
      logout,
    }),
    [isLoading, isAuthenticating, tokens, user, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
