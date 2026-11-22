import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  forwardRef,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePopupContainer } from "../app/context";
import { menuItemClass } from "../dropdown/menuClasses";
import { Icon } from "../icon/Icon";
import { cn } from "../lib/cn";
import { type ControlSize, controlFieldFocusBorder, controlFieldStyle, controlFieldSurface, controlFieldTransition, controlStatusClass, useControlSize } from "../lib/sizes";
import { glassOverlayClass } from "../lib/surface";

export type SelectValue = string | number;

export type SelectOptionConfig = {
  /** Shown in the list and in the trigger. */
  label: ReactNode;
  value: SelectValue;
  disabled?: boolean;
  /** Muted second line, in the list only (the trigger keeps one line). Search matches it too. */
  description?: ReactNode;
};

export type SelectProps = {
  value?: SelectValue | null;
  defaultValue?: SelectValue | null;
  // Call sites often use (v: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (value: any) => void;
  // Many call sites type handlers as `(v: string) => void`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: SelectOptionConfig[];
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showSearch?: boolean | { optionFilterProp?: "label" | "value" | string };
  popupMatchSelectWidth?: boolean;
  size?: ControlSize;
  status?: "error" | "warning";
  className?: string;
  popupClassName?: string;
  /** @deprecated Not parsed; pass `options`. Kept so antd-style markup type-checks. */
  children?: ReactNode;
  /** Alias of `onChange` for a single pick. */
  onSelect?: (value: SelectValue) => void;
  /** Custom row content in the list (any height). The trigger still shows `label`. Extra fields you put on an option (email, role) come through. */
  optionRender?: (option: SelectOptionConfig & Record<string, any>, info: { selected: boolean }) => ReactNode;
};

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="opacity-60">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  if (isValidElement(node)) return textOf((node as ReactElement<{ children?: ReactNode }>).props.children);
  return "";
}

function optionSearchText(opt: SelectOptionConfig, prop: string): string {
  if (prop === "value") return String(opt.value);
  return [textOf(opt.label) || String(opt.value), textOf(opt.description)].join(" ");
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    value,
    defaultValue,
    onChange,
    onSelect,
    options = [],
    placeholder = "Select",
    disabled,
    allowClear,
    showSearch,
    popupMatchSelectWidth = true,
    size,
    status,
    className,
    popupClassName,
    optionRender,
  },
  ref,
) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState<SelectValue | null>(defaultValue ?? null);
  const selected = controlled ? (value ?? null) : inner;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [triggerW, setTriggerW] = useState<number>();
  const triggerRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const resolvedSize = useControlSize(size);
  const portal = usePopupContainer()?.();

  const searchable = Boolean(showSearch);
  // Search what the user sees: the label (falls back to value when the label is not text).
  const filterProp =
    typeof showSearch === "object" ? (showSearch.optionFilterProp ?? "label") : "label";

  const selectedOpt = options.find((o) => o.value === selected);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => optionSearchText(o, filterProp).toLowerCase().includes(q));
  }, [options, query, searchable, filterProp]);

  useLayoutEffect(() => {
    if (!open) return;
    const w = triggerRef.current?.offsetWidth;
    if (w) setTriggerW(w);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
      return;
    }
    // Opening by typing already set `query` and highlight. A click opens with an empty query.
    if (!query) {
      const idx = options.findIndex((o) => o.value === selected);
      setActive(idx >= 0 ? idx : 0);
    }
    if (!searchable) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
    // `query` is only read for the closed → open transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, searchable]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>("[data-active='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [active, filtered]);

  const commit = (next: SelectValue | null) => {
    if (!controlled) setInner(next);
    onChange?.(next);
    if (next != null) onSelect?.(next);
    setOpen(false);
  };

  const move = (dir: 1 | -1) => {
    const enabledIdx = filtered.map((o, i) => ({ o, i })).filter((x) => !x.o.disabled);
    if (!enabledIdx.length) return;
    const cur = enabledIdx.findIndex((x) => x.i === active);
    const from = cur < 0 ? (dir === 1 ? -1 : 0) : cur;
    const next = enabledIdx[(from + dir + enabledIdx.length) % enabledIdx.length];
    if (next) setActive(next.i);
  };

  const pickActive = () => {
    const opt = filtered[active];
    if (opt && !opt.disabled) commit(opt.value);
  };

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || e.nativeEvent.isComposing) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pickActive();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const focusSearch = () => {
    const input = searchRef.current;
    if (!input) return;
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  };

  const eventInsideTrigger = (target: EventTarget | null) => target instanceof Node && !!triggerRef.current?.contains(target);

  const onListKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pickActive();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const setRefs = (node: HTMLElement | null) => {
    triggerRef.current = node;
    const buttonNode = node as HTMLButtonElement | null;
    if (typeof ref === "function") ref(buttonNode);
    else if (ref) ref.current = buttonNode;
  };

  const showClear = allowClear && selected != null && selected !== "" && !disabled;
  const display = selectedOpt ? selectedOpt.label : selected != null && selected !== "" ? String(selected) : placeholder;
  const displayEmpty = !selectedOpt && (selected == null || selected === "");
  // A rich label (icon + text) is an element: lay it out as a centered flex row, not inline on the text baseline.
  const richDisplay = isValidElement(display);
  const activeId = open && filtered[active] ? `${listId}-opt-${active}` : undefined;

  const fieldClass = cn(
    "group/select inline-flex w-full items-center gap-2 text-left",
    controlFieldSurface,
    controlFieldTransition,
    controlFieldFocusBorder,
    "outline-none disabled:cursor-not-allowed disabled:opacity-45",
    controlStatusClass(status),
    className,
  );

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        if (disabled) return;
        setOpen(v);
      }}
    >
      {searchable ? (
        <PopoverPrimitive.Anchor asChild>
          <div
            ref={setRefs}
            data-state={open ? "open" : "closed"}
            aria-disabled={disabled || undefined}
            className={cn(fieldClass, "cursor-text", disabled && "cursor-not-allowed opacity-45")}
            style={controlFieldStyle(resolvedSize)}
            onPointerDown={(e) => {
              if (disabled) return;
              const target = e.target as HTMLElement;
              if (target.closest("[data-select-affix]")) return;
              if (!open) setOpen(true);
              if (target !== searchRef.current) {
                e.preventDefault();
                focusSearch();
              }
            }}
          >
            <div className="relative min-w-0 flex-1 overflow-hidden">
              {/* While searching, the current pick fades to plain text (no icon), so the caret starts cleanly before it. */}
              <span aria-hidden className={cn(richDisplay && !open ? "flex h-5 items-center overflow-hidden whitespace-nowrap" : "block truncate", (open && query) || displayEmpty ? "invisible" : open && "text-tertiary-foreground")}>
                {displayEmpty ? placeholder : open ? textOf(display) || display : display}
              </span>
              <input
                ref={searchRef}
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                aria-label={placeholder}
                disabled={disabled}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={open ? query : ""}
                placeholder={displayEmpty ? placeholder : undefined}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                  if (!open) setOpen(true);
                }}
                onKeyDown={onSearchKey}
                className={cn(
                  "absolute inset-0 w-full border-0 bg-transparent p-0 font-[inherit] leading-[inherit] text-inherit outline-none placeholder:text-tertiary-foreground",
                  !open && "caret-transparent",
                )}
              />
            </div>
            {/* One slot: the chevron, swapped for the clear button while hovered (no two icons side by side). */}
            <span className="grid size-4 shrink-0 place-items-center">
              {showClear ? (
                <span
                  data-select-affix=""
                  role="button"
                  tabIndex={-1}
                  aria-label="Clear"
                  className="pointer-events-none inline-flex size-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity [grid-area:1/1] hover:text-foreground group-hover/select:pointer-events-auto group-hover/select:opacity-100"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    commit(null);
                  }}
                >
                  <ClearIcon />
                </span>
              ) : null}
              <span
                data-select-affix=""
                className={cn("inline-flex cursor-pointer items-center justify-center transition-opacity [grid-area:1/1]", showClear && "group-hover/select:opacity-0")}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (disabled) return;
                  setOpen((v) => !v);
                }}
              >
                <Chevron />
              </span>
            </span>
          </div>
        </PopoverPrimitive.Anchor>
      ) : (
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={setRefs}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(fieldClass, "cursor-pointer focus-visible:outline-none")}
            style={controlFieldStyle(resolvedSize)}
            onKeyDown={onTriggerKey}
          >
            <span className={cn("min-w-0 flex-1", richDisplay ? "flex h-5 items-center overflow-hidden whitespace-nowrap" : "truncate", displayEmpty && "text-tertiary-foreground")}>{display}</span>
            <span className="grid size-4 shrink-0 place-items-center">
              {showClear ? (
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label="Clear"
                  className="pointer-events-none inline-flex size-4 cursor-pointer items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity [grid-area:1/1] hover:text-foreground group-hover/select:pointer-events-auto group-hover/select:opacity-100"
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    commit(null);
                  }}
                >
                  <ClearIcon />
                </span>
              ) : null}
              <span className={cn("inline-flex items-center justify-center transition-opacity [grid-area:1/1]", showClear && "group-hover/select:opacity-0")}>
                <Chevron />
              </span>
            </span>
          </button>
        </PopoverPrimitive.Trigger>
      )}
      <PopoverPrimitive.Portal container={portal}>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => {
            if (!searchable) return;
            e.preventDefault();
            focusSearch();
          }}
          onCloseAutoFocus={(e) => {
            if (searchable) e.preventDefault();
          }}
          onFocusOutside={(e) => {
            if (searchable && eventInsideTrigger(e.target)) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (searchable && eventInsideTrigger(e.target)) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (searchable && eventInsideTrigger(e.target)) e.preventDefault();
          }}
          onKeyDown={onListKey}
          className={cn(
            glassOverlayClass,
            "overflow-hidden p-0",
            popupClassName,
          )}
          style={{
            minWidth: triggerW,
            width: popupMatchSelectWidth ? triggerW : undefined,
          }}
        >
          <div ref={listRef} id={listId} role="listbox" tabIndex={-1} className="nonla-select-options flex max-h-72 flex-col gap-0.5 overflow-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-2.5 py-2 text-sm text-muted-foreground">No results</div>
            ) : (
              filtered.map((opt, i) => (
                <div
                  key={String(opt.value)}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={opt.value === selected}
                  data-active={i === active ? "true" : undefined}
                  data-highlighted={!opt.disabled && i === active && opt.value !== selected ? "" : undefined}
                  className={cn(
                    menuItemClass,
                    "cursor-pointer transition-none data-highlighted:border-transparent data-highlighted:bg-ink-hover",
                    opt.disabled && "pointer-events-none opacity-40",
                    !opt.disabled && opt.value === selected && "border-transparent bg-ink-active text-foreground shadow-none",
                  )}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (!opt.disabled) commit(opt.value);
                  }}
                >
                  {optionRender ? (
                    <div className="min-w-0 flex-1">{optionRender(opt, { selected: opt.value === selected })}</div>
                  ) : opt.description != null ? (
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{opt.label}</span>
                      <span className="truncate text-xs leading-4 text-muted-foreground">{opt.description}</span>
                    </span>
                  ) : (
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  )}
                  {opt.value === selected ? <Icon name="check" size={14} className="shrink-0 text-foreground" aria-hidden /> : null}
                </div>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
});

/** API compat — options-as-children is not parsed; pass `options`. */
export function SelectOption({ children }: { value: SelectValue; disabled?: boolean; children?: ReactNode }) {
  return <>{children}</>;
}
