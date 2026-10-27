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

### Design system (Vitalis DonaVida, US-MOB-08)

Source: Stitch `vitalis_humanitas/DESIGN.md` and the mobile screens. Everything visual comes from `theme/`:

- `theme/palette.ts` is the only file (with the WCAG calculator `theme/contrast.ts`) with color literals. Components use semantic roles from `useTheme().colors` (`text`, `textMuted`, `primary`, `primaryText`, `tones.urgent`...), never palette values or hex.
- Styles: `const useStyles = makeStyles((t) => ({ ... }))` next to the component, `const styles = useStyles()` inside it. Use `t.spacing` (8pt), `t.radius` (inputs/buttons `md` 12, cards `card` 20, pills `full`), `t.elevation[1-3]` and `t.typography.<variant>`.
- Text: `<AppText variant="headlineLg">`. Plus Jakarta Sans is loaded in `app/_layout.tsx`; with a custom font the weight is the font file (`fontFor(weight)`), never `fontWeight`, or Android falls back to the system font. If the font fails, `ThemeProvider fontsLoaded={false}` switches to the system font.
- Clinical tones: `urgent` red, `observation` amber, `viable` green, `info` blue, `neutral`. Always icon + text (`StatusBadge`), never color alone. Blood groups: `BloodTypeChip` (read aloud as "Grupo sanguíneo O negativo").
- Touch targets are at least 48x48: `AppButton` has `minHeight` 48; smaller icons use `IconButton` (adds `hitSlop`). Icon-only controls need `accessibilityLabel`.
- Base components: `AppButton` (primary / secondary / ghost), `IconButton`, `TextField` (52px; `FormInput` wraps it for react-hook-form), `AppCard` (elevation 0-3), `StatusBadge`, `UrgencyBadge`, `BloodTypeChip`, `RequestCard` (one screen-reader summary: urgency, group, center, title), `LivePulseBanner` (honors reduce motion), `DonationStepper`.
- `theme/__tests__/contrast.test.ts` checks WCAG AA for every text/background pair in light and dark: add new pairs there when adding colors. White on `#0284C7` fails AA, so cyan text and fills use `#0369A1`.
- Dark colors exist (`darkColors`), but the app is pinned to light in `app/_layout.tsx` until navigation and every screen use the theme (US-MOB-08 step 4).
- `constants/theme.ts` (`COLORS`/`SIZES`/`FONTS`) is a deprecated bridge to the light tokens; don't use it in new code. Move screens to `useTheme` and delete it when nothing imports it.
- Photos and overlays: `mediaBackdrop` behind images, `mediaScrim` as the end of a gradient over a photo, `onMedia` for text on it. Modal backdrops use `scrim`.
- `theme/__tests__/noColorLiterals.test.ts` fails on any hex, `rgb()` or named color outside those two files (comments are ignored).
- Tests: `npm run test:ci`. `jest.setup.ts` stubs `@expo/vector-icons` (icon fonts don't load under Jest) and adds the Testing Library matchers.

### Auth session (US-MOB-09)

`features/auth/services/session.service.ts` owns the tokens (saved with `expo-secure-store`). `AuthContext` mirrors it and `api/axios.ts` reads it. An access token about to expire is renewed with the refresh token before a request (one refresh at a time); a 401 renews once and retries. If Keycloak rejects the refresh token, or the retry is still 401, the session ends and `app/_layout.tsx` shows the login screen with "Your session expired". A network error while refreshing keeps the session. Tests: `features/auth/__tests__/session.test.ts`.

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
