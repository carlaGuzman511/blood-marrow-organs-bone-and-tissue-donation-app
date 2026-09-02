# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Expo / React Native mobile app for a blood, bone marrow, organ, and tissue donation platform (donors, donation centers, donation posts/requests). This directory (`mobile/`) is the frontend; it talks to a separate backend at the `API_URL` configured in `app.json` (`extra.API_URL`, currently `https://blood-marrow-organs-bone-and-tissue.onrender.com`), overridable via `expo-constants`.

## Commands

- `npm install` — install dependencies
- `npx expo start` — start the dev server (then choose Android/iOS/web/Expo Go from the CLI output)
- `npm run android` / `npm run ios` / `npm run web` — start targeting a specific platform
- `npm run lint` — lint via `expo lint`
- `npm test` — run Jest in watch mode (`jest-expo` preset). To run once: `npx jest`. To run a single file: `npx jest path/to/file.test.tsx`
- `npm run reset-project` — moves current `app/` starter code to `app-example/` and creates a blank `app/` (Expo template scaffolding command; not typically needed on this project)

There is no backend in this directory — it is a separate service consumed over HTTP via `api/axios.ts`.

## Architecture

### Two coexisting structures — know which one you're touching

The codebase is mid-migration from an older flat structure to a feature-based structure. Both are live:

- **Legacy** (`screens/`, some of `components/`): older, pre-router screens (`Login`, `Register`, `Home`, `OPTVerification`, etc.) and flat components (`Button`, `Input`, `UserCard`, `Slider`, ...). Not all of these are wired into current navigation.
- **Current** (`app/`, `features/`, `components/ui/`): Expo Router file-based routes in `app/`, with feature logic under `features/<feature-name>/` and shared presentational primitives under `components/ui/<Component>/`.

When adding new functionality, follow the current (`app/` + `features/` + `components/ui/`) pattern rather than the legacy one, unless you're directly modifying an existing legacy screen.

### Routing (`app/`)

File-based routing via `expo-router`. `app/_layout.tsx` defines the root `Tabs` navigator (Home, Donors, Donation Centers, Donation Posts, Profile, Information, Reports) and wraps the app in `QueryClientProvider` (TanStack Query) and `GestureHandlerRootView`. Route files under `app/<section>/` are typically thin — they import and render a component/screen from `features/<section>/`.

### Feature module shape (`features/<feature-name>/`)

Each feature under `features/` follows (not all features have every layer yet):

- `models/` — domain TypeScript types for the feature (distinct from the global ones in `models/App.types.ts`)
- `services/` — raw API calls using the shared `api` axios instance (`api/axios.ts`), e.g. `features/donation-centers/services/donationCenter.service.ts`
- `mapper/` — transforms API/service response shapes into feature models
- `hooks/` — TanStack Query hooks (`useQuery`/`useMutation`) wrapping the services, e.g. `useDonationCenters.ts`
- `components/` — presentational components, each in its own folder with `ComponentName.tsx`, `ComponentName.styles.ts`, and a barrel `index.ts`
- `screens/` — screen-level compositions consumed by routes in `app/`
- `utils/` — feature-local pure helpers (e.g. `distance.ts`, `openingHours.ts`)
- `index.ts` — barrel re-exporting the feature's public surface

Server state (API data) is managed with **TanStack Query** — do not introduce a separate global store for server data. Local/UI state uses plain `useState`/hooks (see `hooks/useSearchFilters.ts`, `hooks/useFilteredData.ts` for the search/filter pattern reused across features).

### Shared UI primitives (`components/ui/`)

Reusable, feature-agnostic building blocks (`AppText`, `AppCard`, `Badge`, `FormInput`, `FormPicker`, `SearchBar`, `FilterBottomSheet`, etc.), each in its own folder with a co-located `.styles.ts` file and an `index.ts` barrel. Forms use `react-hook-form` with `@hookform/resolvers/zod` and a Zod schema (see `schemas/donationPost.schema.ts` + `features/donation-posts/components/CreateDonationPost`) for validation; `FormInput`/`FormPicker` from `components/ui/` are the standard controlled-field wrappers.

### Search & filtering pattern

Search/filter UIs share a generic pattern rather than per-feature reimplementation:

- `models/Search.types.ts` — `SearchFilters`, `FilterGroup`, `FilterOption`, per-entity filter-value/predicate types
- `config/filters/` — filter group definitions and per-entity predicate functions (e.g. `donationCenterFilters.ts`, `userFilters.ts`), built via `createFilterGroup()`
- `hooks/useSearchFilters.ts` — owns `SearchFilters` state (search text + keyed filter values)
- `hooks/useFilteredData.ts` — generic `data.filter(predicate)` given a `SearchFilters` and a predicate

New searchable lists should reuse this trio rather than hand-rolling filter state.

### Path aliases

`@/*` maps to the project root (`tsconfig.json`), e.g. `@/api/axios`, `@/models/App.types`, `@/constants`, `@/features/...`. Always prefer the `@/` alias over relative `../../..` paths for cross-directory imports.

### Types

`models/App.types.ts` holds shared cross-feature domain types (`User`, `DonationCenter`, `DonationPost`, `BloodType`, `Donation`, `Comment`, `Status`). Feature-specific shapes go in `features/<feature>/models/` instead of being added here.
