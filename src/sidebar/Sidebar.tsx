import { type MouseEvent, type ReactNode, useMemo, useState } from "react";
import { FluentIcon } from "../icon/FluentIcon";
import { SearchInput } from "../input/SearchInput";
import { cn } from "../lib/cn";
import { OverlayScroll } from "../scroll/OverlayScroll";

export type SidebarItemType = {
  key?: string;
  label?: ReactNode;
  /** Fluent icon name, or a node. */
  icon?: ReactNode;
  disabled?: boolean;
  type?: "item" | "group" | "divider";
  children?: SidebarItemType[];
  href?: string;
  extra?: ReactNode;
  className?: string;
};

export type SidebarSelectInfo = {
  key: string;
  item: SidebarItemType;
};

export type SidebarProps = {
  items?: SidebarItemType[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (info: SidebarSelectInfo) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  header?: ReactNode;
  footer?: ReactNode;
  emptyText?: ReactNode;
  className?: string;
  "aria-label"?: string;
};

function itemKey(item: SidebarItemType, i: number) {
  return item.key ?? (item.type === "divider" ? `divider-${i}` : isGroup(item) ? `group-${i}` : `item-${i}`);
}

function isGroup(item: SidebarItemType) {
  return item.type === "group" || (item.type !== "item" && item.type !== "divider" && Boolean(item.children?.length));
}

function labelText(label: ReactNode) {
  if (typeof label === "string" || typeof label === "number") return String(label);
  return "";
}

function matchesQuery(item: SidebarItemType, q: string) {
  if (!q) return true;
  return labelText(item.label).toLowerCase().includes(q);
}

function filterItems(items: SidebarItemType[], q: string): SidebarItemType[] {
  if (!q) return items;
  const out: SidebarItemType[] = [];
  for (const item of items) {
    if (item.type === "divider") {
      if (out.length && out[out.length - 1]?.type !== "divider") out.push(item);
      continue;
    }
    if (isGroup(item)) {
      const children = filterItems(item.children ?? [], q);
      if (children.length || matchesQuery(item, q)) out.push({ ...item, children });
      continue;
    }
    if (matchesQuery(item, q)) out.push(item);
  }
  while (out[out.length - 1]?.type === "divider") out.pop();
  return out;
}

function ItemIcon({ icon }: { icon?: ReactNode }) {
  if (icon == null || icon === false) return null;
  if (typeof icon === "string") return <FluentIcon name={icon} size={16} />;
  return <span className="inline-flex size-4 shrink-0 items-center justify-center [&_img]:size-4 [&_svg]:size-4">{icon}</span>;
}

function SidebarList({
  items,
  selected,
  onSelect,
}: {
  items: SidebarItemType[];
  selected?: string;
  onSelect?: SidebarProps["onSelect"];
}) {
  return (
    <>
      {items.map((item, i) => {
        const key = itemKey(item, i);
        if (item.type === "divider") {
          return <div key={key} className="mx-2 my-1 h-px bg-ink-line" />;
        }
        if (isGroup(item)) {
          return (
            <div key={key} className="mb-4">
              {item.label != null && item.label !== "" ? (
                <div className={cn("px-2 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-wider text-quaternary-foreground", item.className)}>
                  {item.label}
                </div>
              ) : null}
              <div className="flex flex-col gap-0.5">
                <SidebarList items={item.children ?? []} selected={selected} onSelect={onSelect} />
              </div>
            </div>
          );
        }

        const active = selected != null && key === selected;
        const className = cn(
          "flex w-full items-center gap-2 rounded-md border-0 px-2 py-1.5 text-left text-sm no-underline",
          item.disabled ? "pointer-events-none cursor-not-allowed opacity-40" : "cursor-pointer",
          active ? "bg-ink-active font-medium text-foreground" : "bg-transparent text-foreground/80 hover:bg-ink-hover hover:text-foreground",
          item.className,
        );

        const body = (
          <>
            <ItemIcon icon={item.icon} />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.extra != null ? <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{item.extra}</span> : null}
          </>
        );

        const activate = (e: MouseEvent<HTMLElement>) => {
          if (item.disabled) {
            e.preventDefault();
            return;
          }
          if (item.href && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)) return;
          if (item.href && onSelect) e.preventDefault();
          onSelect?.({ key, item });
        };

        if (item.href) {
          return (
            <a key={key} href={item.href} aria-current={active ? "page" : undefined} aria-disabled={item.disabled || undefined} className={className} onClick={activate}>
              {body}
            </a>
          );
        }

        return (
          <button key={key} type="button" aria-current={active ? "true" : undefined} disabled={item.disabled} className={className} onClick={activate}>
            {body}
          </button>
        );
      })}
    </>
  );
}

/** Grouped side nav — pass JSON groups + items. Router stays in the app (`onSelect` / `href`). */
export function Sidebar({
  items = [],
  selectedKey,
  defaultSelectedKey,
  onSelect,
  searchable = false,
  searchPlaceholder = "Search…",
  header,
  footer,
  emptyText = "No matches.",
  className,
  "aria-label": ariaLabel = "Sidebar",
}: SidebarProps) {
  const [query, setQuery] = useState("");
  const [uncontrolled, setUncontrolled] = useState(defaultSelectedKey);
  const selected = selectedKey ?? uncontrolled;

  const visible = useMemo(() => filterItems(items, query.trim().toLowerCase()), [items, query]);

  const handleSelect = (info: SidebarSelectInfo) => {
    if (selectedKey === undefined) setUncontrolled(info.key);
    onSelect?.(info);
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      {header}
      {searchable ? (
        <div className={cn("shrink-0 px-3 pb-2", header ? "pt-1" : "pt-3")}>
          <SearchInput size="small" wait={0} placeholder={searchPlaceholder} onChange={setQuery} />
        </div>
      ) : null}
      <OverlayScroll className="min-h-0 flex-1" innerClassName={cn("px-2 pb-6", !searchable && !header && "pt-2")}>
        <nav aria-label={ariaLabel}>
          {visible.length === 0 ? <p className="px-2 py-4 text-sm text-muted-foreground">{emptyText}</p> : <SidebarList items={visible} selected={selected} onSelect={handleSelect} />}
        </nav>
      </OverlayScroll>
      {footer}
    </div>
  );
}
