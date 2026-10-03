export const ICON_PREFIX = "solar";
export const DEFAULT_ICON_STYLE = "linear";
export const DEFAULT_ICON_NAME = "bot-linear";
export const DEFAULT_TOOL_ICON = `${ICON_PREFIX}:${DEFAULT_ICON_NAME}`;

const STYLE_SUFFIXES = ["bold-duotone", "line-duotone", "linear", "outline", "broken", "bold"] as const;

export type SolarIconStyle = (typeof STYLE_SUFFIXES)[number];

/** Fluent Color ids that do not share a Solar stem. Values are full Solar icon ids. */
const LEGACY_NAMES: Record<string, string> = {
  alert: "bell-linear",
  apps: "widget-4-linear",
  "apps-list": "list-linear",
  "apps-list-detail": "sidebar-minimalistic-linear",
  "arrow-square-down": "alt-arrow-down-linear",
  "arrow-sync": "refresh-linear",
  board: "kanban-linear",
  "book-open": "book-2-linear",
  "bot-sparkle": "magic-stick-3-linear",
  "calendar-clock": "calendar-mark-linear",
  chat: "chat-round-linear",
  "chat-bubbles-question": "chat-round-question-mark-linear",
  "chat-more": "chat-round-dots-linear",
  "chat-multiple": "dialog-2-linear",
  checkbox: "check-square-linear",
  clock: "clock-circle-linear",
  "code-block": "code-square-linear",
  comment: "dialog-linear",
  "content-view": "window-frame-linear",
  "data-bar-vertical-ascending": "chart-linear",
  "dismiss-circle": "close-circle-linear",
  drafts: "notes-linear",
  edit: "pen-linear",
  "fast-forward-circle": "round-double-alt-arrow-right-linear",
  form: "clipboard-text-linear",
  "image-off": "gallery-remove-linear",
  "lightbulb-filament": "lightbulb-linear",
  "list-bar": "hamburger-menu-linear",
  "number-symbol-square": "hashtag-square-linear",
  options: "tuning-2-linear",
  "people-community": "users-group-rounded-linear",
  person: "user-rounded-linear",
  "search-sparkle": "magnifer-linear",
  "share-android": "share-linear",
  "share-ios": "square-share-line-linear",
  sparkle: "stars-linear",
  "text-edit-style": "text-field-linear",
  vault: "safe-square-linear",
  "wrench-screwdriver": "toolbox-linear",
};

type IconifyIcon = { body: string; width?: number; height?: number; left?: number; top?: number };
type IconifyAlias = { parent: string };
type IconifyPack = {
  icons?: Record<string, IconifyIcon>;
  aliases?: Record<string, IconifyAlias>;
  width?: number;
  height?: number;
};

let pack: IconifyPack | null = null;
let memoryNames: string[] | null = null;
const svgByName = new Map<string, string>();
const imgSrcByName = new Map<string, string>();
let inflight: Promise<string[]> | null = null;

function hasStyle(name: string) {
  return STYLE_SUFFIXES.some((style) => name.endsWith(`-${style}`));
}

function stripStyle(name: string) {
  for (const style of STYLE_SUFFIXES) {
    const suffix = `-${style}`;
    if (name.endsWith(suffix)) return name.slice(0, -suffix.length);
  }
  return name;
}

function bareName(value: string) {
  let name = value.trim();
  if (name.startsWith(`${ICON_PREFIX}:`)) name = name.slice(ICON_PREFIX.length + 1);
  if (name.startsWith("fluent-color:")) name = name.slice("fluent-color:".length);
  return name;
}

/** Solar icon id. Accepts `solar:…`, a styled id, or a legacy Fluent Color id such as `settings-24`. Pass `style` to force a weight such as `bold-duotone`. */
export function solarIconName(value: string, style?: SolarIconStyle): string {
  const name = bareName(value);
  const stem = name.replace(/-24$/, "");
  const resolved = hasStyle(name) ? name : (LEGACY_NAMES[stem] ?? LEGACY_NAMES[name] ?? `${stem}-${DEFAULT_ICON_STYLE}`);
  if (!style || resolved.endsWith(`-${style}`)) return resolved;
  return `${stripStyle(resolved)}-${style}`;
}

export function solarIconRef(name: string): string {
  return `${ICON_PREFIX}:${solarIconName(name)}`;
}

function lookup(name: string): IconifyIcon | null {
  if (!pack) return null;
  const seen = new Set<string>();
  let current = name;
  while (current && !seen.has(current)) {
    seen.add(current);
    const icon = pack.icons?.[current];
    if (icon?.body) return icon;
    const parent = pack.aliases?.[current]?.parent;
    if (!parent) return null;
    current = parent;
  }
  return null;
}

function toSvg(icon: IconifyIcon): string {
  const left = icon.left ?? 0;
  const top = icon.top ?? 0;
  const width = icon.width ?? pack?.width ?? 24;
  const height = icon.height ?? pack?.height ?? 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="${left} ${top} ${width} ${height}">${icon.body}</svg>`;
}

/** Loads the vendored Solar pack (code-split). No network. */
export function ensureSolarIcons(): Promise<string[]> {
  if (memoryNames) return Promise.resolve(memoryNames);
  if (inflight) return inflight;
  inflight = import("@iconify-json/solar/icons.json")
    .then((mod) => {
      pack = (mod.default ?? mod) as IconifyPack;
      memoryNames = [...Object.keys(pack.icons ?? {}), ...Object.keys(pack.aliases ?? {})];
      return memoryNames;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function getIconNames(): string[] {
  return memoryNames ?? [];
}

export function getSolarSvg(name: string): string | null {
  if (!pack) return null;
  const resolved = solarIconName(name);
  const cached = svgByName.get(resolved);
  if (cached) return cached;
  const icon = lookup(resolved);
  if (!icon) return null;
  const svg = toSvg(icon);
  svgByName.set(resolved, svg);
  return svg;
}

export function getSolarImgSrc(name: string): string | null {
  const resolved = solarIconName(name);
  const hit = imgSrcByName.get(resolved);
  if (hit) return hit;
  const svg = getSolarSvg(name);
  if (!svg) return null;
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  imgSrcByName.set(resolved, src);
  return src;
}

export function isSvgIcon(value?: string | null): boolean {
  return !!value && value.trimStart().startsWith("<svg");
}

export function isSolarIcon(value?: string | null): boolean {
  return !!value && (value.startsWith(`${ICON_PREFIX}:`) || value.startsWith("fluent-color:"));
}
