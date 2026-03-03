# Frontend coding standards

## TypeScript

- Prefer strict typing; avoid `any` where possible.
- Types: colocate in feature/entity (e.g. types.ts) or shared when reused. DTOs/interfaces next to API or in types files.

## React

- Functional components; hooks for state and side effects.
- Keep components focused; extract hooks for complex logic (e.g. useDebouncedSkillLevelUpdate, useOnboardingWizard).
- Effects: specify correct deps; avoid unnecessary re-runs.

## FSD

- Layers: app → pages → features / widgets → entities → shared. Imports: upper layers only; no circular deps.
- Use path aliases (@app, @features, @entities, @widgets, @shared, @pages).

## Styling

- Tailwind for layout and styling; prefer utility classes; no inline styles unless dynamic.
- Reusable UI in shared/ui (Button, Card, Input, Modal, LoadingSpinner, ErrorMessage).
- Icons: SVG sprite only; no emojis. See [../FRONTEND.md](../FRONTEND.md).

## API

- Use shared apiClient; handle errors (try/catch, 401 handled by interceptor).
- Map server DTOs to client types where needed; keep API functions in features/ or entities/api.

## Testing

- TBD. *How to verify:* No test scripts or test files in client/package.json or client/src.

## Naming

- Components: PascalCase. Files: PascalCase for components, camelCase for hooks/utils. Routes: constants in app/config/routes.

## File size

- **Pages:** Keep page files ≤150–200 lines; move logic into hooks and UI into sections/subcomponents (e.g. `ui/sections/`, `model/use*.ts`).
- **Components/hooks:** Split when a component or hook exceeds ~200–300 lines or has clear sub-responsibilities; extract sections into subcomponents or hooks.

## Async and race conditions

- For sequential async updates (e.g. switching tabs that trigger PUT then refetch), ensure "last action wins": use a request id ref and apply results only when the response matches the latest request, or cancel in-flight requests with AbortController/signal so stale responses do not overwrite state or trigger redundant updates.
