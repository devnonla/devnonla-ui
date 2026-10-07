import { type CSSProperties, type KeyboardEvent, type ReactNode, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { SolarIcon } from "../icon/SolarIcon";
import { solarIconName } from "../icon/solar";
import { cn } from "../lib/cn";

export type TabsItem = {
  key: string;
  label: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  /** Solar icon name (`settings`), a legacy Fluent Color id (`settings-24`), or a node. */
  icon?: ReactNode;
};

export type TabsProps = {
  items: TabsItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
};

/** Chevron sits in the clear zone. Tabs scroll in past the fade. */
const FADE = 32;
const EDGE = 64;
const TAB_HEIGHT = 40;

type Ink = { left: number; width: number };
type Overflow = { left: boolean; right: boolean };

function firstEnabled(items: TabsItem[], preferred?: string) {
  if (preferred && items.some((item) => item.key === preferred)) return preferred;
  return items.find((item) => !item.disabled)?.key ?? items[0]?.key ?? "";
}

function fadeOf(overflow: Overflow): "left" | "right" | "both" | "none" {
  if (overflow.left && overflow.right) return "both";
  if (overflow.left) return "left";
  if (overflow.right) return "right";
  return "none";
}

function maskImage(fade: ReturnType<typeof fadeOf>) {
  if (fade === "left") return `linear-gradient(to right, transparent ${FADE}px, #000 ${EDGE}px)`;
  if (fade === "right") return `linear-gradient(to left, transparent ${FADE}px, #000 ${EDGE}px)`;
  if (fade === "both") return `linear-gradient(to right, transparent ${FADE}px, #000 ${EDGE}px, #000 calc(100% - ${EDGE}px), transparent calc(100% - ${FADE}px))`;
  return undefined;
}

function scrollToX(el: HTMLElement, target: number) {
  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  el.scrollLeft = Math.min(max, Math.max(0, target));
}

function TabIcon({ icon, size }: { icon?: ReactNode; size: number }) {
  if (icon == null || icon === false) return null;
  if (typeof icon === "string") return <SolarIcon name={solarIconName(icon)} size={size} />;
  return <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>;
}

function ScrollButton({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "Scroll tabs left" : "Scroll tabs right"}
      className={cn(
        "absolute top-0 z-10 flex h-full w-8 cursor-pointer items-center justify-center border-0 bg-transparent text-tertiary-foreground hover:text-foreground",
        dir === "left" ? "left-0" : "right-0",
      )}
      onClick={onClick}
    >
      <SolarIcon name={dir === "left" ? "alt-arrow-left-linear" : "alt-arrow-right-linear"} size={16} />
    </button>
  );
}

export function Tabs({ items, activeKey, defaultActiveKey, onChange, className, style, "aria-label": ariaLabel = "Tabs" }: TabsProps) {
  const uid = useId();

  const [inner, setInner] = useState(() => firstEnabled(items, defaultActiveKey));
  const active = firstEnabled(items, activeKey ?? inner);
  const itemsKey = items.map((item) => item.key).join("\0");

  const scrollerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const focusKey = useRef<string | null>(null);

  const [ink, setInk] = useState<Ink | null>(null);
  const [overflow, setOverflow] = useState<Overflow>({ left: false, right: false });

  const updateOverflow = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft > 1;
    const right = max > 1 && el.scrollLeft < max - 1;
    setOverflow((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);

  const reveal = useCallback(() => {
    const scroller = scrollerRef.current;
    const tab = tabRefs.current.get(active);
    if (!scroller || !tab) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    if (max <= 1) return;
    const left = tab.offsetLeft;
    const right = left + tab.offsetWidth;
    const viewLeft = scroller.scrollLeft + EDGE;
    const viewRight = scroller.scrollLeft + scroller.clientWidth - EDGE;
    if (left < viewLeft) scrollToX(scroller, left - EDGE);
    else if (right > viewRight) scrollToX(scroller, right - scroller.clientWidth + EDGE);
    updateOverflow();
  }, [active, updateOverflow]);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const measure = () => {
      const el = tabRefs.current.get(active);
      if (!el) {
        setInk(null);
        return;
      }
      const next = { left: el.offsetLeft, width: el.offsetWidth };
      setInk((prev) => (prev && prev.left === next.left && prev.width === next.width ? prev : next));
      updateOverflow();
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (row) ro.observe(row);
    if (scrollerRef.current) ro.observe(scrollerRef.current);
    return () => ro.disconnect();
  }, [active, itemsKey, updateOverflow]);

  useLayoutEffect(() => {
    reveal();
  }, [active, itemsKey, reveal]);

  useLayoutEffect(() => {
    const key = focusKey.current;
    if (!key || key !== active) return;
    focusKey.current = null;
    tabRefs.current.get(key)?.focus({ preventScroll: true });
  }, [active]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 1) return;
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      if (event.deltaY === 0) return;
      const max = el.scrollWidth - el.clientWidth;
      const next = Math.min(max, Math.max(0, el.scrollLeft + event.deltaY));
      if (next === el.scrollLeft) return;
      el.scrollLeft = next;
      updateOverflow();
      event.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [itemsKey, updateOverflow]);

  function select(key: string, fromKeyboard = false) {
    if (fromKeyboard) focusKey.current = key;
    if (activeKey === undefined) setInner(key);
    if (key !== active) onChange?.(key);
  }

  function nudge(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const step = dir * Math.max(96, Math.round(el.clientWidth * 0.72));
    scrollToX(el, el.scrollLeft + step);
    updateOverflow();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = items.filter((item) => !item.disabled);
    if (!enabled.length) return;
    const index = enabled.findIndex((item) => item.key === active);
    let next = -1;
    if (event.key === "ArrowRight") next = index < 0 ? 0 : (index + 1) % enabled.length;
    else if (event.key === "ArrowLeft") next = index < 0 ? enabled.length - 1 : (index - 1 + enabled.length) % enabled.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;
    else return;
    event.preventDefault();
    const item = enabled[next];
    if (item) select(item.key, true);
  }

  const fade = fadeOf(overflow);
  const mask = maskImage(fade);
  const panel = items.find((item) => item.key === active);
  const showPanel = items.some((item) => item.children != null);

  return (
    <div className={cn("w-full min-w-0", className)} style={style}>
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border" />
        <div
          ref={scrollerRef}
          className="nonla-scroll-hidden relative overflow-x-auto overflow-y-hidden overscroll-x-contain"
          style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
          onScroll={updateOverflow}
        >
          <div ref={rowRef} role="tablist" aria-label={ariaLabel} aria-orientation="horizontal" className="relative flex w-max gap-3" onKeyDown={onKeyDown}>
            {ink ? <span aria-hidden className="nonla-tabs-ink" style={{ width: ink.width, transform: `translateX(${ink.left}px)` }} /> : null}
            {items.map((item) => {
              const selected = item.key === active;
              return (
                <button
                  key={item.key}
                  ref={(node) => {
                    if (node) tabRefs.current.set(item.key, node);
                    else tabRefs.current.delete(item.key);
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${item.key}`}
                  aria-selected={selected}
                  aria-controls={showPanel ? `${uid}-panel` : undefined}
                  tabIndex={selected ? 0 : -1}
                  disabled={item.disabled}
                  className={cn(
                    "relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border-0 bg-transparent font-normal text-tertiary-foreground transition-colors select-none",
                    "hover:text-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    selected && "text-foreground",
                  )}
                  style={{
                    height: TAB_HEIGHT,
                    paddingLeft: 4,
                    paddingRight: 4,
                    fontSize: 14,
                  }}
                  onClick={() => {
                    if (!item.disabled) select(item.key);
                  }}
                >
                  <TabIcon icon={item.icon} size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        {overflow.left ? <ScrollButton dir="left" onClick={() => nudge(-1)} /> : null}
        {overflow.right ? <ScrollButton dir="right" onClick={() => nudge(1)} /> : null}
      </div>
      {showPanel ? (
        <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${active}`} className="pt-3">
          {panel?.children}
        </div>
      ) : null}
    </div>
  );
}
