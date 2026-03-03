# Client (frontend)

React SPA: auth, onboarding, career path graph, profile, development goals, admin (positions/skills/transitions). Uses FSD-like layout: app, pages, features, entities, widgets, shared.

## Routes

| Route | Page | Access |
|-------|------|--------|
| /login | LoginPage | Public (redirect if authenticated) |
| /register | RegisterPage | Public (redirect if authenticated) |
| /onboarding | OnboardingPage | Protected |
| /career-paths | CareerPathView | Protected + onboarding done |
| /profile | ProfilePage | Protected + onboarding done |
| /development | DevelopmentPage | Protected + onboarding done |
| /admin/positions | PositionsAdminPage | HR/ADMIN |
| /admin/skills | SkillsAdminPage | HR/ADMIN |
| /admin/transitions | TransitionsAdminPage | HR/ADMIN |
| / | Redirect | → /career-paths |

*How to verify:* [../../client/src/app/router/AppRouter.tsx](../../client/src/app/router/AppRouter.tsx) and [../../client/src/app/config/routes.ts](../../client/src/app/config/routes.ts).

## Feature-Sliced structure

| Folder | Purpose |
|--------|---------|
| app | Router, providers (Auth, Onboarding), config (routes, storage keys), ErrorBoundary |
| pages | Page components and page-level logic (admin, development, onboarding, ProfilePage) |
| features | Feature-specific UI and API (auth, view-career-path, career-scenarios, onboarding) |
| entities | Business entities and their API (user, position, skill, transition, development) |
| widgets | Composite UI (career-graph, profile-card) |
| shared | UI components, api client, assets, config |

Import aliases: `@app`, `@pages`, `@features`, `@entities`, `@widgets`, `@shared` (see [../../client/vite.config.ts](../../client/vite.config.ts)).

## Run

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 5173) |
| `npm run build` | tsc -b && vite build |
| `npm run preview` | Preview build (port 4173) |

## Scripts (client/package.json)

| Script | Description |
|--------|-------------|
| dev | vite |
| build | tsc -b && vite build |
| build:analyze | vite build --mode analyze |
| build:prod | cross-env NODE_ENV=production vite build |
| lint | eslint . --max-warnings 0 |
| lint:fix | eslint . --fix |
| type-check | tsc --noEmit |
| preview | vite preview |
| prebuild | npm run type-check |

## Environment variables

| Name | Purpose | Required | Default |
|------|---------|----------|---------|
| VITE_API_URL | API base URL | No | http://localhost:3000 |

*How to verify:* [../../client/src/shared/api/client.ts](../../client/src/shared/api/client.ts). No .env.example in repo.

## API layer

- Single axios instance: [../../client/src/shared/api/client.ts](../../client/src/shared/api/client.ts).
- Request interceptor: adds `Authorization: Bearer <token>` from localStorage (key from `@app/config/storageKeys`: AUTH_TOKEN_KEY).
- Response interceptor: returns `response.data`; on 401 removes token and user from storage and redirects to ROUTES.LOGIN.

## UI patterns

- Forms: React Hook Form + Zod (@hookform/resolvers).
- Modals: shared Modal component where used.
- State: React useState/useCallback/useMemo; Auth and Onboarding via context providers.
