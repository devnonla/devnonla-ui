import { createContext, type MouseEvent as ReactMouseEvent, type ReactNode, type PointerEvent as ReactPointerEvent, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";
import { glassSurfaceClass } from "../lib/surface";
import { OverlayScroll, type OverlayScrollVisibility } from "../scroll/OverlayScroll";

type Phase = "open" | "leaving";
type Size = { w: number; h: number };
type Point = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };
type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const EASE = "var(--nonla-ease-out, cubic-bezier(0.16, 1, 0.3, 1))";
const MIN_W = 400;
const MIN_H = 240;

const HANDLES: { edge: Edge; className: string; cursor: string }[] = [
  { edge: "n", className: "-top-1 right-3 left-3 h-2 cursor-n-resize", cursor: "n-resize" },
  { edge: "s", className: "-bottom-1 right-3 left-3 h-2 cursor-s-resize", cursor: "s-resize" },
  { edge: "e", className: "-right-1.5 top-3 bottom-3 w-1.5 cursor-e-resize", cursor: "e-resize" },
  { edge: "w", className: "-left-1.5 top-3 bottom-3 w-1.5 cursor-w-resize", cursor: "w-resize" },
  { edge: "ne", className: "-top-1 -right-1.5 size-3 cursor-nesw-resize", cursor: "nesw-resize" },
  { edge: "nw", className: "-top-1 -left-1.5 size-3 cursor-nwse-resize", cursor: "nwse-resize" },
  { edge: "se", className: "-bottom-1 -right-1.5 size-3 cursor-nwse-resize", cursor: "nwse-resize" },
  { edge: "sw", className: "-bottom-1 -left-1.5 size-3 cursor-nesw-resize", cursor: "nesw-resize" },
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(target.closest(".monaco-editor"));
}

function hasOpenDialog() {
  return Boolean(document.querySelector('[role="dialog"][data-state="open"], .nonla-modal-content'));
}

function originFromActiveIcon(overlay: HTMLElement, frame: HTMLElement) {
  const source = document.querySelector('[aria-current="true"]');
  if (!(source instanceof HTMLElement)) return "50% 50%";

  const icon = source.getBoundingClientRect();
  const overlayBox = overlay.getBoundingClientRect();
  const x = icon.left + icon.width / 2 - overlayBox.left - frame.offsetLeft;
  const y = icon.top + icon.height / 2 - overlayBox.top - frame.offsetTop;
  return `${x}px ${y}px`;
}

function compactSize(view: Size): Size {
  return {
    w: Math.min(window.innerWidth * 0.8, view.w),
    h: Math.max(0, view.h - 80),
  };
}

function clampSize(view: Size, size: Size): Size {
  return {
    w: Math.min(view.w, Math.max(Math.min(MIN_W, view.w), size.w)),
    h: Math.min(view.h, Math.max(Math.min(MIN_H, view.h), size.h)),
  };
}

function windowSize(view: Size, size: Size | null): Size {
  return size ? clampSize(view, size) : compactSize(view);
}

function clampOffset(view: Size, compact: Size, next: Point) {
  const maxX = Math.max(0, (view.w - compact.w) / 2);
  const maxY = Math.max(0, (view.h - compact.h) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, next.x)),
    y: Math.min(maxY, Math.max(-maxY, next.y)),
  };
}

function collapsedRect(view: Size, offset: Point, size: Size | null): Rect {
  const compact = windowSize(view, size);
  const clamped = clampOffset(view, compact, offset);
  return {
    x: (view.w - compact.w) / 2 + clamped.x,
    y: (view.h - compact.h) / 2 + clamped.y,
    w: compact.w,
    h: compact.h,
  };
}

function applyResize(view: Size, orig: Rect, edge: Edge, dx: number, dy: number): Rect {
  let w = orig.w;
  let h = orig.h;
  if (edge.includes("e")) w = orig.w + dx;
  if (edge.includes("s")) h = orig.h + dy;
  if (edge.includes("w")) w = orig.w - dx;
  if (edge.includes("n")) h = orig.h - dy;

  const minW = Math.min(MIN_W, view.w);
  const minH = Math.min(MIN_H, view.h);
  w = Math.min(view.w, Math.max(minW, w));
  h = Math.min(view.h, Math.max(minH, h));

  let x = orig.x;
  let y = orig.y;
  if (edge.includes("w")) {
    x = orig.x + orig.w - w;
    if (x < 0) {
      w += x;
      x = 0;
    }
  } else if (edge.includes("e")) {
    if (x + w > view.w) w = view.w - x;
  } else {
    x = Math.min(Math.max(0, orig.x), Math.max(0, view.w - w));
  }

  if (edge.includes("n")) {
    y = orig.y + orig.h - h;
    if (y < 0) {
      h += y;
      y = 0;
    }
  } else if (edge.includes("s")) {
    if (y + h > view.h) h = view.h - y;
  } else {
    y = Math.min(Math.max(0, orig.y), Math.max(0, view.h - h));
  }

  return { x, y, w, h };
}

function offsetFromRect(view: Size, rect: Rect): Point {
  return {
    x: rect.x - (view.w - rect.w) / 2,
    y: rect.y - (view.h - rect.h) / 2,
  };
}

type Geometry = Point & Size;

const GEOMETRY_PREFIX = "nonla-desktop-window:";
const geometryMemory = new Map<string, Geometry>();

function isGeometry(value: unknown): value is Geometry {
  if (!value || typeof value !== "object") return false;
  const { x, y, w, h } = value as Record<string, unknown>;
  return [x, y, w, h].every((n) => typeof n === "number" && Number.isFinite(n));
}

function geometryStorageKey(persistKey: string) {
  return `${GEOMETRY_PREFIX}${persistKey}`;
}

function readGeometry(persistKey: string | false): Geometry | null {
  if (!persistKey) return null;
  const cached = geometryMemory.get(persistKey);
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(geometryStorageKey(persistKey));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isGeometry(parsed)) return null;
    geometryMemory.set(persistKey, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function writeGeometry(persistKey: string | false, geometry: Geometry) {
  if (!persistKey) return;
  geometryMemory.set(persistKey, geometry);
  try {
    localStorage.setItem(geometryStorageKey(persistKey), JSON.stringify(geometry));
  } catch {
    /* private mode / quota */
  }
}

function initialView(): Size {
  return { w: window.innerWidth, h: Math.max(0, window.innerHeight - 42) };
}

function restoreGeometry(persistKey: string | false, view: Size): { offset: Point; size: Size | null } {
  const stored = readGeometry(persistKey);
  if (!stored) return { offset: { x: 0, y: 0 }, size: null };
  const size = clampSize(view, stored);
  return { offset: clampOffset(view, size, stored), size };
}

function persistGeometry(persistKey: string | false, view: Size, offset: Point, size: Size | null) {
  const compact = windowSize(view, size);
  const clamped = clampOffset(view, compact, offset);
  writeGeometry(persistKey, {
    x: Math.round(clamped.x),
    y: Math.round(clamped.y),
    w: Math.round(compact.w),
    h: Math.round(compact.h),
  });
}

function lockResizeCursor(cursor: string | null) {
  document.body.style.cursor = cursor ?? "";
  document.body.style.userSelect = cursor ? "none" : "";
}

function GlyphClose() {
  return (
    <svg width="7" height="7" viewBox="0 0 6 6" aria-hidden className="block">
      <path d="M1.1 1.1l3.8 3.8M4.9 1.1L1.1 4.9" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function GlyphExpand({ restore }: { restore?: boolean }) {
  if (restore) {
    return (
      <svg width="7" height="7" viewBox="0 0 6 6" aria-hidden className="block">
        <path d="M1.1 2.4V.9H2.6M4.9 3.6v1.5H3.4" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="7" height="7" viewBox="0 0 6 6" aria-hidden className="block">
      <path d="M.8 3.4V.8H3.4zM5.2 2.6v2.6H2.6z" fill="currentColor" />
    </svg>
  );
}

function TrafficLight({
  label,
  onClick,
  shortcut,
  tone,
  children,
}: {
  label: string;
  onClick: () => void;
  shortcut?: string;
  tone: "close" | "expand";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-keyshortcuts={shortcut}
      onClick={onClick}
      className={`inline-flex size-3.5 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-full border-0 p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${tone === "close" ? "bg-[#ff5f57] text-[#7a1210]" : "bg-[#28c840] text-[#0d5c18]"}`}
    >
      <span className="flex opacity-0 transition-opacity duration-75 group-hover/traffic:opacity-100 group-focus-within/traffic:opacity-100">{children}</span>
    </button>
  );
}

type WindowHeaderSlot = {
  left: HTMLElement | null;
  right: HTMLElement | null;
};

const WindowHeaderSlotContext = createContext<WindowHeaderSlot | null>(null);

export type WindowHeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
};

/** Injects into the window title bar from a child. Prefer `DesktopWindow` `left` / `right` when the parent can pass them. */
export function WindowHeader({ left, right }: WindowHeaderProps) {
  const ctx = useContext(WindowHeaderSlotContext);
  if (!ctx) return null;
  return (
    <>
      {ctx.left && left != null ? createPortal(left, ctx.left) : null}
      {ctx.right && right != null ? createPortal(right, ctx.right) : null}
    </>
  );
}

export type DesktopWindowProps = {
  title?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  expanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
  /** Overlay auto-hide scrollbar on the body. Pass `false` when children manage their own scroll (split panes, AgentPanel). */
  scroll?: boolean;
  scrollbar?: OverlayScrollVisibility;
  /** Last collapsed position and size. Default `"default"`. Pass a unique key per window, or `false` to disable. */
  persistKey?: string | false;
  children: ReactNode;
};

export function DesktopWindow({
  title,
  left,
  right,
  expanded,
  onClose,
  onToggleExpand,
  scroll = true,
  scrollbar = "hover",
  persistKey = "default",
  children,
}: DesktopWindowProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLElement>(null);
  const closedRef = useRef(false);
  const expandedRef = useRef(expanded);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const resizeRef = useRef<{
    pointerId: number;
    edge: Edge;
    startX: number;
    startY: number;
    orig: Rect;
  } | null>(null);
  const [phase, setPhase] = useState<Phase>("open");
  const [view, setView] = useState<Size>(initialView);
  const [offset, setOffset] = useState(() => restoreGeometry(persistKey, initialView()).offset);
  const [size, setSize] = useState<Size | null>(() => restoreGeometry(persistKey, initialView()).size);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const sizeRef = useRef<Size | null>(null);
  const [leftSlot, setLeftSlot] = useState<HTMLDivElement | null>(null);
  const [rightSlot, setRightSlot] = useState<HTMLDivElement | null>(null);
  const headerChrome = useMemo(() => ({ left: leftSlot, right: rightSlot }), [leftSlot, rightSlot]);
  const requestCloseRef = useRef<() => void>(() => {});
  const viewRef = useRef(view);
  const offsetRef = useRef(offset);
  const draggingRef = useRef(false);
  const gestureCleanupRef = useRef<(() => void) | null>(null);
  expandedRef.current = expanded;
  sizeRef.current = size;
  viewRef.current = view;
  offsetRef.current = offset;

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const frame = frameRef.current;
    if (overlay && frame) {
      frame.style.transformOrigin = originFromActiveIcon(overlay, frame);
    }
  }, []);

  const requestClose = () => {
    if (closedRef.current || phase === "leaving") return;
    if (prefersReducedMotion()) {
      closedRef.current = true;
      onClose();
      return;
    }
    setPhase("leaving");
  };
  requestCloseRef.current = requestClose;

  useEffect(() => {
    if (phase !== "leaving") return;
    const t = window.setTimeout(() => {
      if (closedRef.current) return;
      closedRef.current = true;
      onClose();
    }, 280);
    return () => window.clearTimeout(t);
  }, [phase, onClose]);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const sync = () => {
      const next = { w: overlay.clientWidth, h: overlay.clientHeight };
      setView((prev) => (prev.w === next.w && prev.h === next.h ? prev : next));
      if (expandedRef.current) return;
      const fitted = windowSize(next, sizeRef.current);
      if (sizeRef.current) {
        setSize((current) => {
          if (!current || (current.w === fitted.w && current.h === fitted.h)) return current;
          return fitted;
        });
      }
      setOffset((current) => {
        const clamped = clampOffset(next, fitted, current);
        if (clamped.x === current.x && clamped.y === current.y) return current;
        return clamped;
      });
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(overlay);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (dragging || resizing) return;
    persistGeometry(persistKey, view, offset, size);
  }, [dragging, resizing, offset, size, view, persistKey]);

  useEffect(() => {
    return () => {
      persistGeometry(persistKey, viewRef.current, offsetRef.current, sizeRef.current);
    };
  }, [persistKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || isEditableTarget(e.target) || hasOpenDialog()) return;
      e.preventDefault();
      requestCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      gestureCleanupRef.current?.();
      gestureCleanupRef.current = null;
      lockResizeCursor(null);
    };
  }, []);

  const listenPointer = (pointerId: number, onMove: (e: PointerEvent) => void) => {
    gestureCleanupRef.current?.();

    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      if (e.buttons === 0) {
        up(e);
        return;
      }
      onMove(e);
    };

    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", up, true);
      gestureCleanupRef.current = null;
      dragRef.current = null;
      resizeRef.current = null;
      draggingRef.current = false;
      setDragging(false);
      setResizing(false);
      lockResizeCursor(null);
    };

    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", up, true);
    gestureCleanupRef.current = () => {
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", up, true);
    };
  };

  const startDrag = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || expanded || phase === "leaving" || resizeRef.current) return;
    if ((e.target as HTMLElement).closest("button, a, input, textarea, select, [role='button']")) return;

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: offsetRef.current.x,
      origY: offsetRef.current.y,
    };

    listenPointer(e.pointerId, (ev) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = ev.clientX - drag.startX;
      const dy = ev.clientY - drag.startY;
      if (!draggingRef.current && dx * dx + dy * dy < 16) return;
      if (!draggingRef.current) {
        draggingRef.current = true;
        setDragging(true);
      }
      const nextView = viewRef.current;
      setOffset(
        clampOffset(nextView, windowSize(nextView, sizeRef.current), {
          x: drag.origX + dx,
          y: drag.origY + dy,
        }),
      );
    });
  };

  const startResize = (edge: Edge, e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || phase === "leaving") return;
    e.stopPropagation();
    e.preventDefault();

    const nextView = viewRef.current;
    const orig = expandedRef.current
      ? { x: 0, y: 0, w: nextView.w, h: nextView.h }
      : collapsedRect(nextView, offsetRef.current, sizeRef.current);

    if (expandedRef.current) {
      const nextSize = { w: orig.w, h: orig.h };
      const nextOffset = offsetFromRect(nextView, orig);
      sizeRef.current = nextSize;
      offsetRef.current = nextOffset;
      setSize(nextSize);
      setOffset(nextOffset);
      onToggleExpand();
    }

    resizeRef.current = {
      pointerId: e.pointerId,
      edge,
      startX: e.clientX,
      startY: e.clientY,
      orig,
    };
    setResizing(true);
    lockResizeCursor(HANDLES.find((handle) => handle.edge === edge)?.cursor ?? "nwse-resize");

    listenPointer(e.pointerId, (ev) => {
      const gesture = resizeRef.current;
      if (!gesture) return;
      const nextView = viewRef.current;
      const next = applyResize(nextView, gesture.orig, gesture.edge, ev.clientX - gesture.startX, ev.clientY - gesture.startY);
      setSize({ w: next.w, h: next.h });
      setOffset(offsetFromRect(nextView, next));
    });
  };

  const onTitleBarDoubleClick = (e: ReactMouseEvent<HTMLElement>) => {
    if (phase === "leaving") return;
    if ((e.target as HTMLElement).closest("button, a, input, textarea, select, [role='button']")) return;
    e.preventDefault();
    dragRef.current = null;
    setDragging(false);
    onToggleExpand();
  };

  const visible = phase === "open";
  const leaving = phase === "leaving";
  const rect = expanded ? { x: 0, y: 0, w: view.w, h: view.h } : collapsedRect(view, offset, size);
  const reduce = prefersReducedMotion();
  const duration = reduce ? "150ms" : "300ms";
  const geom = !dragging && !resizing && !leaving && !reduce ? `top ${duration} ${EASE}, left ${duration} ${EASE}, width ${duration} ${EASE}, height ${duration} ${EASE}` : "";
  const fade = leaving && !reduce ? `opacity ${duration} ${EASE}, transform ${duration} ${EASE}` : "";

  return (
    <WindowHeaderSlotContext.Provider value={headerChrome}>
      <div ref={overlayRef} className="nonla-window-layer pointer-events-none absolute inset-x-0 bottom-0 top-desktop-bar">
        <section
          ref={frameRef}
          aria-label={typeof title === "string" && title ? title : "Window"}
          onTransitionEnd={(e) => {
            if (e.target !== e.currentTarget) return;
            if (phase !== "leaving") return;
            if (e.propertyName !== "opacity" && e.propertyName !== "transform") return;
            if (closedRef.current) return;
            closedRef.current = true;
            onClose();
          }}
          style={{
            top: rect.y,
            left: rect.x,
            width: rect.w,
            height: rect.h,
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.18)",
            transition: [geom, fade].filter(Boolean).join(", ") || undefined,
          }}
          data-expanded={expanded || undefined}
          className={cn("absolute flex flex-col rounded-xl pointer-events-auto transform-gpu", glassSurfaceClass, "nonla-window-glass", leaving && "pointer-events-none")}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
            <header
              onPointerDown={startDrag}
              className="flex h-8 shrink-0 cursor-default items-center gap-4 border-0 border-b border-solid border-ink-line px-3 select-none touch-none"
            >
              <div className="group/traffic flex shrink-0 items-center gap-2">
                <TrafficLight label="Close window" tone="close" onClick={requestClose} shortcut="Esc">
                  <GlyphClose />
                </TrafficLight>
                <TrafficLight label={expanded ? "Restore window" : "Expand window"} tone="expand" onClick={onToggleExpand} shortcut="Shift + ↑">
                  <GlyphExpand restore={expanded} />
                </TrafficLight>
              </div>
              <div className="flex min-w-0 flex-1 items-center">
                <div className="flex min-w-0 items-center">
                  {left}
                  <div ref={setLeftSlot} className="contents" />
                </div>
                {/* biome-ignore lint/a11y/noStaticElementInteractions: middle strip double-clicks to expand */}
                <div onDoubleClick={onTitleBarDoubleClick} className="flex min-w-8 flex-1 items-center self-stretch px-2">
                  {typeof title === "string" ? <span className="min-w-0 truncate text-xs font-semibold leading-none text-foreground/90">{title}</span> : title}
                </div>
                <div className="flex shrink-0 items-center">
                  {right}
                  <div ref={setRightSlot} className="contents" />
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-hidden">
              {scroll ? (
                <OverlayScroll visibility={scrollbar} className="h-full">
                  {children}
                </OverlayScroll>
              ) : (
                children
              )}
            </div>
          </div>

          {!leaving
            ? HANDLES.map((handle) => (
                <div key={handle.edge} aria-hidden onPointerDown={(e) => startResize(handle.edge, e)} className={cn("absolute z-10 touch-none", handle.className)} />
              ))
            : null}
        </section>
      </div>
    </WindowHeaderSlotContext.Provider>
  );
}
