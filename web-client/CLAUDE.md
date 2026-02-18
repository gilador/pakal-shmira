# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tumbleweed ("pakal-shmira") is a shift management web app for scheduling staff across posts and time slots. It runs entirely client-side with localStorage persistence and uses a linear programming solver (HiGHS.js) to optimize fair shift distribution. The UI is in Hebrew (RTL).

Deployed to GitHub Pages at https://gor84.com/tumbleweed.

## Commands

```bash
npm run dev              # Dev server on localhost:5273
npm run build            # TypeScript check + Vite build
npm run lint             # ESLint
npm run test             # Jest unit tests
npm run test:e2e         # Playwright E2E (headless, starts dev server)
npm run test:e2e:ui      # Playwright interactive UI mode
npm run test:e2e:headed  # E2E with visible browser
```

Run a single Jest test: `npx jest --testPathPattern <pattern>`
Run a single E2E test: `npx playwright test <test-file> --project=chromium`

## Architecture

```
src/
├── App.tsx                  # Root: QueryClientProvider > RecoilRoot > ShiftManager
├── components/
│   ├── ShiftManager.tsx     # Main orchestrator — wires all hooks together
│   ├── AvailabilityTableView.tsx  # Dual-mode table (availability/assignments)
│   ├── ShiftInfoSettingsView.tsx  # Shift configuration panel
│   ├── elements/            # shadcn/ui primitives (button, dialog, card, etc.)
│   └── ...                  # Feature components (WorkerList, EditableText, etc.)
├── hooks/                   # Feature-based custom hooks
│   ├── useShiftManagerInitialization.ts  # App startup, localStorage loading
│   ├── useShiftOptimization.ts          # HiGHS solver orchestration
│   ├── useUserHandlers.ts               # Staff CRUD
│   ├── usePostHandlers.ts               # Post/position management
│   ├── useAssignmentHandlers.ts         # Cell assignment editing
│   └── useToast.ts                      # Notification queue
├── stores/
│   └── shiftStore.ts        # Single Recoil atom with localStorage persistence effect
├── service/
│   ├── shiftOptimizedService.ts    # LP optimization via HiGHS.js (loaded from CDN)
│   ├── shiftHourHelperService.ts   # Shift duration calculation (pure functions)
│   ├── shiftManagerUtils.ts        # Hour generation, constraint defaults, data mapping
│   ├── shiftCalculationCache.ts    # Memoization for shift calculations
│   └── intensityRangeHelper.ts     # Feasible intensity range computation
├── models.ts               # Core types: User, Constraint, UserShiftData, ShiftMap
├── models/index.ts          # Parallel model definitions (includes UniqueString)
├── constants/               # Default posts, hours, operation times, colors
└── lib/                     # cn() utility, localStorage helpers
```

### Key Patterns

**Single Recoil atom**: All app state lives in one `shiftState` atom (`stores/shiftStore.ts`). A custom `AtomEffect` persists to localStorage, excluding `syncStatus`. Always spread previous state when updating.

**No routing**: Single-screen SPA. Navigation is handled through edit mode toggles, dialogs, and conditional panels.

**Hook-per-feature**: Business logic is extracted into dedicated hooks consumed by `ShiftManager`. Each hook returns an object of state + handlers.

**Two model files**: `src/models.ts` and `src/models/index.ts` both define `User`, `Constraint`, `UserShiftData`, and `ShiftMap` with slight differences. `models/index.ts` also exports `UniqueString`. Imports are split across both — check which is used before adding types.

**Optimizer data format**: The optimizer works with `boolean[][][]` arrays indexed as `[post][hour][user]`, while the UI state uses `(string | null)[][]` as `assignments[post][hour] = userId`. Conversion happens in `useShiftOptimization`.

### Stack

- React 18, TypeScript (strict), Vite 5
- Recoil (global state) + TanStack Query (async state)
- Tailwind CSS + shadcn/ui (New York style, CSS variables, `cn()` for class merging)
- Path alias: `@/` maps to `src/`

## Testing

**Unit tests** (Jest): Colocated in `__tests__/` directories or alongside source files. Cover service-layer pure functions.

**E2E tests** (Playwright): Located in `tests/e2e/`. Run against all three browsers (Chromium, Firefox, WebKit). Use `data-testid` attributes and semantic selectors. Dev server starts automatically.

## CI/CD

Push to `main` with changes under `web-client/` triggers automatic version bump (semver patch) and GitHub Pages deployment. Version bump commits include `[skip ci]`.
