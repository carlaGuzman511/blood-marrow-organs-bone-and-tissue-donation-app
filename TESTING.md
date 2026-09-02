# Testing the Login Feature (Web, API, Mobile)

This is a manual + automated test guide for the Keycloak-based login feature described in
`KEYCLOAK_LOGIN.md`. Use it to verify a build before considering the feature done, and to check
for regressions after touching `Program.cs`, any controller's `[Authorize]` attributes, or the
`auth/`/`features/auth` modules in web/mobile.

Server under test: `https://auth-server-b24f.onrender.com`, realm `organ-donation-prod`.

## 0. Prerequisites

- **A Keycloak test user.** None of the automated checks below can create one (needs realm-admin
  access to the Keycloak Admin Console, which this repo's tooling doesn't have). Before manual
  testing, either:
  - Use the Admin Console to create a user directly in `organ-donation-prod`, or
  - Use the app's own registration screen if the realm has self-registration enabled, or
  - Use a Google account, once Google is wired up as an Identity Provider (see
    `KEYCLOAK_LOGIN.md` — not live yet as of this writing).
- **A note on API lockdown**: almost every endpoint now requires `[Authorize]`. If a test step
  gets an unexpected 401, first confirm you're sending a bearer token at all before assuming the
  feature is broken.

## 1. API (`api/Umss.BloodOrgansDonationApp/`)

### Automated

```bash
cd api/Umss.BloodOrgansDonationApp
dotnet build
dotnet test Umss.BloodOrgansDonationApp.API.Tests
dotnet test Umss.BloodOrgansDonationApp.Service.Tests
```
All three should pass with 0 errors (pre-existing NuGet compatibility warnings are fine).

### Manual: confirm enforcement is live

```bash
# No token -> expect 401
curl -i https://blood-marrow-organs-bone-and-tissue.onrender.com/api/donation-centers

# Bogus token -> expect 401 (not 500)
curl -i -H "Authorization: Bearer not-a-real-token" \
  https://blood-marrow-organs-bone-and-tissue.onrender.com/api/donation-centers
```

### Manual: get a real token and confirm it's accepted

If the `organ-donation-web` or `organ-donation-mobile` client has "Direct Access Grants" enabled
in Keycloak, you can fetch a token straight from the terminal instead of driving a browser:

```bash
curl -s -X POST \
  https://auth-server-b24f.onrender.com/realms/organ-donation-prod/protocol/openid-connect/token \
  -d grant_type=password \
  -d client_id=organ-donation-web \
  -d username=<test-user> \
  -d password=<test-password> \
  -d scope=openid | tee /tmp/token.json

TOKEN=$(jq -r .access_token /tmp/token.json)

# Expect 200 now
curl -i -H "Authorization: Bearer $TOKEN" \
  https://blood-marrow-organs-bone-and-tissue.onrender.com/api/donation-centers
```

If that 400s with `unauthorized_client` / `Client not allowed to initiate browser login with given
response_type`, direct grants aren't enabled for that client — fall back to testing through the
web or mobile app's real browser-based login instead (below), and inspect the `Authorization`
header of an outgoing request in devtools/Charles/Flipper to get a token to reuse in curl.

### Manual: role-gated endpoints

Confirm a non-admin token gets **403** (not 401 — it's authenticated, just not authorized) from
an `[Authorize(Roles = "Admin")]` action, e.g.:

```bash
curl -i -X DELETE -H "Authorization: Bearer $TOKEN" \
  https://blood-marrow-organs-bone-and-tissue.onrender.com/api/blood-types/<some-id>
```

Then assign the `Admin` realm role to the test user in Keycloak, fetch a fresh token, and confirm
the same request now succeeds (or at least stops returning 403 — a 404 for a bad id is fine).

## 2. Web (`organs-donations-app/`)

### Automated

```bash
cd organs-donations-app
npm test          # Karma/Jasmine unit tests
npm run build      # ng build — should complete with 0 errors
```
`ng build` currently prints a bundle-size budget warning (initial bundle ~793 KB vs. the 500 KB
budget) after adding `angular-oauth2-oidc` — that's a warning, not a failure.

### Manual click-through

1. `npm start`, open `http://localhost:4200`.
2. You should be redirected to `/login` (every route is behind `authGuard` except `/login`
   itself) and see the "Iniciar sesión" button.
3. Click it — you should land on Keycloak's hosted login page
   (`auth-server-b24f.onrender.com/realms/organ-donation-prod/...`), not a blank page or an error.
4. Log in with the test user. You should be redirected back to `http://localhost:4200/` and land
   on `/home` with data loaded (confirms the token was exchanged **and** attached to the API call
   by `auth.interceptor.ts`).
5. Check the toolbar: it should show the signed-in user's name/email and a "Cerrar sesión" button
   instead of "Iniciar sesión".
6. Refresh the page (`F5`) while still on `/home` — you should stay logged in and see data load
   again, not bounce back to `/login`. This exercises `AuthService.init()` re-hydrating the
   session from `angular-oauth2-oidc`'s storage on a fresh page load.
7. Click "Cerrar sesión" — you should end up logged out (Keycloak's logout endpoint), and
   navigating back to `/home` should redirect to `/login` again.
8. Open devtools Network tab and inspect an XHR/fetch to
   `blood-marrow-organs-bone-and-tissue.onrender.com/api/...` — confirm it carries an
   `Authorization: Bearer ...` header.

## 3. Mobile (`mobile/`)

### Automated

```bash
cd mobile
npx tsc --noEmit    # should show no NEW errors from features/auth/** or api/axios.ts
npx jest
npx expo export --platform ios --platform android   # bundles for both native platforms
```
Note: `npx expo export --platform web` is expected to **fail** — `react-native-maps` has no web
shim, unrelated to auth. Don't treat that as a login-feature regression.

### Manual click-through

The OAuth redirect needs a real deep link, which plain Expo Go does not reliably support. Use a
dev client:

```bash
npx expo run:android   # or: npx expo run:ios
```

1. Launch the app — you should see `LoginScreen` (the "Log In" button from
   `features/auth/components/LoginForm`).
2. Tap it — the system browser/AuthSession sheet should open on Keycloak's hosted login page.
3. Log in with the test user — you should be redirected back into the app (via the `myapp://auth`
   deep link) and land on the normal `Tabs` navigator instead of the login screen.
4. Kill and relaunch the app — you should still be logged in (confirms
   `tokenStorage.service.ts` persisted the tokens in `expo-secure-store` and
   `AuthContext.tsx` rehydrates them on mount).
5. Go to the Profile tab and tap "Log Out" — you should be dropped back to `LoginScreen`.
6. While logged in, trigger any screen that fetches from the API (e.g. Donation Centers list) and
   confirm it loads data rather than failing silently — this confirms `api/axios.ts`'s interceptor
   is attaching the bearer token from `authToken.store`.

## 4. Known gaps at time of writing

- No interactive browser/device run of the flows above has been performed yet — steps 2's clicks
  are the first real end-to-end check.
- Google as an Identity Provider is not live on the Keycloak server yet (see `KEYCLOAK_LOGIN.md`)
  — only Keycloak's own username/password login can be tested until that's done.
- No automated integration test exercises the full Authorization Code + PKCE round trip against
  the live Keycloak server for any of the three apps; the checklist above is manual until such a
  test is written.
