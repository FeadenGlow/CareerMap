# Server — Database

## PostgreSQL via Docker

Dev DB is defined in the repo root: [../../docker-compose.yml](../../docker-compose.yml). One service `postgres`; image, env, ports, volume, network are set there.

Values below are taken from that file (verify there if in doubt):

| Item | Value (from docker-compose.yml) |
|------|----------------------------------|
| Image | postgres:16-alpine |
| POSTGRES_USER | career_user |
| POSTGRES_PASSWORD | career_password |
| POSTGRES_DB | career_paths |
| Ports | 5432:5432 |
| Volume | postgres_data |
| Network | career-network |

Prod stack: [../../docker-compose.prod.yml](../../docker-compose.prod.yml) — postgres + backend + frontend; env overrides via `${POSTGRES_USER:-career_user}` etc.

## Prisma schema overview

**Main entities:** User, Position, Skill, UserSkill, Transition, UserDevelopmentGoal, OnboardingProcess, UserTransitionHistory.

**Enums:** Role (EMPLOYEE, HR, ADMIN), TransitionType (VERTICAL, HORIZONTAL, CHANGE), InterestType, GrowthType, CareerScenarioType (FAST_GROWTH, EXPERT_PATH, MANAGER_PATH), OnboardingStatus, TransitionHistorySource, TransitionHistoryType.

**Relations (summary):** User → Position (optional), CurrentPosition (optional), UserSkill[], UserDevelopmentGoal?, OnboardingProcess?, UserTransitionHistory[]; Position → Transition from/to, development goals, history; Transition → requiredSkills (Skill[]); UserSkill → User, Skill.

*How to verify:* [../../server/prisma/schema.prisma](../../server/prisma/schema.prisma).

## Migrations

| Action | Command |
|--------|---------|
| Create (dev) | `npx prisma migrate dev --name <name>` in server/ |
| Apply (prod) | `npm run prisma:migrate:deploy` |
| Rollback | Prisma has no built-in rollback; revert migration file and re-apply or use migrate resolve. TBD. *How to verify:* Prisma docs. |

## Seeding

Single seed script: `npm run prisma:seed` runs [../../server/prisma/seed.ts](../../server/prisma/seed.ts).

Creates (among other data) three test users; safe to re-run (upserts where applicable). See [../getting-started.md](../getting-started.md#seed-test-accounts) for login table (admin/hr/employee, password `password123`).

## Data safety

- Do not run `prisma migrate reset` on shared/production DB (data loss).
- Back up DB before schema/migration changes in production.
