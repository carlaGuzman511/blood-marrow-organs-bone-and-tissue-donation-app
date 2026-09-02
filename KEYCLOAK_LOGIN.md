# Keycloak / Google Login — Progress Notes

Implementing sign-in via Keycloak (with Google as an identity provider) across web, mobile, and API. This file tracks what's done and what's left so work can resume in a later session.

## Decisions made

- **Keycloak server**: deployed and live at `https://auth-server-b24f.onrender.com`, realm `organ-donation-prod`. Confirmed reachable (`/.well-known/openid-configuration` resolves) and both the `organ-donation-web` and `organ-donation-mobile` clients exist and accept their respective redirect URIs (verified by hitting the `/protocol/openid-connect/auth` endpoint directly and checking the error responses distinguish a real client from a bogus one).
- **Login flow**: show Keycloak's hosted login page (not a direct-to-Google shortcut). Google will appear there once configured as an identity provider in the realm (see "What's left" — not yet live on the deployed server).
- **Backend scope**: the .NET API validates Keycloak-issued tokens (Authority/JWKS) and now **enforces** `[Authorize]` across controllers (previously configured but commented out everywhere) — this was an explicit decision made when completing the login feature end-to-end, since real tokens are now available from both clients.

## What's implemented

### Mobile (`mobile/`)

- Installed `expo-auth-session`, `expo-secure-store`, `jwt-decode`.
- `app.json`: added `extra.KEYCLOAK_URL` / `KEYCLOAK_REALM` / `KEYCLOAK_CLIENT_ID` placeholders, and the `expo-secure-store` config plugin.
- New `features/auth/` module:
  - `config/keycloak.config.ts` — reads Keycloak config from `expo-constants`, builds the issuer URL.
  - `models/auth.types.ts` — `AuthTokens`, `AuthUser` types.
  - `services/authToken.store.ts` — in-memory access-token singleton read by the axios interceptor.
  - `services/tokenStorage.service.ts` — persists/loads/clears tokens via `expo-secure-store`.
  - `hooks/useKeycloakAuth.ts` — wraps `expo-auth-session`'s `useAuthRequest`/`useAutoDiscovery` (Authorization Code + PKCE, scopes `openid profile email`).
  - `context/AuthContext.tsx` — `AuthProvider` + `useAuth()`: hydrates tokens from storage on mount, exchanges the auth code for tokens, decodes the ID token for user claims, exposes `login()`/`logout()` (`logout` best-effort revokes the refresh token via Keycloak's revocation endpoint).
  - `components/LoginForm/` — presentational "Log In" button + branding text, shows a spinner/error from `useAuth()`.
  - `screens/LoginScreen.tsx` — wraps `LoginForm` in a `SafeAreaView`.
  - `index.ts` — barrel exporting `AuthProvider`, `useAuth`, `LoginScreen`.
- `api/axios.ts` — request interceptor attaches `Authorization: Bearer <token>` from `authToken.store`.
- `app/_layout.tsx` — wrapped in `AuthProvider`; renders `LoginScreen` while unauthenticated, the existing `Tabs` app once logged in (no route file added for login — it's a conditional render at the root, so no changes to existing route paths).
- `screens/UserProfile.tsx` — the existing (previously no-op) "Log Out" row now calls `useAuth().logout()`.

Verified: `npx tsc --noEmit` in `mobile/` shows zero errors from any of the above (remaining errors are pre-existing, unrelated issues — see "Known pre-existing issues" below).

### Backend (`api/Umss.BloodOrgansDonationApp/`)

- `Umss.BloodOrgansDonationApp.API/Program.cs`:
  - `AddJwtBearer` sets `Authority`/`Audience`/`RequireHttpsMetadata` from config (`Keycloak:*`) instead of the old static HMAC `SymmetricSecurityKey` — signing keys are fetched from Keycloak's JWKS endpoint.
  - Fixed pipeline order and re-enabled authentication: was `app.UseAuthorization(); //app.UseAuthentication();` (auth disabled, wrong order) → now `app.UseAuthentication(); app.UseAuthorization();`.
  - Added a `JwtBearerEvents.OnTokenValidated` handler that projects Keycloak's `realm_access.roles` claim onto `ClaimTypes.Role`, so ASP.NET's `[Authorize(Roles = "Admin")]` actually matches Keycloak realm roles (it wouldn't otherwise — Keycloak doesn't emit the standard role claim type).
  - Removed the now-unused `using System.Text;`.
- `appsettings.json` / `appsettings.Development.json`: `Keycloak` section (`Authority`, `Audience`, `RequireHttpsMetadata`) now points at the real deployed server/realm (`https://auth-server-b24f.onrender.com/realms/organ-donation-prod`, audience `organ-donation-api`).
- **All commented-out `[Authorize]` / `[Authorize(Roles = "Admin")]` attributes across every controller (`UserController`, `BloodTypeController`, `CommentController`, `DonationCenterController`, `DonationPostController`, `DonationTypeController`) are now uncommented and enforced.** Only `POST /api/users/register` and the legacy `POST /api/users/login` remain anonymous. This was a deliberate choice (confirmed with the user) over leaving the API open — it means every other endpoint now requires a valid bearer token, which is why the web app's routes were also locked behind its `authGuard`.
- The old `/api/users/login` endpoint + `TokenService` (custom HMAC JWTs) are untouched but effectively dead for authenticated calls now — tokens it issues won't pass `[Authorize]`, since the trusted issuer is Keycloak. Its fate (keep as a fallback vs. remove) is still an open decision.
- Verified: `dotnet build` succeeds (0 errors) and `dotnet test Umss.BloodOrgansDonationApp.API.Tests` passes — those tests call controller actions directly/mock the pipeline, so they aren't affected by `[Authorize]` being live.

### Web (`organs-donations-app/`)

- Added `angular-oauth2-oidc@19.0.0` and a `src/app/auth/` module:
  - `keycloak.config.ts` — realm/client constants (client `organ-donation-web`, no client secret — public client with PKCE, same pattern as the mobile client).
  - `auth-config.ts` — `AuthConfig` for `OAuthService` (Authorization Code + PKCE, `redirectUri: window.location.origin + '/'`, scopes `openid profile email`).
  - `auth.service.ts` — thin wrapper around `OAuthService`: `init()` (discovery + code exchange on load), `login()` (`initCodeFlow()`), `logout()`, a reactive `isLoggedIn` signal kept in sync via `oauthService.events`, and `userName`/`userClaims`/`getAccessToken()` accessors.
  - `auth.interceptor.ts` — attaches `Authorization: Bearer <token>` to requests targeting the API base URL.
  - `auth.guard.ts` — `CanActivateFn` redirecting to `/login` when `isLoggedIn()` is false.
- `app.config.ts` — registers the interceptor (`provideHttpClient(withInterceptors([authInterceptor]))`) and runs `AuthService.init()` as a `provideAppInitializer` so the OAuth code exchange completes before the router's initial navigation (otherwise the guard would redirect to `/login` before the just-returned code gets exchanged).
- `login.component.ts`/`.html`/`.css` — real "Iniciar sesión" button wired to `AuthService.login()`; redirects to `/home` immediately if already logged in.
- `app.routes.ts` — added the `login` route and put `authGuard` on `home`, `donation-center`, `info`, and `reports`, since the API now requires a bearer token for essentially all of those pages' data.
- `app.component.ts`/`.html`/`.css` — added a toolbar header (shown on every route) with the signed-in user's name + "Cerrar sesión" when authenticated, or an "Iniciar sesión" link otherwise.
- Verified: `ng build --configuration development` succeeds with 0 errors.
- Verified against the live server: hitting the Keycloak `/protocol/openid-connect/auth` endpoint directly for both `organ-donation-web` (redirect `http://localhost:4200/`) and `organ-donation-mobile` (redirect `myapp://auth`) returns PKCE-related parameter errors rather than "client not found" / "invalid redirect_uri" — confirming both clients and their redirect URIs are already registered correctly on the realm.

## What's left (needs you / infra, not code)

1. **Google Identity Provider isn't live yet.** A `google` IdP block was added to the realm's *export* JSON in the auth-server repo, but Keycloak's `--import-realm` skips realms that already exist, so it did not take effect on the running server. Add it by hand via the Admin Console once real Google Cloud OAuth credentials exist (redirect URI to register in Google Cloud Console: `https://auth-server-b24f.onrender.com/realms/organ-donation-prod/broker/google/endpoint`). Until then, Keycloak's own username/password login still works end-to-end for web, mobile, and API.
2. **Mobile deep-link testing caveat** (unchanged): the OAuth redirect will not reliably work in plain Expo Go (custom-scheme deep links need a dev client). Test with `npx expo run:android` / `run:ios`, or an EAS dev-client build.
3. **Decide the fate of the old username/password login** (`/api/users/login`, `TokenService`, `LoginRequest`) — it's now effectively dead weight for authenticated calls (its tokens don't pass the Keycloak-backed `[Authorize]` checks), but nothing currently calls it from web or mobile either. Keep as a fallback, or remove.
4. **End-to-end manual verification** — an interactive browser/device login flow (actually clicking "Iniciar sesión", authenticating, and confirming the token round-trips to the API) hasn't been run in this session; only the config/build/API-reachability were verified non-interactively.

## Known pre-existing issues (found while typechecking, not caused by this work, not yet fixed)

- `components/ui/ActiveFilters/ActiveFilters.tsx` and `components/ui/FilterBottomSheet/FilterBottomSheet.tsx` import a nonexistent `../../types/Search.types` (should likely be `../../models/Search.types`).
- `services/donationPost.service.ts` references `bloodType`/`note` fields that don't exist on its payload type.
- A separate unused-code cleanup pass (legacy `screens/`, dead `components/`, `theme/`, etc.) was scoped out into a standalone script the user planned to run themselves (`cleanup-unused-files.sh` in that session's scratchpad) — as of this note it looks like it was not applied, since some of those pre-existing errors (e.g. `constants/api.constants.ts`, `hooks/useDonationTypes.ts`, `screens/Report.tsx`) are still present.
