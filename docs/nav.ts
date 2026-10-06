export type { DocsNavItem, DocsNavSection } from "./catalog";
export { DOCS_NAV, docNeighbors, findNavItem, flattenNav } from "./catalog";

export const GITHUB_REPO = "https://github.com/devnonla/devnonla-ui";

const COMPONENT_LEGACY: Record<string, string> = {
  button: "button",
  logo: "logo",
  typography: "typography",
  splitter: "splitter",
  sidebar: "sidebar",
  input: "input",
  "editable-input": "editable-input",
  "markdown-editor": "markdown-editor",
  "markdown-viewer": "markdown-viewer",
  "input-number": "input-number",
  select: "select",
  datepicker: "datepicker",
  timepicker: "timepicker",
  "color-picker": "color-picker",
  switch: "switch",
  checkbox: "checkbox",
  form: "form",
  card: "card",
  tag: "tag",
  table: "table",
  empty: "empty",
  segmented: "segmented",
  skeleton: "skeleton",
  shimmer: "shimmer",
  tooltip: "tooltip",
  popover: "popover",
  codeblock: "codeblock",
  "react-code-sandbox": "react-code-sandbox",
  message: "message",
  modal: "modal",
  drawer: "drawer",
  popconfirm: "popconfirm",
  spin: "spin",
  dropdown: "dropdown",
  pagination: "pagination",
};

const GROUPED_COMPONENT_LEGACY: Record<string, string> = {
  "general/button": "button",
  "general/logo": "logo",
  "general/typography": "typography",
  "layout/splitter": "splitter",
  "layout/sidebar": "sidebar",
  "data-entry/input": "input",
  "data-entry/editable-input": "editable-input",
  "data-entry/markdown-editor": "markdown-editor",
  "data-entry/markdown-viewer": "markdown-viewer",
  "data-entry/input-number": "input-number",
  "data-entry/select": "select",
  "data-entry/datepicker": "datepicker",
  "data-entry/timepicker": "timepicker",
  "data-entry/color-picker": "color-picker",
  "data-entry/switch": "switch",
  "data-entry/checkbox": "checkbox",
  "data-entry/form": "form",
  "data-display/card": "card",
  "data-display/tag": "tag",
  "data-display/table": "table",
  "data-display/empty": "empty",
  "data-display/segmented": "segmented",
  "data-display/skeleton": "skeleton",
  "data-display/shimmer": "shimmer",
  "data-display/tooltip": "tooltip",
  "data-display/popover": "popover",
  "data-display/codeblock": "codeblock",
  "data-display/react-code-sandbox": "react-code-sandbox",
  "feedback/message": "message",
  "feedback/modal": "modal",
  "feedback/drawer": "drawer",
  "feedback/popconfirm": "popconfirm",
  "feedback/spin": "spin",
  "navigation/dropdown": "dropdown",
  "navigation/pagination": "pagination",
};

const GROUP_INDEX_LEGACY: Record<string, string> = {
  general: "/components/button",
  layout: "/components/splitter",
  "data-entry": "/components/input",
  "data-display": "/components/tag",
  feedback: "/components/message",
  navigation: "/components/dropdown",
};

const CHAT_LEGACY: Record<string, string> = {
  chat: "/chat",
  "agent-panel": "/chat/agent-panel",
  "chat/agent-panel": "/chat/agent-panel",
  "chat-conversation": "/chat/agent-panel",
  "agent-chatbox": "/chat/agent-chatbox",
  "chat/agent-chatbox": "/chat/agent-chatbox",
  "chat-chatbox": "/chat/agent-chatbox",
  "chat-avatar": "/chat/avatar",
  "chat/avatar": "/chat/avatar",
  "chat-welcome": "/chat/welcome",
  "chat/welcome": "/chat/welcome",
  "chat-user": "/chat/user",
  "chat/user": "/chat/user",
  "chat-agent": "/chat/agent",
  "chat/agent": "/chat/agent",
  "chat-thinking": "/chat/thinking",
  "chat/thinking": "/chat/thinking",
  "chat-tool": "/chat/tool",
  "chat/tool": "/chat/tool",
  "builtin-tools": "/chat/builtin-tools",
  "chat-builtin-tools": "/chat/builtin-tools",
  "chat/builtin-tools": "/chat/builtin-tools",
  "chat-input": "/chat/input",
  "chat/input": "/chat/input",
};

/** Old hashes (`#/general/button`) and flat slugs (`#/button`) → current docs URLs. */
export const LEGACY_ALIASES: Record<string, string> = {
  theme: "/theming",
  ...Object.fromEntries(Object.entries(COMPONENT_LEGACY).map(([from, slug]) => [from, `/components/${slug}`])),
  ...Object.fromEntries(Object.entries(GROUPED_COMPONENT_LEGACY).map(([from, slug]) => [from, `/components/${slug}`])),
  ...GROUP_INDEX_LEGACY,
  ...CHAT_LEGACY,
};

export function resolveLegacyPath(raw: string): string | null {
  const key = raw.replace(/^#\/?/, "").replace(/^\//, "").replace(/\/+$/, "");
  if (!key || key === "docs") return "/introduction";
  if (key.startsWith("docs/")) return `/${key.slice("docs/".length)}`;
  return LEGACY_ALIASES[key] ?? null;
}

function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** One-time rewrite of HashRouter bookmarks before BrowserRouter mounts. */
export function migrateLegacyLocation() {
  const { pathname, search, hash } = window.location;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const appPathname = base && (pathname === base || pathname.startsWith(`${base}/`)) ? pathname.slice(base.length) || "/" : pathname;
  const hashPath = hash.replace(/^#\/?/, "").replace(/\/+$/, "");
  if (hashPath) {
    const next = resolveLegacyPath(hashPath);
    window.history.replaceState(null, "", `${withBase(next ?? "/introduction")}${search}`);
    return;
  }
  const stripped = appPathname.replace(/^\//, "").replace(/\/+$/, "");
  if (!stripped) return;
  if (stripped === "docs" || stripped.startsWith("docs/")) {
    const rest = stripped.replace(/^docs\/?/, "");
    window.history.replaceState(null, "", `${withBase(rest ? `/${rest}` : "/introduction")}${search}`);
    return;
  }
  const next = resolveLegacyPath(stripped);
  if (next) window.history.replaceState(null, "", `${withBase(next)}${search}`);
}
