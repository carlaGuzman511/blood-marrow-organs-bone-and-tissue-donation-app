# Local Setup — API, Web and Mobile

How to run the three projects on your machine.

| Project | Folder | Stack | Local URL |
|---|---|---|---|
| API | `api/Umss.BloodOrgansDonationApp/` | .NET 8, EF Core, PostgreSQL | `http://localhost:7140` (Swagger at `/swagger`) |
| Web | `organs-donations-app/` | Angular 19 | `http://localhost:4200` |
| Mobile | `mobile/` | Expo SDK 52 / React Native 0.76 | Expo Dev Server (QR code) |

Login for all three uses the **deployed Keycloak** (`https://auth-server-b24f.onrender.com`, realm `organ-donation-prod`). There is no local Keycloak to run. The server is on Render's free tier, so the first request can take ~1 minute while it wakes up.

Start them in this order: **database → API → web and/or mobile**.

---

## 1. Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20 LTS](https://nodejs.org/) + npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL), or a local PostgreSQL install
- EF Core CLI (only to create migrations): `dotnet tool install --global dotnet-ef`
- Mobile only: [Expo Go](https://expo.dev/go) on your phone, or an Android emulator / iOS simulator

---

## 2. Database (PostgreSQL)

The API's development connection string (`appsettings.Development.json`) expects:

```
Host=localhost;Port=5433;Database=DonationAppDb;Username=postgres;Password=postgres
```

Note the port is **5433**, not the default 5432. Start it with Docker:

```bash
docker run -d --name donation-db -p 5433:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=DonationAppDb postgres:16
```

Later runs: `docker start donation-db`.

You don't need to create tables: **migrations run automatically when the API starts**.

> Known issue: `DataSeeder` fails on an empty database (seeded donation centers are missing `Email`, `OpeningHours` and `Phone`). The error is printed in the API console and nothing is seeded, but the API keeps running.

---

## 3. API (.NET)

```bash
cd api/Umss.BloodOrgansDonationApp
dotnet restore
dotnet run --project Umss.BloodOrgansDonationApp.API --urls "http://0.0.0.0:7140"
```

- `--urls "http://0.0.0.0:7140"` makes the API reachable from both the web app (`localhost:7140`) and a phone on your Wi-Fi (`<your-PC-IP>:7140`). The launch profiles in `launchSettings.json` use port 5254 or a hard-coded LAN IP, which don't match the web/mobile config.
- Open Swagger: http://localhost:7140/swagger
- Almost every endpoint requires a Keycloak bearer token. The easiest way to get one is to log in through the web app.

Useful commands (from `api/Umss.BloodOrgansDonationApp/`):

```bash
dotnet build
dotnet test                                   # all tests
dotnet format Umss.BloodOrgansDonationApp.sln # run before pushing (CI checks it)

# New migration
dotnet ef migrations add <Name> \
  --project Umss.BloodOrgansDonationApp.Repository \
  --startup-project Umss.BloodOrgansDonationApp.API
```

Optional: the Postgres-only tests run when `POSTGRES_TEST_CONNECTION` is set, e.g.
`Host=localhost;Port=5433;Username=postgres;Password=postgres`.

---

## 4. Web (Angular)

```bash
cd organs-donations-app
npm install
npm start          # = ng serve
```

Open http://localhost:4200.

- `ng serve` uses `src/environments/environment.development.ts`, which already points to `http://localhost:7140/api` and the deployed Keycloak. No changes needed.
- `http://localhost:4200/` is a registered redirect URI in Keycloak, so **use port 4200** or login will fail.
- To point the web at the deployed API instead, change `apiUrl` in `environment.development.ts` to `https://blood-marrow-organs-bone-and-tissue.onrender.com/api` (don't commit it).

Other commands: `npm run build`, `npm test`.

---

## 5. Mobile (Expo)

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` / `i` for an emulator/simulator.

### Point the app at your local API

The API URL comes from `extra.API_URL` in `mobile/app.json`, which by default is the **deployed** API. To use your local API:

1. Find your PC's LAN IP: `ipconfig` (Windows) → "IPv4 Address", e.g. `192.168.0.5`.
2. In `mobile/app.json`, set:
   ```json
   "API_URL": "http://192.168.0.5:7140"
   ```
   (no `/api` suffix — the services add it). Don't commit this change.
3. Restart Expo (`npx expo start -c`).
4. Phone and PC must be on the **same Wi-Fi**. `localhost` won't work from a phone. On the Android emulator you can use `http://10.0.2.2:7140`.
5. If the phone can't connect, allow port 7140 in Windows Firewall:
   ```powershell
   New-NetFirewallRule -DisplayName "Donation API 7140" -Direction Inbound -Protocol TCP -LocalPort 7140 -Action Allow
   ```

### Environment variables

`mobile/.env` holds `GOOGLE_MAPS_KEY`. Ask a teammate for the value; never commit it.

### Login

Keycloak's mobile client (`organ-donation-mobile`) redirects to `myapp://auth` (the `scheme` in `app.json`). If login doesn't return to the app in Expo Go, use a development build (`npx expo run:android`).

Other commands: `npm test`, `npm run lint`, `npx tsc --noEmit`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| API won't start: connection refused on 5433 | The database container isn't running: `docker start donation-db`. |
| Every API call returns 401 | You're not logged in, or the token expired. Log in again. Swagger calls need a token too. |
| Login page takes very long | Keycloak on Render is waking up. Wait ~1 minute and retry. |
| Web login fails with "invalid redirect_uri" | You're not on `http://localhost:4200`. |
| Mobile: "Network Error" / timeout | Wrong IP in `API_URL`, phone on another network, API not started with `0.0.0.0`, or firewall blocking 7140. |
| Mobile still hits production | You didn't restart Expo after editing `app.json`; run `npx expo start -c`. |
