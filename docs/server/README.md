# Server (backend)

NestJS API: auth, users, positions, skills, transitions, career graph, onboarding, development goals, career recommendations, career scenarios.

## Key modules

| Module | Purpose |
|--------|---------|
| Auth | Register, login, JWT strategy |
| Users | Profile, profile skills, HR position assignment |
| Positions | CRUD positions |
| Skills | CRUD skills |
| Transitions | CRUD transitions (between positions) |
| CareerPaths | Career graph, paths from position |
| CareerRecommendations | Personalized path recommendations |
| CareerScenarios | Scenario list, set active scenario |
| Onboarding | Onboarding state and steps |
| Development | Development goals, user skills for development |

*How to verify:* [../../server/src/app.module.ts](../../server/src/app.module.ts).

## Run

| Mode | Command |
|------|---------|
| Dev | `npm run start:dev` |
| Prod | `npm run build` then `npm run start:prod` |

## Scripts (server/package.json)

Table below is 1:1 from [../../server/package.json](../../server/package.json) scripts section.

| Script | Command (from package.json) |
|--------|-----------------------------|
| `build` | nest build |
| `build:prod` | nest build --webpack --webpackPath webpack.config.js |
| `format` | prettier --write "src/**/*.ts" "test/**/*.ts" |
| `format:check` | prettier --check "src/**/*.ts" "test/**/*.ts" |
| `start` | nest start |
| `start:dev` | nest start --watch |
| `start:debug` | nest start --debug --watch |
| `start:prod` | node dist/main |
| `start:prod:pm2` | pm2 start dist/main.js --name career-paths-api |
| `lint` | eslint "{src,apps,libs}/**/*.ts" --fix |
| `lint:check` | eslint "{src,apps,libs}/**/*.ts" |
| `test` | jest --coverage |
| `test:watch` | jest --watch |
| `test:cov` | jest --coverage |
| `test:debug` | node --inspect-brk ... jest --runInBand |
| `test:e2e` | jest --config ./test/jest-e2e.json |
| `test:ci` | jest --coverage --ci --maxWorkers=2 |
| `prisma:generate` | prisma generate |
| `prisma:migrate` | prisma migrate dev |
| `prisma:migrate:deploy` | prisma migrate deploy |
| `prisma:studio` | prisma studio |
| `prisma:seed` | ts-node prisma/seed.ts |
| `prebuild` | prisma:generate |
| `postinstall` | prisma:generate |

## Environment variables

| Name | Purpose | Required | Default | Defined |
|------|---------|----------|---------|---------|
| DATABASE_URL | PostgreSQL connection | Yes | — | server/.env.example |
| JWT_SECRET | JWT signing | Yes | — | server/.env.example |
| JWT_EXPIRES_IN | Token TTL | No | 7d | server/.env.example |
| PORT | HTTP port | No | 3000 | server/.env.example, main.ts |

## Prisma

| Task | Command |
|------|---------|
| Migrate (dev) | `npm run prisma:migrate` |
| Migrate (deploy) | `npm run prisma:migrate:deploy` |
| Reset DB | Not in package.json. *How to verify:* Run `npx prisma migrate reset` in server/ (destroys data). |
| Seed | `npm run prisma:seed` |
| Studio | `npm run prisma:studio` |

## API docs

Swagger UI: **http://localhost:3000/api** (when server running). Bearer auth supported. *How to verify:* [../../server/src/main.ts](../../server/src/main.ts) (SwaggerModule.setup('api', ...)).

## Troubleshooting

- **DB connect:** Check DATABASE_URL; Docker postgres on 5432; credentials match docker-compose.yml.
- **Migrations:** Ensure Prisma client generated (`npm run prisma:generate`); for deploy use `prisma:migrate:deploy`.
- **JWT:** 401 if token missing/expired; client clears storage and redirects to login on 401.
