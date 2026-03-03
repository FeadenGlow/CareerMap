# Client — UI and pages

## Main screens

| Screen | Description |
|--------|-------------|
| Career Paths | Graph of positions and transitions (React Flow); scenario switcher; top recommendations; node/edge click for details. |
| Profile | User profile and skills (ProfileCard widget). |
| Development | Development goal, my skills, skill gaps; skill level editing. |
| Onboarding | Multi-step onboarding wizard. |
| Admin — Positions | CRUD positions. |
| Admin — Skills | CRUD skills. |
| Admin — Transitions | CRUD transitions. |
| Login / Register | Auth forms. |

*How to verify:* [../../client/src/app/router/AppRouter.tsx](../../client/src/app/router/AppRouter.tsx) and corresponding page/feature components.

## Key components and widgets

| Component | Responsibility |
|-----------|----------------|
| CareerGraph | Renders graph (positions as nodes, transitions as edges); supports recommended highlight and scenario theme. |
| ProfileCard | Displays user profile block. |
| IconsSprite | Single SVG sprite for icons; use Icon from @shared/ui. |
| Modal, Card, Button, Input, LoadingSpinner, ErrorMessage | Shared UI building blocks. |

*How to verify:* [../../client/src/widgets](../../client/src/widgets), [../../client/src/shared/ui](../../client/src/shared/ui). Icons: [../FRONTEND.md](../FRONTEND.md) — no emojis, SVG sprite only.

## Loading / error / empty states

- Loading: LoadingSpinner or inline "Loading...".
- Error: ErrorMessage component; retry buttons where applicable (e.g. career graph load failure).
- Empty: Lists and blocks show empty state or hide when no data (e.g. recommendations when reason !== 'ok').
- Auth: Protected routes redirect to login when not authenticated; onboarding gate redirects to onboarding when not completed.
