# Career Path Visualization System

A web application for visualizing career opportunities within a company:

- **Employees** — view career paths, get personalized recommendations, switch career scenarios (Fast Growth / Expert Path / Manager Path)
- **HR / Admin** — manage positions, skills, and transitions
- **Everyone** — interactive graph of positions and transitions with readiness highlighting

## Stack

| Layer  | Tech |
|--------|------|
| Server | NestJS, TypeScript, Prisma, PostgreSQL, JWT/Passport, Swagger, class-validator |
| Client | React, TypeScript, Vite, Tailwind CSS, FSD, React Flow, Axios, React Hook Form + Zod |

## Project structure

```
.
├── server/          # NestJS backend (API, Prisma, auth)
├── client/          # React frontend (Vite, FSD)
├── docs/            # Project documentation (setup, architecture, standards)
├── docker-compose.yml
└── docker-compose.prod.yml
```

## Quick start

**Prerequisites:** Node.js v18+, Docker & Docker Compose, npm.

1. **Start the database** (from repo root):
   ```bash
   docker-compose up -d
   ```

2. **Backend** (from repo root):
   ```bash
   cd server
   cp .env.example .env
   npm install
   npm run prisma:migrate
   npm run prisma:seed
   npm run start:dev
   ```
   If `npm install` fails with peer dependency errors, run `npm install --legacy-peer-deps` and then rerun migrate, seed, and start.

3. **Frontend** (new terminal):
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Open:** Client — http://localhost:5173 · API — http://localhost:3000 · Swagger — http://localhost:3000/api

## Test accounts (after seed)

| Email               | Role     | Password    |
|---------------------|----------|-------------|
| admin@company.com   | ADMIN    | password123 |
| hr@company.com      | HR       | password123 |
| employee@company.com| EMPLOYEE | password123 |

## Documentation

Full documentation is in the **[docs/](docs/)** folder:

| Doc | Description |
|-----|-------------|
| [docs/README.md](docs/README.md) | Docs index, quick start, common commands |
| [docs/getting-started.md](docs/getting-started.md) | Prerequisites, step-by-step setup, env, seed, production |
| [docs/server/](docs/server/) | Server overview, database, architecture, scripts, API |
| [docs/client/](docs/client/) | Client routes, FSD structure, scripts, API layer, UI |
| [docs/workflows/](docs/workflows/) | Dev workflow, CI, troubleshooting |
| [docs/standards/](docs/standards/) | Frontend and backend coding standards |

For API details, use **Swagger** at http://localhost:3000/api when the server is running.

## Main features

- **Career graph** — positions and transitions with color by type (vertical / horizontal / change); recommended and partially available paths highlighted
- **Career scenarios** — Fast Growth, Expert Path, Manager Path; scenario affects recommendations and graph accent
- **Recommendations** — personalized top paths from current position with scores and explanations
- **Profile & skills** — user skills, development goal, skill gaps
- **Onboarding** — multi-step wizard for new users
- **Admin** — CRUD for positions, skills, transitions (HR/Admin only)

## Commands (summary)

| Where   | Command | Description |
|---------|---------|-------------|
| server  | `npm run start:dev` | Dev server |
| server  | `npm run prisma:migrate` | Run migrations |
| server  | `npm run prisma:seed` | Seed DB |
| server  | `npm run lint:check` | Lint |
| client  | `npm run dev` | Dev server |
| client  | `npm run build` | Production build |
| client  | `npm run type-check` | TypeScript check |
| client  | `npm run lint` | Lint |

## Troubleshooting

- **DB connection:** `docker-compose ps`; ensure `server/.env` matches `docker-compose.yml` (user, password, db, port).
- **Port in use:** Change `PORT` in `server/.env` (default 3000) or client port in `client/vite.config.ts` (default 5173).
- **Prisma:** After schema changes run `npm run prisma:generate` in `server/`. For more, see [docs/workflows/troubleshooting.md](docs/workflows/troubleshooting.md).

## CI/CD

- **Backend** (`.github/workflows/backend.yml`) — lint, test, build on push/PR to main/master/develop; Docker image build on push.
- **Frontend** (`.github/workflows/frontend.yml`) — lint, type-check, build on push/PR; Lighthouse CI on push to main.

## Production (Docker)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Set at least `JWT_SECRET`; see [docs/getting-started.md](docs/getting-started.md#production-docker-composeprodyml) for env and entrypoints.

## License

UNLICENSED

This is a thesis project. For questions or issues, contact the project maintainer.
