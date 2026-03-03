# Backend coding standards

## Nest module structure

- One module per feature under server/src/modules/ (e.g. auth, users, career-scenarios).
- Module exports controllers and services; imports other modules when needed (e.g. UsersModule for CareerScenariosService).

## DTOs and validation

- Use class-validator decorators (@IsString, @IsEnum, @IsOptional, etc.); class-transformer where needed.
- ValidationPipe global: whitelist, forbidNonWhitelisted, transform. Keep DTOs in dto/ next to module.

## Service boundaries

- Controllers: thin — parse request, call service, return response.
- Services: business logic, Prisma calls, no HTTP details.

## Prisma

- Use Prisma in services only; avoid N+1 (prefer include/select); use transactions for multi-step writes. Single Prisma instance (e.g. config/prisma).

## Error handling

- Throw Nest HTTP exceptions (UnauthorizedException, NotFoundException, BadRequestException) so Nest returns correct status. No custom filter documented. *How to verify:* grep for HttpException in server/src.

## Config: constants vs env

- **Env only:** Secrets and environment-specific values (DATABASE_URL, JWT_SECRET, PORT, JWT_EXPIRES_IN). No weights, limits, or scenario lists in env.
- **Constants in config/:** Weights, limits, scenario lists, enum value lists (e.g. [../../server/src/config/career-scenarios.constants.ts](../../server/src/config/career-scenarios.constants.ts)). Single source of truth for enums used in DTOs and services.

## DTO enum source

- Keep enum values for validation (e.g. @IsEnum) in one place: config constants or a shared const object (e.g. CareerScenarioTypeEnum), not by re-exporting from Prisma client, so the backend does not depend on generated client for enum typing and validation.

## Logging

- TBD. *How to verify:* Logger usage in server/src.

## Testing

- Jest; unit tests (*.spec.ts); test:ci for CI. e2e: test:e2e with jest-e2e.json. *How to verify:* [../../server/package.json](../../server/package.json) jest config and test scripts.

## Naming

- Controllers: *Controller; Services: *Service; DTOs: *Dto. Files: kebab-case for modules; dto files descriptive (e.g. set-active-scenario.dto.ts).
