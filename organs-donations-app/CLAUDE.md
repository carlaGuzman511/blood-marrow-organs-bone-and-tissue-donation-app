# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository context

This directory (`organs-donations-app`) is the Angular web frontend inside a larger monorepo
(`blood-marrow-organs-bone-and-tissue-donation-app`) that also contains:
- `../api/Umss.BloodOrgansDonationApp` — the .NET backend API
- `../mobile` — a separate Expo/React Native mobile app (has its own `CLAUDE.md`)

This app talks to the same backend API as the mobile app.

### Environments

Per-environment config (API base URL, Keycloak url/realm/clientId) lives in `src/environments/`,
typed by `environment.model.ts`. Always read it via
`import { environment } from '../../environments/environment'` — never hardcode a URL in a
service, interceptor or spec.

- `environment.ts` — production (default `ng build`, deployed on Vercel):
  API `https://blood-marrow-organs-bone-and-tissue.onrender.com/api` (Swagger at `/swagger/index.html`).
- `environment.development.ts` — swapped in by `fileReplacements` for the `development`
  configuration (`ng serve` / `npm start`): local API at `http://localhost:7140/api`.
  To run the dev server against the production API instead: `ng serve --configuration production`.

Everything in these files ships in the public JS bundle: public values only, never secrets.

## Commands

Run these from the `organs-donations-app` directory.

- `npm start` / `ng serve` — dev server at `http://localhost:4200`, auto-reloads on file changes.
- `npm run build` / `ng build` — production build, output to `dist/organs-donations-app`.
- `npm run watch` — dev-config build in watch mode.
- `npm test` / `ng test` — runs unit tests via Karma/Jasmine (Chrome launcher).
  - To run a single spec file, use Angular CLI's test filtering, e.g.
    `ng test --include='**/search.component.spec.ts'`.
- `ng generate component <path>` — scaffold a new component (this codebase consistently uses
  standalone components, so scaffolded components should stay standalone — do not add an
  `NgModule`).

Deployment is via Vercel (`vercel.json` rewrites all paths to `index.html` for the Angular SPA
router). No CI config exists in this directory.

## Architecture

Angular 19, standalone-components style (no `NgModule`s) with the Angular CLI `application`
builder. Routing, HTTP client, and change detection are wired up in `src/app/app.config.ts`
(`provideRouter`, `provideHttpClient`, `provideZoneChangeDetection`).

### Feature-folder structure

Each top-level route lives under `src/app/<feature>/` as a standalone `*.component.ts` with its
own `.html`/`.css`, plus a `components/` subfolder for feature-scoped child components (e.g.
`donation-center/components/card`, `donation-center/components/request-form-modal`). This pattern
repeats across `home/`, `donation-center/`, `information/`, and `search/` — each has parallel
`card` and `request-form-modal` (or `info-form-modal`) sub-components. When adding similar
functionality to a feature, follow the sibling feature's existing folder shape rather than
inventing a new one.

Routes are declared in `src/app/app.routes.ts`. Public: `/login`, `/no-autorizado`, `/donantes`. Every other page is a child of
`layout/portal-shell` (sidebar + top bar with the session sede) behind `portalGuard`: signed in, a clinical role
(`clinical_staff`, `network_admin`, legacy `admin`; read from the access token's `realm_access.roles`, `auth/roles.ts`)
and a sede for the session. Donors get `/no-autorizado`; a session without a sede goes back to `/login` to pick one.

### Login and session sede (US-WEB-01)

`/login` (Stitch `acceso_y_autenticacion_clinica_portal_web`): role tab, sede (from the public `GET /api/donation-centers`),
Google (`kc_idp_hint` = `environment.keycloak.googleIdpHint`) or the email as `login_hint`. Credentials are typed on the
Keycloak page only (PKCE); never add a password field to the portal. The sede travels in the OAuth `state` and lives in
`auth/session-sede.service.ts` (sessionStorage, cleared on logout). Screens take the center from `SessionSedeService.sede()`,
never a hardcoded id. Admin / CENATRA sessions see the whole network; clinical ones, their sede.

### Requests board (US-WEB-02 / 03 / 05)

`requests/` (route `/solicitudes`, Stitch `solicitudes_clinicas_y_urgencias_portal_web`) on `/api/donation-requests`
(`models/DonationRequest.ts`, `requests/services/donation-request.service.ts`). One query per board column (status +
sede; Completado = changed today), so column counts are the API totals. Filters always go to the API: debounced
(`FILTER_DEBOUNCE_MS`) and through `switchMap`, with a sequence number so a stale load never clears the spinner.
Phase changes (menu or drag & drop, only to `allowedNextStatuses`) are confirmed, applied optimistically and rolled back
on error. The publish dialog posts itself, stays open with the data on errors and maps `errors` to fields. Pure logic
(countdown, filters, Código Rojo banner) lives in `requests/request-view.ts`; spec fixtures in `requests/testing.ts`.

### Data layer

- Shared domain types live in one file: `src/app/models/DonationPost.ts` (`DonationPost`, `User`,
  `DonationCenter`, `BloodType`, `Donation`, `Comment`, `City`, `Status`). Add new shared types
  here rather than inline in components.
- HTTP access is centralized in `src/app/services/` (`home.service.ts`,
  `donation-center.service.ts`, `information.service.ts`), each `providedIn: 'root'` and injected
  directly into components — there is no NgRx/state-management layer; components hold fetched
  data as local fields and call services directly in `ngOnInit`.
- The standard data-fetching pattern used throughout components: set `isLoading = true`, call the
  service method, `.pipe(catchError(...), finalize(...))`, open a `MatSnackBar` message on error,
  reset `isLoading` in `finalize`. Follow this same pattern for new fetch/save/delete calls instead
  of introducing a different one (e.g. async/await, signals-based resources, etc.).
- Some user-facing snackbar messages are in Spanish (e.g. "La solicitud de donacion fue eliminada
  correctamente..!") — match the existing language for a given feature's user-facing strings
  rather than mixing English/Spanish within the same flow.

### UI stack

Angular Material (`azure-blue` prebuilt theme, loaded globally in `angular.json` styles, re-skinned by the design system below) plus
`@angular/google-maps` for map display, and `ReactiveFormsModule`/`FormBuilder` for all forms
(no template-driven forms). Modals are opened via `MatDialog.open(...)` and communicate results
back through `dialogRef.afterClosed().subscribe(...)`.

### Design system (Vitalis DonaVida, US-WEB-09)

Source: Stitch (vitalis_humanitas DESIGN.md; same brand tokens as `../mobile/theme/palette.ts`). `src/styles.css` imports, in order:

- `src/styles/tokens.css` — the only file with color literals. Semantic `--vd-*` custom properties: colors (`--vd-color-text`, `--vd-color-primary`, `--vd-tone-urgent-fg`...), type scale as `font` shorthands (`font: var(--vd-title-sm)`), radii, 8pt spacing, elevation 0-3, and the 4/8/12-column grid (breakpoints 600px and 1024px, max 1120px).
- `src/styles/material.css` — maps `--mat-sys-*` and Material component tokens to `--vd-*` (Plus Jakarta Sans, 12px/48px buttons, 52px fields with blue focus, 20px cards). Use Material components as usual; they pick this up.
- `src/styles/base.css` — page defaults, visible `:focus-visible` ring, type classes (`.vd-headline-lg`...), grid (`.vd-container`, `.vd-grid`, `.vd-col-N`), and `.vd-btn--primary|secondary|subtle`, `.vd-input`, `.vd-card`, `.vd-badge--<tone>`, `.vd-blood-badge`.

Rules: component CSS uses only `var(--vd-*)` (`npm run lint:tokens` fails on hex/rgb/named colors elsewhere). Clinical status = `<vd-status-badge tone="viable|urgent|observation|info|neutral" label="...">` (`src/app/shared/ui/status-badge`, icon + text, never color alone). `#E11D48` is fill-only on the canvas (4.49:1): red text uses `--vd-color-primary-text`; `#0284C7` is focus-ring only, blue text uses `--vd-color-secondary-text`. `src/styles/design-tokens.spec.ts` checks WCAG AA on the resolved tokens: add a pair there when adding a color.
