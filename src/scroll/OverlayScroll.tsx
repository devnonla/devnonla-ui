import { type ReactNode, type PointerEvent as ReactPointerEvent, type Ref, type UIEventHandler, useCallback, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";

export type OverlayScrollVisibility = "hover" | "always";

const HIDE_MS = 1000;
const MIN_THUMB = 32;

export type OverlayScrollProps = {
  /** `hover` shows the thumb on hover / while scrolling. `always` keeps it visible. */
  visibility?: OverlayScrollVisibility;
  /** Size to content (honors max-height on `className`) instead of filling the parent. */
  autoHeight?: boolean;
  className?: string;
  innerClassName?: string;
  children?: ReactNode;
  onScroll?: UIEventHandler<HTMLDivElement>;
  scrollRef?: Ref<HTMLDivElement>;
};

type Thumb = { offset: number; size: number; shown: boolean };
type Axis = "x" | "y";

const HIDDEN: Thumb = { offset: 0, size: 0, shown: false };

function assignRef(ref: Ref<HTMLDivElement> | undefined, node: HTMLDivElement | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(node);
  else ref.current = node;
}

function measure(scroll: number, scrollSize: number, client: number): Thumb {
  const overflow = scrollSize - client;
  if (overflow <= 1) return HIDDEN;
  const size = Math.max(MIN_THUMB, (client / scrollSize) * client);
  const offset = (scroll / overflow) * (client - size);
  return { offset, size, shown: true };
}

function canScrollX(el: HTMLDivElement) {
  const overflow = getComputedStyle(el).overflowX;
  return overflow === "auto" || overflow === "scroll";
}

export function OverlayScroll({ visibility = "hover", autoHeight = false, className, innerClassName, children, onScroll, scrollRef }: OverlayScrollProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vThumbRef = useRef<Thumb>(HIDDEN);
  const hThumbRef = useRef<Thumb>(HIDDEN);
  const [scrolling, setScrolling] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [vThumb, setVThumb] = useState<Thumb>(HIDDEN);
  const [hThumb, setHThumb] = useState<Thumb>(HIDDEN);
  vThumbRef.current = vThumb;
  hThumbRef.current = hThumb;

  const updateThumb = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    setVThumb(measure(el.scrollTop, el.scrollHeight, el.clientHeight));
    setHThumb(canScrollX(el) ? measure(el.scrollLeft, el.scrollWidth, el.clientWidth) : HIDDEN);
  }, []);

  const setNode = useCallback(
    (node: HTMLDivElement | null) => {
      elRef.current = node;
      assignRef(scrollRef, node);
      if (node) requestAnimationFrame(updateThumb);
    },
    [scrollRef, updateThumb],
  );

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;
    updateThumb();
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    const child = el.firstElementChild;
    if (child) ro.observe(child);
    return () => ro.disconnect();
  }, [updateThumb, innerClassName, autoHeight]);

  useLayoutEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const handleScroll: UIEventHandler<HTMLDivElement> = (e) => {
    updateThumb();
    if (visibility === "hover" && !dragging) {
      setScrolling(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setScrolling(false), HIDE_MS);
    }
    onScroll?.(e);
  };

  const onThumbPointerDown = (axis: Axis) => (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = elRef.current;
    const current = axis === "y" ? vThumbRef.current : hThumbRef.current;
    if (!el || !current.shown || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const overflow = axis === "y" ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
    const track = (axis === "y" ? el.clientHeight : el.clientWidth) - current.size;
    if (overflow <= 0 || track <= 0) return;

    const start = axis === "y" ? e.clientY : e.clientX;
    const startOffset = current.offset;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setScrolling(true);

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      const delta = (axis === "y" ? ev.clientY : ev.clientX) - start;
      const next = Math.min(track, Math.max(0, startOffset + delta));
      const pos = (next / track) * overflow;
      if (axis === "y") el.scrollTop = pos;
      else el.scrollLeft = pos;
    };
    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onUp, true);
      setDragging(false);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setScrolling(false), HIDE_MS);
    };
    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onUp, true);
  };

  const thumbVisible = visibility === "always" || dragging || scrolling;
  const thumbClass = cn(
    "nonla-overlay-thumb absolute z-20 rounded-full transition-opacity duration-150",
    visibility === "always" || dragging
      ? "pointer-events-auto opacity-100"
      : "pointer-events-none opacity-0 group-hover/scroll:pointer-events-auto group-hover/scroll:opacity-100 group-data-scrolling/scroll:pointer-events-auto group-data-scrolling/scroll:opacity-100",
  );

  return (
    <div className={cn("group/scroll relative min-h-0 min-w-0 w-full overflow-hidden", className)} data-scrolling={thumbVisible ? "true" : undefined}>
      <div
        ref={setNode}
        onScroll={handleScroll}
        className={cn("nonla-scroll-hidden overflow-y-auto overflow-x-hidden [overflow-anchor:none]", autoHeight ? "max-h-[inherit]" : "absolute inset-0", innerClassName)}
      >
        {children}
      </div>
      {vThumb.shown ? (
        <div aria-hidden onPointerDown={onThumbPointerDown("y")} className={thumbClass} style={{ right: 2, width: "var(--nonla-scrollbar-size)", height: vThumb.size, transform: `translateY(${vThumb.offset}px)` }} />
      ) : null}
      {hThumb.shown ? (
        <div aria-hidden onPointerDown={onThumbPointerDown("x")} className={thumbClass} style={{ bottom: 2, height: "var(--nonla-scrollbar-size)", width: hThumb.size, transform: `translateX(${hThumb.offset}px)` }} />
      ) : null}
    </div>
  );
}
