# Development workflow

## Branching

TBD. *How to verify:* Repo settings or team policy; CI runs on push/PR to main, master, develop (see .github/workflows).

## Lint and format

| App | Lint | Lint fix | Format |
|-----|------|----------|--------|
| Server | `npm run lint:check` | `npm run lint` | `npm run format` / `npm run format:check` |
| Client | `npm run lint` | `npm run lint:fix` | TBD (Prettier if configured) |

*How to verify:* [../../server/package.json](../../server/package.json), [../../client/package.json](../../client/package.json).

## Typecheck and build

| App | Typecheck | Build |
|-----|-----------|--------|
| Server | — | `npm run build` (in server/) |
| Client | `npm run type-check` | `npm run build` (runs type-check in prebuild) |

## CI overview

- **Backend** (`.github/workflows/backend.yml`): on push/PR to main|master|develop, paths server/** or workflow file. Steps: checkout, Node 20, npm ci --legacy-peer-deps, prisma generate, prisma migrate deploy, lint:check, test:ci (or test), build. Then build Docker image (push to main/develop).
- **Frontend** (`.github/workflows/frontend.yml`): on push/PR to main|master|develop, paths client/** or workflow file. Steps: checkout, Node 20, npm ci, lint, type-check, build (VITE_API_URL set), upload dist artifact; on push to main, Lighthouse CI (continue-on-error: true).

## Adding a feature

**Backend:** Add or extend module under `server/src/modules/`; register in AppModule; add DTOs with class-validator; keep controllers thin, logic in services; use Prisma in services. *How to verify:* [../../server/src/app.module.ts](../../server/src/app.module.ts).

**Frontend (FSD):** New feature → `client/src/features/<feature>/` (api, ui, types, constants as needed). New page → `client/src/pages/` and route in AppRouter. Shared UI → `client/src/shared/ui`. Entity API → `client/src/entities/<entity>/api`. Widgets for composite UI. Respect layer boundaries (e.g. features can use entities and shared; pages use features/widgets).

## Local debugging

- Server: `npm run start:debug` (Nest debug); attach Node debugger to port.
- Client: DevTools; Vite HMR; check Network for API calls and 401 handling.
