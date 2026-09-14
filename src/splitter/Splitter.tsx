import {
  Children,
  type CSSProperties,
  Fragment,
  isValidElement,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../lib/cn";
import { applyDrag, distributeSizes, parseSplitterSize, type SplitterSize, scaleSizes } from "./sizes";

export type { SplitterSize };
export type SplitterOrientation = "horizontal" | "vertical";
export type SplitterSemanticSlot = "root" | "panel" | "dragger";

export type SplitterPanelProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  defaultSize?: SplitterSize;
  size?: SplitterSize;
  min?: SplitterSize;
  max?: SplitterSize;
  resizable?: boolean;
  destroyOnHidden?: boolean;
};

export type SplitterProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  orientation?: SplitterOrientation;
  /** When set with `orientation`, `orientation` wins. */
  vertical?: boolean;
  draggerIcon?: ReactNode;
  destroyOnHidden?: boolean;
  classNames?: Partial<Record<SplitterSemanticSlot, string>>;
  styles?: Partial<Record<SplitterSemanticSlot, CSSProperties>>;
  onResize?: (sizes: number[]) => void;
  onResizeStart?: (sizes: number[]) => void;
  onResizeEnd?: (sizes: number[]) => void;
};

type PanelConfig = SplitterPanelProps & { key: string };

type DragSession = {
  index: number;
  startPos: number;
  startLeft: number;
  startRight: number;
};

const PANEL_MARK = "__NONLA_SPLITTER_PANEL__";

function isPanelElement(child: ReactNode): child is ReactElement<SplitterPanelProps> {
  return isValidElement(child) && Boolean((child.type as { [PANEL_MARK]?: boolean })[PANEL_MARK]);
}

function collectPanels(children: ReactNode): PanelConfig[] {
  return Children.toArray(children).filter(isPanelElement).map((child, index) => ({
    key: child.key != null ? String(child.key) : String(index),
    ...child.props,
  }));
}

function SplitterPanel(_props: SplitterPanelProps) {
  return null;
}
SplitterPanel.displayName = "Splitter.Panel";
(SplitterPanel as typeof SplitterPanel & { [PANEL_MARK]: true })[PANEL_MARK] = true;

function SplitterRoot({
  children,
  className,
  style,
  orientation,
  vertical = false,
  draggerIcon,
  destroyOnHidden = false,
  classNames,
  styles,
  onResize,
  onResizeStart,
  onResizeEnd,
}: SplitterProps) {
  const isVertical = (orientation ?? (vertical ? "vertical" : "horizontal")) === "vertical";
  const panels = useMemo(() => collectPanels(children), [children]);
  const count = panels.length;

  const rootRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<number[]>([]);
  const dragRef = useRef<DragSession | null>(null);

  const [container, setContainer] = useState(0);
  const [sizes, setSizes] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);

  sizesRef.current = sizes;

  const sizeKey = panels.map((panel) => String(panel.size ?? "")).join("|");

  const resolve = useCallback(
    (prev: number[] | null) => {
      const scaled = prev && prev.length === count && container > 0 ? scaleSizes(prev, container) : null;
      const declared = panels.map((panel, index) => {
        const controlled = parseSplitterSize(panel.size, container);
        if (controlled != null) return controlled;
        if (scaled?.[index] != null) return scaled[index];
        return parseSplitterSize(panel.defaultSize, container);
      });
      return distributeSizes(declared, container);
    },
    [container, count, panels],
  );

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const read = () => {
      const next = isVertical ? el.clientHeight : el.clientWidth;
      setContainer((curr) => (Math.abs(curr - next) < 0.5 ? curr : next));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isVertical]);

  useLayoutEffect(() => {
    if (container <= 0 || count === 0 || dragRef.current) return;
    setSizes((prev) => {
      const next = resolve(prev.length === count ? prev : null);
      if (prev.length === next.length && prev.every((value, index) => Math.abs(value - (next[index] ?? 0)) < 0.5)) return prev;
      return next;
    });
  }, [container, count, resolve, sizeKey]);

  const commitSizes = (next: number[]) => {
    setSizes(next);
    onResize?.(next);
  };

  const boundsOf = (index: number) => {
    const panel = panels[index]!;
    return {
      min: parseSplitterSize(panel.min, container) ?? 0,
      max: parseSplitterSize(panel.max, container) ?? container,
    };
  };

  const movePair = (index: number, delta: number, source: number[]) => {
    const left = boundsOf(index);
    const right = boundsOf(index + 1);
    const [nextLeft, nextRight] = applyDrag(source[index] ?? 0, source[index + 1] ?? 0, delta, left.min, left.max, right.min, right.max);
    const next = source.slice();
    next[index] = nextLeft;
    next[index + 1] = nextRight;
    return next;
  };

  const onBarPointerDown = (index: number, event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (panels[index]?.resizable === false || panels[index + 1]?.resizable === false) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const pos = isVertical ? event.clientY : event.clientX;
    dragRef.current = {
      index,
      startPos: pos,
      startLeft: sizes[index] ?? 0,
      startRight: sizes[index + 1] ?? 0,
    };
    setDragging(true);
    onResizeStart?.(sizes);
  };

  const onBarPointerUp = (event?: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    if (event) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    }
    dragRef.current = null;
    setDragging(false);
    onResizeEnd?.(sizesRef.current);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const pos = isVertical ? event.clientY : event.clientX;
      const source = Array.from({ length: count }, (_, i) => (i === drag.index ? drag.startLeft : i === drag.index + 1 ? drag.startRight : (sizesRef.current[i] ?? 0)));
      commitSizes(movePair(drag.index, pos - drag.startPos, source));
    };
    const onUp = () => onBarPointerUp();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, count, isVertical]);

  const onBarKeyDown = (index: number, event: KeyboardEvent<HTMLDivElement>) => {
    if (panels[index]?.resizable === false || panels[index + 1]?.resizable === false) return;
    const step = event.shiftKey ? 32 : 8;
    const backward = isVertical ? event.key === "ArrowUp" : event.key === "ArrowLeft";
    const forward = isVertical ? event.key === "ArrowDown" : event.key === "ArrowRight";
    if (!backward && !forward) return;
    event.preventDefault();
    commitSizes(movePair(index, backward ? -step : step, sizes));
  };

  useEffect(() => {
    if (!dragging) return;
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = isVertical ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [dragging, isVertical]);

  return (
    <div
      ref={rootRef}
      className={cn("nonla-splitter relative flex h-full min-h-0 min-w-0 w-full overflow-hidden", isVertical ? "flex-col" : "flex-row", classNames?.root, className)}
      style={{ ...styles?.root, ...style }}
      data-orientation={isVertical ? "vertical" : "horizontal"}
    >
      {panels.map((panel, index) => {
        const size = sizes[index] ?? 0;
        const hidden = size <= 0;
        const destroy = hidden && (panel.destroyOnHidden ?? destroyOnHidden);
        const resizable = panel.resizable !== false && panels[index + 1]?.resizable !== false;

        return (
          <Fragment key={panel.key}>
            <div
              className={cn("nonla-splitter-panel min-h-0 min-w-0 overflow-auto", hidden && "pointer-events-none", classNames?.panel, panel.className)}
              style={{
                flexGrow: container <= 0 ? 1 : 0,
                flexShrink: 0,
                flexBasis: container <= 0 ? 0 : size,
                ...(isVertical ? { height: container <= 0 ? undefined : size, width: "100%" } : { width: container <= 0 ? undefined : size, height: "100%" }),
                ...styles?.panel,
                ...panel.style,
              }}
            >
              {destroy ? null : panel.children}
            </div>
            {index < count - 1 ? (
              <div
                className={cn("nonla-splitter-bar relative z-10 shrink-0", isVertical ? "h-0 w-full" : "h-full w-0")}
                style={styles?.dragger}
              >
                <div
                  role="separator"
                  aria-orientation={isVertical ? "vertical" : "horizontal"}
                  aria-valuenow={Math.round(size)}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(container)}
                  tabIndex={resizable ? 0 : -1}
                  className={cn(
                    "group absolute z-10 touch-none select-none",
                    isVertical ? "inset-x-0 top-1/2 h-3 -translate-y-1/2 cursor-row-resize" : "inset-y-0 left-1/2 w-3 -translate-x-1/2 cursor-col-resize",
                    !resizable && "cursor-default",
                    classNames?.dragger,
                  )}
                  onPointerDown={resizable ? (event) => onBarPointerDown(index, event) : undefined}
                  onKeyDown={resizable ? (event) => onBarKeyDown(index, event) : undefined}
                >
                  <span
                    className={cn(
                      "pointer-events-none absolute rounded-full transition-all",
                      isVertical
                        ? "inset-x-0 top-1/2 h-px -translate-y-1/2 group-hover:h-[3px] group-focus-visible:h-[3px]"
                        : "inset-y-0 left-1/2 w-px -translate-x-1/2 group-hover:w-[3px] group-focus-visible:w-[3px]",
                      dragging ? "bg-brand" : "bg-border group-hover:bg-brand group-focus-visible:bg-brand",
                      dragging && (isVertical ? "h-[3px]" : "w-[3px]"),
                    )}
                  />
                  {draggerIcon ? (
                    <span
                      className={cn(
                        "pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm bg-card text-muted-foreground shadow-button-outline",
                        isVertical ? "h-1.5 w-5" : "h-5 w-1.5",
                      )}
                    >
                      {draggerIcon}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}

type SplitterComponent = typeof SplitterRoot & { Panel: typeof SplitterPanel };

export const Splitter = Object.assign(SplitterRoot, { Panel: SplitterPanel }) as SplitterComponent;
export { SplitterPanel };
