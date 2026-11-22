import * as Dialog from "@radix-ui/react-dialog";
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { usePopupContainer } from "../app/context";
import { Icon, isIconName } from "../icon/Icon";
import { Kbd } from "../kbd/Kbd";
import { cn } from "../lib/cn";

export type CommandItem = {
  key: string;
  /** Main text. A string is also what the query matches. */
  label: ReactNode;
  /** Muted context after an em dash, e.g. the section a page lives in. */
  description?: ReactNode;
  /** An `Icon` name, or a node. */
  icon?: ReactNode;
  /** Extra words the query should match (aliases, ids). */
  keywords?: string[];
  /** Keys shown on the right, e.g. `["⌘", "N"]`. Display only. */
  shortcut?: string[];
  disabled?: boolean;
  /** Runs on Enter or click. The palette closes afterwards unless you return `false`. */
  onSelect?: () => unknown;
};

export type CommandGroup = {
  /** Small muted heading, e.g. "Recents". */
  label?: ReactNode;
  items: CommandItem[];
};

export type CommandPaletteProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  groups: CommandGroup[];
  placeholder?: string;
  /** Shown when nothing matches the query. */
  emptyText?: ReactNode;
  /** Open on ⌘K / Ctrl+K anywhere on the page. Default `true`. */
  hotkey?: boolean;
  /** Called on every keystroke, for remote search. Local filtering still runs on `label`, `description`, and `keywords`. */
  onQueryChange?: (query: string) => void;
  /** Turn off local filtering, e.g. when `groups` already hold remote results. Default `true`. */
  filter?: boolean;
  className?: string;
};

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  return "";
}

function matches(item: CommandItem, q: string) {
  if (!q) return true;
  const hay = [textOf(item.label), textOf(item.description), ...(item.keywords ?? [])].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((word) => hay.includes(word));
}

/**
 * ⌘K palette (measured on Cloudflare): a top-anchored panel, grouped rows of icon + label — context,
 * a pale page wash behind it, and key hints in the footer.
 */
export function CommandPalette({ open: openProp, defaultOpen = false, onOpenChange, groups, placeholder = "Search…", emptyText = "No results", hotkey = true, onQueryChange, filter = true, className }: CommandPaletteProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = openProp ?? innerOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const portal = usePopupContainer()?.();

  // ⌘K / Ctrl+K toggles from anywhere.
  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey, open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const visible = useMemo(
    () => groups.map((g) => ({ ...g, items: filter ? g.items.filter((it) => matches(it, query.trim())) : g.items })).filter((g) => g.items.length > 0),
    [groups, query, filter],
  );
  const flat = useMemo(() => visible.flatMap((g) => g.items), [visible]);
  const enabled = flat.filter((it) => !it.disabled);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (item: CommandItem | undefined) => {
    if (!item || item.disabled) return;
    const keep = item.onSelect?.() === false;
    if (!keep) setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!enabled.length) return;
      const dir = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + dir + enabled.length) % enabled.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(enabled[active]);
    }
  };

  const activeItem = enabled[active];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal container={portal}>
        <Dialog.Overlay className="fixed inset-0 z-(--nonla-z-modal) bg-(--mask) data-[state=open]:animate-[nonla-overlay-in_var(--nonla-dur)_var(--nonla-ease-out)] data-[state=closed]:animate-[nonla-overlay-out_var(--nonla-dur-fast)_var(--nonla-ease-in)_forwards]" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed top-[12vh] left-1/2 [transform:translate(-50%,0)] z-[calc(var(--nonla-z-modal)+1)] flex max-h-[min(560px,76vh)] w-[min(672px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg bg-card text-foreground shadow-(--nonla-card-shadow) outline-none",
            "data-[state=open]:animate-[nonla-modal-in_var(--nonla-dur)_var(--nonla-ease-out)] data-[state=closed]:animate-[nonla-modal-out_var(--nonla-dur-fast)_var(--nonla-ease-in)_forwards]",
            className,
          )}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <div className="flex items-center gap-2.5 border-b border-solid border-border-secondary px-3.5">
            <Icon name="search" size={16} className="text-tertiary-foreground" />
            <input
              // biome-ignore lint/a11y/noAutofocus: a palette exists to be typed into
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
                onQueryChange?.(e.target.value);
              }}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              role="combobox"
              aria-expanded
              aria-controls="nonla-command-list"
              aria-activedescendant={activeItem ? `nonla-command-${activeItem.key}` : undefined}
              className="h-12 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-foreground outline-none placeholder:text-tertiary-foreground"
            />
            <Kbd>Esc</Kbd>
          </div>

          <div ref={listRef} id="nonla-command-list" role="listbox" className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {visible.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">{emptyText}</div>
            ) : (
              visible.map((group, gi) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: groups are positional
                <div key={gi} role="group" className="not-first:mt-1.5">
                  {group.label != null ? <div className="px-2.5 pt-2 pb-1 text-xs font-medium text-tertiary-foreground">{group.label}</div> : null}
                  {group.items.map((item) => {
                    const index = enabled.indexOf(item);
                    const isActive = index === active && index !== -1;
                    return (
                      <div
                        key={item.key}
                        id={`nonla-command-${item.key}`}
                        role="option"
                        tabIndex={-1}
                        aria-selected={isActive}
                        aria-disabled={item.disabled || undefined}
                        data-active={isActive || undefined}
                        onMouseMove={() => index !== -1 && index !== active && setActive(index)}
                        onClick={() => run(item)}
                        className={cn(
                          "flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm",
                          isActive && "bg-ink-hover",
                          item.disabled && "cursor-not-allowed opacity-45",
                        )}
                      >
                        {item.icon != null ? (
                          <span className="inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4">{isIconName(item.icon) ? <Icon name={item.icon} size={16} /> : item.icon}</span>
                        ) : null}
                        <span className="min-w-0 flex-1 truncate">
                          <span className="text-foreground">{item.label}</span>
                          {item.description != null ? <span className="text-tertiary-foreground"> — {item.description}</span> : null}
                        </span>
                        {item.shortcut ? <Kbd keys={item.shortcut} /> : isActive ? <Icon name="arrow-forward" size={14} className="text-tertiary-foreground" /> : null}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-solid border-border-secondary px-3.5 py-2 text-xs text-tertiary-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Kbd keys={["↑", "↓"]} /> to navigate
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↵</Kbd> to select
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
