# Theming devnonla-ui

Tokens live on the `.nonla-ui` host that `<App>` renders, never on `:root`. Override them on `.nonla-ui` (both modes) or `.nonla-ui.light` / `.nonla-ui.dark` (one mode), after importing `devnonla-ui/styles.css`. Set Config tokens only; the rest derives.

## Config tokens (set these)

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--nonla-bg` | `#fafafa` | `#141414` | page |
| `--nonla-surface` | `#ffffff` | `#1c1c1c` | cards, popups |
| `--nonla-sidebar` | `#ffffff` | `#1c1c1c` | |
| `--nonla-bar` | `#f2f2f2` | `#262626` | wells, user bubble |
| `--nonla-border` / `--nonla-border-secondary` | ink 10% / 6% | white 10% / 6% | alpha hairlines |
| `--nonla-text-main` | `#191919` | `#fafafa` | |
| `--nonla-text-secondary` | `#5e5e5e` | `#a3a3a3` | supporting copy |
| `--nonla-text-tertiary` | `#6e6e6e` | `#8f8f8f` | placeholders, captions (AA) |
| `--nonla-text-quaternary` | `#a3a3a3` | `#5c5c5c` | disabled only |
| `--nonla-brand` / `--nonla-text-on-brand` | `#191919` / `#fff` | `#fafafa` / `#141414` | primary button, focus ring |
| `--nonla-danger`, `--nonla-success`, `--nonla-warn`, `--nonla-link` | AA text colors | | text and icons |
| `--nonla-{danger,success,warn}-fill`, `--nonla-text-on-{role}` | | | solid fills and their label |
| `--nonla-radius` | `8px` | | controls; `rounded`, `rounded-sm/lg` follow it |
| `--nonla-height` / `-sm` / `-lg` | 32 / 24 / 40px | | control heights |
| `--nonla-base-text-size` / `-sm-` / `-xs-` | 15 / 14 / 12px | | `text-base` / `text-sm` / `text-xs` |
| `--nonla-font`, `--nonla-mono-font` | Inter, Geist Mono | | |

## Brand color

Primary is ink (Claude-desktop style). To brand it, set per mode:

| Token | Light example | Dark example | Why |
|---|---|---|---|
| `--nonla-brand` | `#4f46e5` | `#818cf8` | fill |
| `--nonla-text-on-brand` | `#fff` | `#141414` | label, ≥ 4.5:1 on the fill |
| `--nonla-brand-shade` | `#000` | (page, default) | where hover moves: darken a saturated light fill so white labels gain contrast |

`--nonla-brand-shade` is where hover moves the fill: the page color (default) lifts ink; `#000` darkens a saturated light-mode brand so white labels gain contrast. Brand is for primary actions, focus and spinners only. Selected states use `--nonla-selected` (ink); don't point that at the brand.

## Tailwind utilities (inside `.nonla-ui`)

`bg-background`, `bg-card`, `bg-muted`, `bg-bar`, `text-foreground`, `text-muted-foreground`, `text-tertiary-foreground`, `text-quaternary-foreground`, `border-border`, `border-border-secondary`, `bg-ink-hover`, `bg-ink-active`, `bg-selected`, `text-on-selected`, `text-brand`, `bg-brand-fill`, `text-destructive`, `bg-destructive-bg`, `border-destructive-border`, `bg-destructive-fill`, `text-on-destructive` (same pattern for `success`, `warn`, `link`), `ring-focus-ring`. Text sizes `text-xs` / `text-sm` / `text-base` / `text-md` / `text-lg`.

Use these instead of hex values so both modes work.

## Light / dark

Dark is the default. `setColorPreference("light" | "dark" | "system")` stores the choice (`localStorage["nonla-color-mode"]`) and paints the host; `useColorPreference()` reads it; `ThemeSwitcher` is the ready control.

## Motion

`--nonla-dur-instant` 100ms, `--nonla-dur-fast` 150ms (default for `transition-*` inside the host), `--nonla-dur` 200ms, `--nonla-dur-slow` 300ms; `--nonla-ease-out` (enter, hover), `--nonla-ease-in` (exit), `--nonla-ease-spring` (sliding indicators). Use them for app-level animations so they match the controls.

## Rules

- Check contrast after any color change: text ≥ 4.5:1 on its background, in both modes.
- Prefer alpha (`rgb(0 0 0 / 10%)`) for borders and washes so they work on any surface.
- Change Config, not derived tokens (`--background`, `--brand-500`, `--nonla-*-bg`).
