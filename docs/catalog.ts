export type DocMeta = {
  path: string;
  title: string;
  group: string;
  groupOrder: number;
  order: number;
  icon?: string;
  flush?: boolean;
  wide?: boolean;
  className?: string;
};

export type DocsNavItem = {
  path: string;
  label: string;
  icon?: string;
};

export type DocsNavSection = {
  id: string;
  title: string;
  items: DocsNavItem[];
};

export type DocRecord = DocMeta & {
  flush: boolean;
  wide: boolean;
  body: string;
};

const modules = import.meta.glob("./pages/**/*.md", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseValue(raw: string): string | number | boolean {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1);
  return value;
}

function parseDoc(raw: string): DocRecord | null {
  const text = raw.replace(/^\uFEFF/, "");
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) return null;

  const meta: Record<string, string | number | boolean> = {};
  for (const line of text.slice(4, end).split("\n")) {
    if (!line.trim()) continue;
    const split = line.indexOf(":");
    if (split < 0) continue;
    meta[line.slice(0, split).trim()] = parseValue(line.slice(split + 1));
  }

  if (typeof meta.path !== "string" || typeof meta.title !== "string" || typeof meta.group !== "string") return null;

  return {
    path: meta.path,
    title: meta.title,
    group: meta.group,
    groupOrder: typeof meta.groupOrder === "number" ? meta.groupOrder : 0,
    order: typeof meta.order === "number" ? meta.order : 0,
    icon: typeof meta.icon === "string" ? meta.icon : undefined,
    className: typeof meta.className === "string" ? meta.className : undefined,
    flush: meta.flush === true,
    wide: meta.wide === true,
    body: text.slice(end + 5).replace(/^\n/, ""),
  };
}

export const DOCS: DocRecord[] = Object.values(modules)
  .flatMap((raw) => {
    const doc = parseDoc(raw);
    return doc ? [doc] : [];
  })
  .sort((a, b) => a.groupOrder - b.groupOrder || a.order - b.order || a.title.localeCompare(b.title));

export const DOCS_NAV: DocsNavSection[] = (() => {
  const groups = new Map<string, DocRecord[]>();
  for (const doc of DOCS) {
    const items = groups.get(doc.group) ?? [];
    items.push(doc);
    groups.set(doc.group, items);
  }
  return [...groups.entries()].map(([title, items]) => ({
    id: slug(title),
    title,
    items: items.map((item) => ({ path: item.path, label: item.title, icon: item.icon })),
  }));
})();

export function flattenNav(sections: DocsNavSection[] = DOCS_NAV): DocsNavItem[] {
  return sections.flatMap((section) => section.items);
}

export function findDoc(pathname: string): DocRecord | undefined {
  const path = pathname.replace(/\/+$/, "") || "/";
  return DOCS.find((doc) => doc.path === path);
}

export function findNavItem(pathname: string): DocsNavItem | undefined {
  const path = pathname.replace(/\/+$/, "") || "/";
  return flattenNav().find((item) => item.path === path);
}

export function docNeighbors(pathname: string): { prev?: DocsNavItem; next?: DocsNavItem } {
  const items = flattenNav();
  const path = pathname.replace(/\/+$/, "") || "/";
  const index = items.findIndex((item) => item.path === path);
  if (index < 0) return {};
  return { prev: items[index - 1], next: items[index + 1] };
}

export function isFlushDoc(pathname: string): boolean {
  return findDoc(pathname)?.flush ?? false;
}
