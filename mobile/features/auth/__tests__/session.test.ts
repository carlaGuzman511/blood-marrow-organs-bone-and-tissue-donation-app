import { AxiosAdapter, AxiosError } from "axios";
import { AuthTokens } from "../models/auth.types";

const store: { saved: AuthTokens | null } = { saved: null };
jest.mock("../services/tokenStorage.service", () => ({
  saveTokens: jest.fn(async (t: AuthTokens) => { store.saved = t; }),
  loadTokens: jest.fn(async () => store.saved),
  clearTokens: jest.fn(async () => { store.saved = null; }),
}));
jest.mock("../config/keycloak.config", () => ({
  KEYCLOAK_CLIENT_ID: "mobile",
  KEYCLOAK_ISSUER: "https://auth.test/realms/r",
}));

const HOUR = 3_600_000;
const tokens = (over: Partial<AuthTokens> = {}): AuthTokens => ({
  accessToken: "old-access",
  refreshToken: "old-refresh",
  idToken: "id",
  expiresAt: Date.now() + HOUR,
  ...over,
});

const okRefresh = () =>
  ({ ok: true, status: 200, json: async () => ({ access_token: "new-access", refresh_token: "new-refresh", expires_in: 300 }) }) as Response;
const rejectedRefresh = () => ({ ok: false, status: 400, json: async () => ({ error: "invalid_grant" }) }) as Response;

let fetchMock: jest.Mock;
let session: typeof import("../services/session.service");
let listener: jest.Mock;

beforeEach(() => {
  jest.resetModules();
  store.saved = null;
  fetchMock = jest.fn();
  global.fetch = fetchMock;
  session = require("../services/session.service");
  listener = jest.fn();
  session.onSessionChange(listener);
});

describe("restoreSession", () => {
  it("keeps a saved session that is still valid, without calling Keycloak", async () => {
    store.saved = tokens();
    const restored = await session.restoreSession();
    expect(restored?.accessToken).toBe("old-access");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renews a session that expired while the app was closed", async () => {
    store.saved = tokens({ expiresAt: Date.now() - 1000 });
    fetchMock.mockResolvedValue(okRefresh());

    const restored = await session.restoreSession();

    expect(restored?.accessToken).toBe("new-access");
    expect(store.saved?.refreshToken).toBe("new-refresh");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://auth.test/realms/r/protocol/openid-connect/token");
    expect(init.body).toContain("grant_type=refresh_token");
    expect(init.body).toContain("refresh_token=old-refresh");
  });

  it("drops the session when Keycloak rejects the refresh token", async () => {
    store.saved = tokens({ expiresAt: Date.now() - 1000 });
    fetchMock.mockResolvedValue(rejectedRefresh());

    expect(await session.restoreSession()).toBeNull();
    expect(store.saved).toBeNull();
    expect(listener).toHaveBeenLastCalledWith(null, "expired");
  });

  it("keeps the session when offline, so the user is not logged out for a network error", async () => {
    store.saved = tokens({ expiresAt: Date.now() - 1000 });
    fetchMock.mockRejectedValue(new TypeError("Network request failed"));

    expect((await session.restoreSession())?.accessToken).toBe("old-access");
    expect(store.saved).not.toBeNull();
  });

  it("drops an expired session that has no refresh token", async () => {
    store.saved = tokens({ expiresAt: Date.now() - 1000, refreshToken: undefined });
    expect(await session.restoreSession()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("refreshSession", () => {
  it("sends one refresh request however many callers ask at once", async () => {
    await session.startSession(tokens());
    fetchMock.mockResolvedValue(okRefresh());

    const results = await Promise.all([session.refreshSession(), session.refreshSession(), session.refreshSession()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(results.map((t) => t?.accessToken)).toEqual(["new-access", "new-access", "new-access"]);
  });

  it("renews a token that is about to expire before it is sent", async () => {
    await session.startSession(tokens({ expiresAt: Date.now() + 5_000 }));
    fetchMock.mockResolvedValue(okRefresh());
    expect(await session.getFreshAccessToken()).toBe("new-access");
  });
});

describe("api 401 handling", () => {
  function apiWith(statuses: number[]) {
    const { api } = require("@/api/axios");
    const seen: (string | undefined)[] = [];
    const adapter: AxiosAdapter = async (config) => {
      seen.push(config.headers?.Authorization as string | undefined);
      const status = statuses.shift() ?? 200;
      const response = { data: {}, status, statusText: "", headers: {}, config };
      if (status >= 400) throw new AxiosError("fail", String(status), config, null, response);
      return response;
    };
    api.defaults.adapter = adapter;
    return { api, seen };
  }

  it("renews the token and retries the call once", async () => {
    await session.startSession(tokens());
    fetchMock.mockResolvedValue(okRefresh());
    const { api, seen } = apiWith([401, 200]);

    await expect(api.get("/api/donors")).resolves.toMatchObject({ status: 200 });
    expect(seen).toEqual(["Bearer old-access", "Bearer new-access"]);
  });

  it("ends the session (back to login) when the refresh token is rejected", async () => {
    await session.startSession(tokens());
    fetchMock.mockResolvedValue(rejectedRefresh());
    const { api } = apiWith([401]);

    await expect(api.get("/api/donors")).rejects.toMatchObject({ response: { status: 401 } });
    expect(session.getSession()).toBeNull();
    expect(listener).toHaveBeenLastCalledWith(null, "expired");
  });

  it("ends the session when the call is still 401 after a successful refresh", async () => {
    await session.startSession(tokens());
    fetchMock.mockResolvedValue(okRefresh());
    const { api } = apiWith([401, 401]);

    await expect(api.get("/api/donors")).rejects.toMatchObject({ response: { status: 401 } });
    expect(session.getSession()).toBeNull();
  });

  it("does not touch the session on other errors", async () => {
    await session.startSession(tokens());
    const { api } = apiWith([500]);

    await expect(api.get("/api/donors")).rejects.toMatchObject({ response: { status: 500 } });
    expect(session.getSession()).not.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
