/**
 * Theme knobs for NonlaUI.
 *
 * Defaults live in `styles.css` on `:root` / `.nonla-ui`.
 * `--brand-50`…`--brand-800` follow `--nonla-brand` (500 = the knob).
 * Consumers retheme without touching components:
 *   1. CSS:  `:root { --nonla-brand: #3b82f6; }`
 *   2. JS:   `<App theme={{ colors: { brand: "#3b82f6" } }} />` or `applyNonlaTheme({ brand: "#3b82f6" })`
 * Color mode is `light` | `dark` on `<html>` (`setColorMode`, `<ThemeToggle>`). Dark is the default.
 * `<ThemeSwitcher>` also stores `system`, which follows the OS and still paints `light` or `dark`.
 */

export const NONLA_THEME_KEYS = {
  bg: "--nonla-bg",
  fg: "--nonla-fg",
  fgMuted: "--nonla-fg-muted",
  fgTertiary: "--nonla-fg-tertiary",
  fgQuaternary: "--nonla-fg-quaternary",
  brand: "--nonla-brand",
  solidFg: "--nonla-solid-fg",
  danger: "--nonla-danger",
  success: "--nonla-success",
  warn: "--nonla-warn",
  link: "--nonla-link",
  radius: "--nonla-radius",
  height: "--nonla-height",
  heightSm: "--nonla-height-sm",
  heightLg: "--nonla-height-lg",
  ink: "--nonla-ink",
  sidebar: "--nonla-sidebar",
  surface: "--nonla-surface",
  elevated: "--nonla-elevated",
  chip: "--nonla-chip",
  chipHover: "--nonla-chip-hover",
  border: "--nonla-border",
  borderInput: "--nonla-input",
  composer: "--nonla-composer",
  chatBg: "--nonla-chat-bg",
  meadow: "--nonla-meadow",
  glass: "--nonla-glass",
  glassBar: "--nonla-glass-bar",
  glassMenu: "--nonla-glass-menu",
  glassBorder: "--nonla-glass-border",
  glassHighlight: "--nonla-glass-highlight",
  inkHover: "--nonla-ink-hover",
  inkActive: "--nonla-ink-active",
  inkLine: "--nonla-ink-line",
  desktopBarHeight: "--nonla-desktop-bar-height",
  windowHeader: "--nonla-window-header",
  zBase: "--nonla-z-base",
  zDesktop: "--nonla-z-desktop",
  zWindow: "--nonla-z-window",
  zHeader: "--nonla-z-header",
  zPopupBase: "--nonla-z-popup-base",
  blue: "--nonla-blue",
  purple: "--nonla-purple",
  cyan: "--nonla-cyan",
  green: "--nonla-green",
  magenta: "--nonla-magenta",
  pink: "--nonla-pink",
  red: "--nonla-red",
  orange: "--nonla-orange",
  yellow: "--nonla-yellow",
  volcano: "--nonla-volcano",
  geekblue: "--nonla-geekblue",
  lime: "--nonla-lime",
  gold: "--nonla-gold",
} as const;

export type NonlaThemeKnobName = keyof typeof NONLA_THEME_KEYS;
export type NonlaThemeKnob = (typeof NONLA_THEME_KEYS)[NonlaThemeKnobName];

const METRIC_KEYS = new Set<NonlaThemeKnobName>(["radius", "height", "heightSm", "heightLg", "desktopBarHeight", "zBase", "zDesktop", "zWindow", "zHeader", "zPopupBase"]);

export type NonlaThemeColorName = Exclude<
  NonlaThemeKnobName,
  "radius" | "height" | "heightSm" | "heightLg" | "desktopBarHeight" | "zBase" | "zDesktop" | "zWindow" | "zHeader" | "zPopupBase"
>;
export type NonlaThemeColors = { [K in NonlaThemeColorName]?: string };

/** Flat aliases → knob name (`colorBorder` == `colors.border`). */
const COLOR_ALIASES = {
  colorBorder: "border",
  colorBorderInput: "borderInput",
  /** @deprecated use `borderInput` / `colorBorderInput` */
  input: "borderInput",
} as const satisfies Record<string, NonlaThemeColorName>;

export const NONLA_THEME_KNOBS = Object.values(NONLA_THEME_KEYS);

export type NonlaThemeConfig = {
  [K in NonlaThemeKnobName]?: string;
} & {
  /** Grouped color knobs — same names as the flat keys (`colors.border`, `colors.borderInput`, …). */
  colors?: NonlaThemeColors;
  /** Alias of `colors.border` / `border`. */
  colorBorder?: string;
  /** Alias of `colors.borderInput` / `borderInput`. */
  colorBorderInput?: string;
  /** Extra CSS custom properties (include the leading `--`). */
  vars?: Record<string, string>;
};

function entriesOf(theme: NonlaThemeConfig): [string, string][] {
  const map = new Map<string, string>();
  const set = (key: string, value: unknown) => {
    if (typeof value !== "string" || !value) return;
    const knob = (COLOR_ALIASES as Record<string, NonlaThemeKnobName>)[key] ?? (key as NonlaThemeKnobName);
    const prop = NONLA_THEME_KEYS[knob];
    if (prop) map.set(prop, value);
  };

  if (theme.colors) {
    for (const [key, value] of Object.entries(theme.colors)) {
      if (METRIC_KEYS.has(key as NonlaThemeKnobName)) continue;
      set(key, value);
    }
  }
  set("colorBorder", theme.colorBorder);
  set("colorBorderInput", theme.colorBorderInput);
  for (const key of Object.keys(NONLA_THEME_KEYS) as NonlaThemeKnobName[]) {
    set(key, theme[key]);
  }
  if (theme.vars) {
    for (const [prop, value] of Object.entries(theme.vars)) {
      if (value) map.set(prop, value);
    }
  }
  return [...map.entries()];
}

export type NonlaTokenSnapshot = { [K in NonlaThemeKnobName]: string };

/** Read computed `--nonla-*` knobs (`getDesignToken`). */
export function getDesignToken(target?: HTMLElement): NonlaTokenSnapshot {
  const el = target ?? (typeof document === "undefined" ? null : document.documentElement);
  const token = {} as NonlaTokenSnapshot;
  for (const name of Object.keys(NONLA_THEME_KEYS) as NonlaThemeKnobName[]) {
    token[name] = el ? getComputedStyle(el).getPropertyValue(NONLA_THEME_KEYS[name]).trim() : "";
  }
  return token;
}

/** Apply knobs on an element (defaults to `:root`). Returns a restore function. */
export function applyNonlaTheme(theme: NonlaThemeConfig, target: HTMLElement = document.documentElement): () => void {
  const entries = entriesOf(theme);
  const prev = entries.map(([prop]) => [prop, target.style.getPropertyValue(prop)] as const);
  for (const [prop, value] of entries) target.style.setProperty(prop, value);
  return () => {
    for (const [prop, value] of prev) {
      if (value) target.style.setProperty(prop, value);
      else target.style.removeProperty(prop);
    }
  };
}

export type NonlaColorMode = "light" | "dark";

/** Stored choice. `system` follows the OS and still applies `light` or `dark` on `<html>`. */
export type NonlaColorPreference = NonlaColorMode | "system";

/** `localStorage` key written by `setColorMode` / `setColorPreference`. */
export const NONLA_COLOR_MODE_KEY = "nonla-color-mode";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

const modeListeners = new Set<() => void>();
const preferenceListeners = new Set<() => void>();
let colorMode: NonlaColorMode = "dark";
let colorPreference: NonlaColorPreference = "dark";
let colorModeReady = false;
let schemeQuery: MediaQueryList | null = null;

export function getColorMode(): NonlaColorMode {
  return colorMode;
}

export function getColorPreference(): NonlaColorPreference {
  return colorPreference;
}

export function subscribeColorMode(listener: () => void) {
  modeListeners.add(listener);
  return () => {
    modeListeners.delete(listener);
  };
}

export function subscribeColorPreference(listener: () => void) {
  preferenceListeners.add(listener);
  return () => {
    preferenceListeners.delete(listener);
  };
}

function notifyColorMode() {
  for (const listener of modeListeners) listener();
}

function notifyColorPreference() {
  for (const listener of preferenceListeners) listener();
}

function isColorPreference(value: string | null): value is NonlaColorPreference {
  return value === "light" || value === "dark" || value === "system";
}

function readStoredPreference(): NonlaColorPreference | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const value = localStorage.getItem(NONLA_COLOR_MODE_KEY);
    return isColorPreference(value) ? value : null;
  } catch {
    return null;
  }
}

function systemColorMode(): NonlaColorMode {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "dark";
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
}

function resolvedMode(next: NonlaColorPreference): NonlaColorMode {
  return next === "system" ? systemColorMode() : next;
}

function onSchemeChange() {
  if (colorPreference !== "system") return;
  const next = systemColorMode();
  if (typeof document === "undefined") {
    colorMode = next;
    notifyColorMode();
    return;
  }
  applyColorMode(next);
}

function watchSystemScheme() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function" || schemeQuery) return;
  schemeQuery = window.matchMedia(COLOR_SCHEME_QUERY);
  schemeQuery.addEventListener("change", onSchemeChange);
}

function rememberPreference(next: NonlaColorPreference) {
  try {
    localStorage.setItem(NONLA_COLOR_MODE_KEY, next);
  } catch {
    /* private mode */
  }
}

/** Set `light` or `dark` on `target` (default `<html>`) so portals inherit the palette. */
export function applyColorMode(next: NonlaColorMode, target: HTMLElement = document.documentElement) {
  colorMode = next;
  target.classList.toggle("light", next === "light");
  target.classList.toggle("dark", next === "dark");
  target.style.colorScheme = next;
  notifyColorMode();
}

/** Switch the stored choice. `system` follows the OS and still paints `light` or `dark`. */
export function setColorPreference(next: NonlaColorPreference, target?: HTMLElement) {
  colorPreference = next;
  if (next === "system") watchSystemScheme();
  const resolved = resolvedMode(next);
  if (typeof document === "undefined") {
    colorMode = resolved;
    notifyColorMode();
    notifyColorPreference();
    return;
  }
  applyColorMode(resolved, target);
  colorModeReady = true;
  rememberPreference(next);
  notifyColorPreference();
}

/** Switch mode and remember it. */
export function setColorMode(next: NonlaColorMode, target?: HTMLElement) {
  setColorPreference(next, target);
}

/** Apply the saved mode once. Falls back to dark. A stored `system` choice follows the OS. */
export function initColorMode(target?: HTMLElement): NonlaColorMode {
  if (typeof document === "undefined") return colorMode;
  if (colorModeReady) return colorMode;
  colorModeReady = true;
  const fromClass = document.documentElement.classList.contains("light") ? "light" : document.documentElement.classList.contains("dark") ? "dark" : null;
  const next = readStoredPreference() ?? fromClass ?? "dark";
  colorPreference = next;
  if (next === "system") watchSystemScheme();
  applyColorMode(resolvedMode(next), target);
  notifyColorPreference();
  return colorMode;
}
