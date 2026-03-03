# Career Path Visualization System — Documentation

Web application for visualizing career opportunities: employees see career paths; HR manages roles, skills, and transitions; career growth is shown as a graph.

## Stack

| Layer | Tech |
|-------|------|
| Server | NestJS, TypeScript, Prisma, PostgreSQL, JWT/Passport, Swagger, class-validator |
| Client | React, TypeScript, Vite, Tailwind CSS, FSD, React Flow, Axios, React Hook Form + Zod |

## Repo structure

| Path | Purpose |
|------|---------|
| `server/` | NestJS backend (API, Prisma, auth) |
| `client/` | React frontend (Vite, FSD) |
| `docker-compose.yml` | Dev DB (PostgreSQL) |
| `docker-compose.prod.yml` | Prod stack (postgres + backend + frontend) |
| `.github/workflows/` | Backend and frontend CI/CD |

## Quick start (dev)

1. Start DB: `docker-compose up -d`
2. Server: `cd server && cp .env.example .env && npm install && npm run prisma:migrate && npm run prisma:seed && npm run start:dev`  
   If peer dependency errors occur: `npm install --legacy-peer-deps` then rerun migrate/seed/start.
3. Client: `cd client && npm install && npm run dev`
4. Open client: http://localhost:5173 — API: http://localhost:3000 — Swagger: http://localhost:3000/api

## Common commands

| Where | Command | Description |
|-------|---------|-------------|
| server | `npm run start:dev` | Dev server |
| server | `npm run prisma:generate` | Generate Prisma client |
| server | `npm run prisma:migrate` | Run migrations (dev) |
| server | `npm run prisma:seed` | Seed DB |
| server | `npm run lint:check` | Lint |
| client | `npm run dev` | Dev server (port 5173) |
| client | `npm run build` | Production build |
| client | `npm run type-check` | TypeScript check |
| client | `npm run lint` | Lint |

## Troubleshooting (quick)

- **DB connection:** Ensure Docker is up (`docker-compose ps`), credentials in `server/.env` match `docker-compose.yml`.
- **Port in use:** Change `PORT` in server `.env` (default 3000); client port in `client/vite.config.ts` (default 5173).
- **Prisma:** Run `npm run prisma:generate` after schema changes; migrations: `npm run prisma:migrate` in `server/`.
- **401 / logout:** Token in localStorage; 401 clears token and redirects to login (see [client/README.md](client/README.md)).

## Docs index

| Doc | Description |
|-----|-------------|
| [getting-started.md](getting-started.md) | Prerequisites, bootstrap, env, verification |
| [server/README.md](server/README.md) | Server overview, scripts, env, API |
| [server/database.md](server/database.md) | PostgreSQL, Prisma, migrations, seed |
| [server/architecture.md](server/architecture.md) | Modules, request flow, errors, config |
| [client/README.md](client/README.md) | Client overview, routes, FSD, scripts, API layer |
| [client/ui-and-pages.md](client/ui-and-pages.md) | Screens, widgets, loading/error states |
| [workflows/dev-workflow.md](workflows/dev-workflow.md) | Lint, format, CI, adding features |
| [workflows/troubleshooting.md](workflows/troubleshooting.md) | Known issues, verification steps |
| [standards/frontend-coding-standards.md](standards/frontend-coding-standards.md) | TS, React, FSD, styling, API, naming |
| [standards/backend-coding-standards.md](standards/backend-coding-standards.md) | Nest, DTOs, services, Prisma, errors, naming |
