import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { type ControlSize, controlHeightVar, controlRadiusVar, getSizeTokens, useControlSize } from "../lib/sizes";

export type SegmentedOption<V extends string | number = string | number> = V | { label: ReactNode; value: V; disabled?: boolean; icon?: ReactNode };

export type SegmentedProps<V extends string | number = string | number> = {
  options: SegmentedOption<V>[];
  value?: V;
  defaultValue?: V;
  onChange?: (value: V) => void;
  size?: ControlSize;
  block?: boolean;
  disabled?: boolean;
  className?: string;
};

function norm<V extends string | number>(opt: SegmentedOption<V>): { label: ReactNode; value: V; disabled?: boolean; icon?: ReactNode } {
  if (typeof opt === "string" || typeof opt === "number") return { label: String(opt), value: opt };
  return opt;
}

type Thumb = { left: number; top: number; width: number; height: number };

export function Segmented<V extends string | number = string | number>({ options, value, defaultValue, onChange, size, block, disabled, className }: SegmentedProps<V>) {
  const items = options.map((o) => norm(o));
  const current = value ?? defaultValue ?? items[0]?.value;
  const resolvedSize = useControlSize(size);
  const tok = getSizeTokens(resolvedSize);
  const itemPadX = Math.max(tok.paddingInline - 4, 6);
  const radius = controlRadiusVar(resolvedSize);

  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const [thumb, setThumb] = useState<Thumb | null>(null);

  const itemsKey = items.map((i) => String(i.value)).join("");

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const el = itemRefs.current.get(String(current));
      if (!el) {
        setThumb(null);
        return;
      }
      setThumb({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, resolvedSize, block, itemsKey]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative inline-flex w-fit max-w-full shrink-0 items-center gap-0.5 rounded-lg border border-solid border-glass-border bg-glass-bar p-0.5 shadow-[inset_0_1px_0_var(--glass-highlight)] backdrop-blur-xl",
        block && "flex w-full",
        className,
      )}
      role="tablist"
      style={{ borderRadius: radius }}
      data-size={resolvedSize}
    >
      {thumb ? (
        <span
          aria-hidden
          className="nonla-segmented-thumb pointer-events-none absolute border border-solid border-glass-border bg-glass shadow-[inset_0_1px_0_var(--glass-highlight),0_1px_3px_color-mix(in_srgb,black_10%,transparent)]"
          style={{
            width: thumb.width,
            height: thumb.height,
            transform: `translate(${thumb.left}px, ${thumb.top}px)`,
            borderRadius: `max(4px, calc(${radius} - 2px))`,
          }}
        />
      ) : null}
      {items.map((item) => {
        const active = item.value === current;
        return (
          <button
            key={String(item.value)}
            ref={(el) => {
              if (el) itemRefs.current.set(String(item.value), el);
              else itemRefs.current.delete(String(item.value));
            }}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled || item.disabled}
            className={cn(
              "relative z-10 inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border border-solid border-transparent transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45",
              block ? "min-w-0 flex-1" : "shrink-0",
              active ? "text-foreground" : "bg-transparent text-foreground hover:bg-ink-hover",
            )}
            style={{
              height: `max(22px, calc(${controlHeightVar(resolvedSize)} - 4px))`,
              paddingLeft: itemPadX,
              paddingRight: itemPadX,
              fontSize: tok.fontSize,
              borderRadius: `max(4px, calc(${radius} - 2px))`,
            }}
            onClick={() => onChange?.(item.value)}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
