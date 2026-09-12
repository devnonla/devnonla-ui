import { type PointerEvent as ReactPointerEvent, type ReactNode, type Ref, type UIEventHandler, useCallback, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";

export type OverlayScrollVisibility = "hover" | "always";

const HIDE_MS = 1000;

export type OverlayScrollProps = {
  /** `hover` shows the thumb on hover / while scrolling. `always` keeps it visible. */
  visibility?: OverlayScrollVisibility;
  className?: string;
  innerClassName?: string;
  children?: ReactNode;
  onScroll?: UIEventHandler<HTMLDivElement>;
  scrollRef?: Ref<HTMLDivElement>;
};

type Thumb = { top: number; height: number; shown: boolean };

function assignRef(ref: Ref<HTMLDivElement> | undefined, node: HTMLDivElement | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(node);
  else ref.current = node;
}

export function OverlayScroll({ visibility = "hover", className, innerClassName, children, onScroll, scrollRef }: OverlayScrollProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbRef = useRef<Thumb>({ top: 0, height: 0, shown: false });
  const [scrolling, setScrolling] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [thumb, setThumb] = useState<Thumb>({ top: 0, height: 0, shown: false });
  thumbRef.current = thumb;

  const updateThumb = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const overflow = scrollHeight - clientHeight;
    if (overflow <= 1) {
      setThumb((prev) => (prev.shown ? { top: 0, height: 0, shown: false } : prev));
      return;
    }
    const height = Math.max(32, (clientHeight / scrollHeight) * clientHeight);
    const top = (scrollTop / overflow) * (clientHeight - height);
    setThumb({ top, height, shown: true });
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
  }, [updateThumb]);

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

  const onThumbPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = elRef.current;
    const current = thumbRef.current;
    if (!el || !current.shown || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const overflow = el.scrollHeight - el.clientHeight;
    const track = el.clientHeight - current.height;
    if (overflow <= 0 || track <= 0) return;

    const startY = e.clientY;
    const startTop = current.top;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setScrolling(true);

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      const nextTop = Math.min(track, Math.max(0, startTop + (ev.clientY - startY)));
      el.scrollTop = (nextTop / track) * overflow;
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

  return (
    <div className={cn("group/scroll relative min-h-0 min-w-0 w-full overflow-hidden", className)} data-scrolling={thumbVisible ? "true" : undefined}>
      <div ref={setNode} onScroll={handleScroll} className={cn("nonla-scroll-hidden absolute inset-0 overflow-y-auto overflow-x-hidden [overflow-anchor:none]", innerClassName)}>
        {children}
      </div>
      {thumb.shown ? (
        <div
          aria-hidden
          onPointerDown={onThumbPointerDown}
          className={cn(
            "nonla-overlay-thumb absolute z-20 rounded-full transition-opacity duration-150",
            visibility === "always" || dragging
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0 group-hover/scroll:pointer-events-auto group-hover/scroll:opacity-100 group-data-scrolling/scroll:pointer-events-auto group-data-scrolling/scroll:opacity-100",
          )}
          style={{ right: 2, width: "var(--nonla-scrollbar-size)", height: thumb.height, transform: `translateY(${thumb.top}px)` }}
        />
      ) : null}
    </div>
  );
}
