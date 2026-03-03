# Frontend conventions

## Icons: no emojis, use SVG sprite

- **Do not use emojis** in the UI. Use SVG icons only.
- **One sprite per app**: when a page or the app uses several icons, they are combined into a **single SVG sprite** so the browser loads one asset and we reference icons by symbol id.
- **How to use**:
  - Icons are defined in `client/src/shared/assets/IconsSprite.tsx` as `<symbol id="icon-<name>">` inside a hidden SVG.
  - Use the `<Icon name="…" />` component from `@shared/ui/Icon` to render an icon: `<Icon name="target" width={24} height={24} />`.
  - Add new icons by adding a new `<symbol id="icon-<name>" viewBox="0 0 24 24">…</symbol>` in `IconsSprite.tsx` and extending the `IconName` type in `Icon.tsx`.

This keeps a single sprite in the bundle and avoids emoji rendering differences across systems.
