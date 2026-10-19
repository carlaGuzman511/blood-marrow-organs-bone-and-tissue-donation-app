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

Routes are declared in `src/app/app.routes.ts`. Note that `login` and `reports` components exist
under `src/app/` but are **not** currently registered in `app.routes.ts` — they are in-progress/
unwired features; check whether new work should wire them in rather than assuming they're dead
code.

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

Angular Material (`azure-blue` prebuilt theme, loaded globally in `angular.json` styles) plus
`@angular/google-maps` for map display, and `ReactiveFormsModule`/`FormBuilder` for all forms
(no template-driven forms). Modals are opened via `MatDialog.open(...)` and communicate results
back through `dialogRef.afterClosed().subscribe(...)`.
