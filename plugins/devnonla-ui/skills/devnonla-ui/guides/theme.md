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
| `--nonla-brand` / `--nonla-text-on-brand` | `#dd7627` / `#fff` | `#dd7627` / `#fff` | primary button, focus ring |
| `--nonla-{danger,success,warn}-fill` | `#e23242` / `#37bb62` / `#f9ad26` | same | solid fills; labels white / ink / ink |
| `--nonla-danger` / `-success` / `-warn` / `-link` (text) | `#ce2739` / `#11813c` / `#a2620e` / `#005cc5` | `#f66c6d` / `#51c672` / `#f9b64f` / `#7db0f9` | AA text and icons |
| `--nonla-danger`, `--nonla-success`, `--nonla-warn`, `--nonla-link` | AA text colors | | text and icons |
| `--nonla-{danger,success,warn}-fill`, `--nonla-text-on-{role}` | | | solid fills and their label |
| `--nonla-radius` | `8px` | | controls; `rounded`, `rounded-sm/lg` follow it |
| `--nonla-height` / `-sm` / `-lg` | 32 / 24 / 40px | | control heights |
| `--nonla-base-text-size` / `-sm-` / `-xs-` | 15 / 14 / 12px | | `text-base` / `text-sm` / `text-xs` |
| `--nonla-font`, `--nonla-mono-font` | Inter, Geist Mono | | |

## Brand color

Primary is the logo orange `#dd7627` in both modes, with a white label. The primary button is a top-lit gradient (`--nonla-brand-top` → brand; hover lifts the top to `--nonla-brand-top-hover`), a 1px edge that is the same gradient 8% darker, and `--nonla-brand-shadow`. To rebrand, set per mode:

| Token | Light example | Dark example | Why |
|---|---|---|---|
| `--nonla-brand` | `#4f46e5` | `#818cf8` | fill |
| `--nonla-text-on-brand` | `#fff` | `#141414` | label on the fill |
| `--nonla-brand-glow` / `--nonla-brand-shade` | `#fff` / `#000` | | where hover / press move the fill |

Brand is for primary actions, focus and spinners only. Selected states use `--nonla-selected` (ink); don't point that at the brand.

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
