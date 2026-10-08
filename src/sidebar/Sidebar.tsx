import { type MouseEvent, type ReactNode, useMemo, useState } from "react";
import { SolarIcon } from "../icon/SolarIcon";
import { solarIconName } from "../icon/solar";
import { SearchInput } from "../input/SearchInput";
import { cn } from "../lib/cn";
import { OverlayScroll } from "../scroll/OverlayScroll";

export type SidebarItemType = {
  key?: string;
  label?: ReactNode;
  /** Solar icon name (`settings`), a legacy Fluent Color id (`settings-24`), or a node. String icons render as bold-duotone. */
  icon?: ReactNode;
  disabled?: boolean;
  /** `"group"` is a section label. `"divider"` is a rule. Anything else is a row. */
  type?: "item" | "group" | "divider";
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
  return item.key ?? (item.type === "divider" ? `divider-${i}` : item.type === "group" ? `group-${i}` : `item-${i}`);
}

function labelText(label: ReactNode) {
  if (typeof label === "string" || typeof label === "number") return String(label);
  return "";
}

function matchesQuery(item: SidebarItemType, q: string) {
  return labelText(item.label).toLowerCase().includes(q);
}

/** A group label stays when it matches, or when a later row matches before the next group. */
function filterItems(items: SidebarItemType[], q: string): SidebarItemType[] {
  if (!q) return items;

  type Section = { group?: SidebarItemType; rows: SidebarItemType[] };
  const sections: Section[] = [];
  let current: Section = { rows: [] };
  for (const item of items) {
    if (item.type === "group") {
      if (current.group || current.rows.length) sections.push(current);
      current = { group: item, rows: [] };
      continue;
    }
    current.rows.push(item);
  }
  if (current.group || current.rows.length) sections.push(current);

  const out: SidebarItemType[] = [];
  for (const section of sections) {
    const kept: SidebarItemType[] = [];
    for (const row of section.rows) {
      if (row.type === "divider") {
        if (kept.length && kept[kept.length - 1]?.type !== "divider") kept.push(row);
        continue;
      }
      if (matchesQuery(row, q)) kept.push(row);
    }
    while (kept[kept.length - 1]?.type === "divider") kept.pop();
    if (section.group && (matchesQuery(section.group, q) || kept.length)) out.push(section.group);
    out.push(...kept);
  }
  return out;
}

function ItemIcon({ icon }: { icon?: ReactNode }) {
  if (icon == null || icon === false) return null;
  if (typeof icon === "string") return <SolarIcon name={solarIconName(icon, "bold-duotone")} size={16} />;
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
    <div className="flex flex-col gap-1">
      {items.map((item, i) => {
        const key = itemKey(item, i);
        if (item.type === "divider") {
          return <div key={key} className="mx-2 my-1 h-px bg-border" />;
        }
        if (item.type === "group") {
          if (item.label == null || item.label === "") return null;
          return (
            <div key={key} className={cn("px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-tertiary-foreground not-first:mt-4", item.className)}>
              {item.label}
            </div>
          );
        }

        const active = selected != null && key === selected;
        const className = cn(
          "nonla-sidebar-item box-border flex h-(--nonla-height) w-full items-center gap-3 rounded-(--nonla-radius) border-0 bg-transparent px-3 text-left text-[14px] font-normal text-foreground no-underline transition-[background-color,box-shadow] duration-(--nonla-dur-fast) ease-(--nonla-ease-out) hover:not-aria-current:not-disabled:not-aria-disabled:bg-ink-hover hover:not-disabled:not-aria-disabled:shadow-none aria-current:bg-ink-active aria-current:shadow-none aria-[current=page]:bg-ink-active aria-[current=page]:shadow-none",
          item.disabled ? "pointer-events-none cursor-not-allowed opacity-40" : "cursor-pointer",
          item.className,
        );

        const body = (
          <>
            <ItemIcon icon={item.icon} />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.extra != null ? <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{item.extra}</span> : null}
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
    </div>
  );
}

/** Side nav from a flat list. `type: "group"` is a section label. Router stays in the app (`onSelect` / `href`). */
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
        <div className={cn("shrink-0 px-3 pb-3", header ? "pt-1" : "pt-3")}>
          <SearchInput size="small" wait={0} placeholder={searchPlaceholder} onChange={setQuery} />
        </div>
      ) : null}
      <OverlayScroll className="min-h-0 flex-1" innerClassName={cn("px-3 pb-6", !searchable && !header && "pt-3")}>
        <nav aria-label={ariaLabel}>
          {visible.length === 0 ? <p className="px-3 py-4 text-sm text-muted-foreground">{emptyText}</p> : <SidebarList items={visible} selected={selected} onSelect={handleSelect} />}
        </nav>
      </OverlayScroll>
      {footer}
    </div>
  );
}
