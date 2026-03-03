# Getting started

## Prerequisites

| Tool | Version | How to verify |
|------|---------|----------------|
| Node.js | v18+ (CI uses 20) | `node -v` |
| npm | TBD | `npm -v` |
| Docker & Docker Compose | TBD | `docker -v`, `docker compose version` |

---

## Bootstrap (step-by-step)

No single root script; run server and client separately.

### 1. Clone and start DB

```bash
git clone https://github.com/FeadenGlow/CareerMap.git
cd Thesis
docker-compose up -d
```

### 2. Server

```bash
cd server
cp .env.example .env
npm install
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

If `npm install` fails with peer dependency errors (e.g. Swagger/NestJS), run:

```bash
npm install --legacy-peer-deps
```

then rerun `npm run prisma:migrate`, `npm run prisma:seed`, `npm run start:dev`.

### 3. Client (new terminal)

```bash
cd client
npm install
npm run dev
```

---

## Environment

| Location | Action |
|----------|--------|
| `server/.env` | Copy from `server/.env.example`; set `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT` |
| `client/` | No `.env` required for dev; optional `VITE_API_URL` (default in code: `http://localhost:3000`). *How to verify:* [client/src/shared/api/client.ts](../client/src/shared/api/client.ts) |

---

## Run DB, server, client

| What | Command | Where |
|------|---------|--------|
| DB | `docker-compose up -d` | repo root |
| Server | `npm run start:dev` | server/ |
| Client | `npm run dev` | client/ |

---

## Verification

| Target | URL / check |
|--------|-------------|
| Client | http://localhost:5173 (port from [client/vite.config.ts](../client/vite.config.ts) `server.port`) |
| API | http://localhost:3000 (PORT from `server/.env`) |
| Swagger | http://localhost:3000/api |
| Root route | GET / returns 200 and a string (see [server/src/app.controller.ts](../server/src/app.controller.ts)). No dedicated /health. |

---

## Seed test accounts

After `npm run prisma:seed` in `server/`, the following accounts exist (see [server/prisma/seed.ts](../server/prisma/seed.ts)):

| Email | Role | Password |
|-------|------|----------|
| admin@company.com | ADMIN | password123 |
| hr@company.com | HR | password123 |
| employee@company.com | EMPLOYEE | password123 |

Use these for UI and API checks.

---

## Production (docker-compose.prod.yml)

Defined in repo root: [docker-compose.prod.yml](../docker-compose.prod.yml).

| Need | Details |
|------|---------|
| Env vars | Set at least `JWT_SECRET`. Optional overrides: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`, `JWT_EXPIRES_IN`, `BACKEND_PORT`, `FRONTEND_PORT`. Defaults in file use `:-` syntax. |
| Run | From repo root: `docker-compose -f docker-compose.prod.yml up -d` (builds and starts postgres, backend, frontend). |
| Entrypoint | Backend: runs `node dist/main` (PORT 3000). Frontend: serves built static assets (e.g. Nginx on port 80). Healthchecks defined in compose file. |

*How to verify:* Inspect `docker-compose.prod.yml` for `environment` and `healthcheck` sections.

---

## Typical dev workflow

1. DB running; server and client in dev mode.
2. Backend: change code in `server/src/`; migrations in `server/prisma/`.
3. Frontend: change code in `client/src/`; Vite HMR.
4. Lint: `npm run lint:check` (server), `npm run lint` (client); type-check client: `npm run type-check`.
5. Before commit: run CI steps (lint, test server; lint, type-check, build client).
