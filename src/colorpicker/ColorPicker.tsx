import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  type CSSProperties,
  type FC,
  isValidElement,
  type KeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePopupContainer } from "../app/context";
import { cn } from "../lib/cn";
import { type PopperPlacement, placementToRadix } from "../lib/placement";
import {
  type ControlSize,
  controlFieldFocusBorder,
  controlFieldSurface,
  controlFieldTransition,
  controlHeightVar,
  controlRadiusVar,
  controlStatusClass,
  getSizeTokens,
  useControlSize,
} from "../lib/sizes";
import { glassOverlayClass } from "../lib/surface";
import {
  Color,
  type ColorFormat,
  type ColorType,
  clamp,
  DEFAULT_COLOR,
  type HsbaColor,
  hsbaToRgba,
  parseColor,
} from "./color";

export type { ColorFormat, ColorType, HsbaColor };
export { Color, DEFAULT_COLOR, parseColor };

export type PresetColorType = {
  label: ReactNode;
  defaultOpen?: boolean;
  key?: React.Key;
  colors: ColorType[];
};

export type ColorPickerSemanticSlot = "root" | "body" | "content" | "description" | "popup";

export type ColorPickerPanelRender = (
  panel: ReactNode,
  extra: { components: { Picker: FC; Presets: FC } },
) => ReactNode;

export type ColorPickerProps = {
  value?: ColorType | null;
  defaultValue?: ColorType | null;
  defaultFormat?: ColorFormat;
  format?: ColorFormat;
  allowClear?: boolean;
  arrow?: boolean | { pointAtCenter?: boolean };
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<ColorPickerSemanticSlot, string>>;
  styles?: Partial<Record<ColorPickerSemanticSlot, CSSProperties>>;
  disabled?: boolean;
  disabledAlpha?: boolean;
  disabledFormat?: boolean;
  destroyOnHidden?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopperPlacement;
  presets?: PresetColorType[];
  panelRender?: ColorPickerPanelRender;
  showText?: boolean | ((color: Color) => ReactNode);
  size?: ControlSize;
  status?: "error" | "warning";
  trigger?: "click" | "hover";
  onChange?: (value: Color, css: string) => void;
  onChangeComplete?: (value: Color) => void;
  onFormatChange?: (format: ColorFormat) => void;
  onClear?: () => void;
  popupClassName?: string;
  getPopupContainer?: () => HTMLElement;
};

const HUE_GRADIENT = "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";
const FORMATS: ColorFormat[] = ["hex", "rgb", "hsb"];

function hueFill(h: number) {
  return `hsl(${((h % 360) + 360) % 360} 100% 50%)`;
}

function toColor(input?: ColorType | null, fallback = DEFAULT_COLOR): Color {
  return parseColor(input) ?? fallback;
}

function Handle({ x, y }: { x: number; y: number }) {
  return (
    <span
      className="pointer-events-none absolute size-3 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, transform: "translate(-50%, -50%)" }}
    />
  );
}

function useDrag(
  onMove: (nx: number, ny: number) => void,
  onEnd?: () => void,
) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const moveRef = useRef(onMove);
  const endRef = useRef(onEnd);
  moveRef.current = onMove;
  endRef.current = onEnd;

  const apply = (clientX: number, clientY: number) => {
    const el = nodeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = rect.width ? clamp((clientX - rect.left) / rect.width, 0, 1) : 0;
    const ny = rect.height ? clamp((clientY - rect.top) / rect.height, 0, 1) : 0;
    moveRef.current(nx, ny);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    apply(e.clientX, e.clientY);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    apply(e.clientX, e.clientY);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    endRef.current?.();
  };

  return { nodeRef, onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}

function Palette({ hsba, onChange, onComplete }: { hsba: HsbaColor; onChange: (next: HsbaColor) => void; onComplete: () => void }) {
  const drag = useDrag((nx, ny) => onChange({ ...hsba, s: nx, b: 1 - ny }), onComplete);
  return (
    <div
      ref={drag.nodeRef}
      role="slider"
      aria-label="Saturation and brightness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsba.s * 100)}
      aria-valuetext={`Saturation ${Math.round(hsba.s * 100)}%, brightness ${Math.round(hsba.b * 100)}%`}
      tabIndex={0}
      className="relative h-40 w-full cursor-crosshair touch-none overflow-hidden rounded-md"
      style={{
        backgroundImage: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, ${hueFill(hsba.h)})`,
      }}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 0.1 : 0.02;
        if (e.key === "ArrowLeft") onChange({ ...hsba, s: clamp(hsba.s - step, 0, 1) });
        else if (e.key === "ArrowRight") onChange({ ...hsba, s: clamp(hsba.s + step, 0, 1) });
        else if (e.key === "ArrowUp") onChange({ ...hsba, b: clamp(hsba.b + step, 0, 1) });
        else if (e.key === "ArrowDown") onChange({ ...hsba, b: clamp(hsba.b - step, 0, 1) });
        else return;
        e.preventDefault();
      }}
    >
      <Handle x={hsba.s} y={1 - hsba.b} />
    </div>
  );
}

function Slider({
  value,
  ariaLabel,
  background,
  onChange,
  onComplete,
}: {
  value: number;
  ariaLabel: string;
  background: string;
  onChange: (n: number) => void;
  onComplete: () => void;
}) {
  const drag = useDrag((nx) => onChange(nx), onComplete);
  return (
    <div
      ref={drag.nodeRef}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      tabIndex={0}
      className="relative h-2 w-full cursor-pointer touch-none rounded-full"
      style={{ background }}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
      onPointerCancel={drag.onPointerCancel}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 0.1 : 0.02;
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(clamp(value - step, 0, 1));
        else if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(clamp(value + step, 0, 1));
        else return;
        e.preventDefault();
      }}
    >
      <Handle x={value} y={0.5} />
    </div>
  );
}

function MiniInput({
  value,
  ariaLabel,
  onCommit,
  className,
}: {
  value: string;
  ariaLabel: string;
  onCommit: (next: string) => void;
  className?: string;
}) {
  const [text, setText] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value);
  }, [value, focused]);

  const commit = () => onCommit(text);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
      e.currentTarget.blur();
    }
  };

  return (
    <input
      aria-label={ariaLabel}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        commit();
      }}
      onKeyDown={onKeyDown}
      className={cn(
        "min-w-0 flex-1 text-center tabular-nums text-xs",
        controlFieldSurface,
        controlFieldTransition,
        controlFieldFocusBorder,
        "h-6 px-1 focus-visible:outline-none",
        className,
      )}
      style={{ borderRadius: controlRadiusVar("small") }}
    />
  );
}

function channel(raw: string, fallback: number, min: number, max: number) {
  const n = Number(raw);
  return Number.isFinite(n) ? clamp(n, min, max) : fallback;
}

function FormatFields({
  color,
  format,
  disabledAlpha,
  onCommit,
}: {
  color: Color;
  format: ColorFormat;
  disabledAlpha: boolean;
  onCommit: (next: Color) => void;
}) {
  const hsba = color.toHsb();
  const rgba = color.toRgb();

  if (format === "hex") {
    return (
      <MiniInput
        ariaLabel="Hex"
        value={color.toHexString(disabledAlpha).replace("#", "").toUpperCase()}
        onCommit={(raw) => {
          const next = parseColor(raw.startsWith("#") ? raw : `#${raw}`);
          if (next) onCommit(disabledAlpha ? Color.fromHsba({ ...next.toHsb(), a: 1 }) : next);
        }}
        className="font-mono"
      />
    );
  }

  if (format === "rgb") {
    return (
      <>
        <MiniInput ariaLabel="R" value={String(rgba.r)} onCommit={(raw) => onCommit(Color.fromHsba({ ...rgbaToKeepHue(hsba, { ...rgba, r: channel(raw, rgba.r, 0, 255) }) }))} />
        <MiniInput ariaLabel="G" value={String(rgba.g)} onCommit={(raw) => onCommit(Color.fromHsba({ ...rgbaToKeepHue(hsba, { ...rgba, g: channel(raw, rgba.g, 0, 255) }) }))} />
        <MiniInput ariaLabel="B" value={String(rgba.b)} onCommit={(raw) => onCommit(Color.fromHsba({ ...rgbaToKeepHue(hsba, { ...rgba, b: channel(raw, rgba.b, 0, 255) }) }))} />
        {disabledAlpha ? null : (
          <MiniInput
            ariaLabel="Alpha"
            value={String(Math.round(hsba.a * 100))}
            onCommit={(raw) => onCommit(Color.fromHsba({ ...hsba, a: channel(raw, hsba.a * 100, 0, 100) / 100 }))}
          />
        )}
      </>
    );
  }

  return (
    <>
      <MiniInput ariaLabel="Hue" value={String(Math.round(hsba.h))} onCommit={(raw) => onCommit(Color.fromHsba({ ...hsba, h: channel(raw, hsba.h, 0, 360) }))} />
      <MiniInput ariaLabel="Saturation" value={String(Math.round(hsba.s * 100))} onCommit={(raw) => onCommit(Color.fromHsba({ ...hsba, s: channel(raw, hsba.s * 100, 0, 100) / 100 }))} />
      <MiniInput ariaLabel="Brightness" value={String(Math.round(hsba.b * 100))} onCommit={(raw) => onCommit(Color.fromHsba({ ...hsba, b: channel(raw, hsba.b * 100, 0, 100) / 100 }))} />
      {disabledAlpha ? null : (
        <MiniInput
          ariaLabel="Alpha"
          value={String(Math.round(hsba.a * 100))}
          onCommit={(raw) => onCommit(Color.fromHsba({ ...hsba, a: channel(raw, hsba.a * 100, 0, 100) / 100 }))}
        />
      )}
    </>
  );
}

function rgbaToKeepHue(prev: HsbaColor, rgba: { r: number; g: number; b: number; a?: number }): HsbaColor {
  const next = new Color({ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a ?? prev.a }).toHsb();
  if (next.s === 0) next.h = prev.h;
  return next;
}

function PresetGroup({
  group,
  current,
  onPick,
}: {
  group: PresetColorType;
  current: Color | null;
  onPick: (color: Color) => void;
}) {
  const [open, setOpen] = useState(group.defaultOpen !== false);
  const currentHex = current?.toHexString().toLowerCase();
  return (
    <div>
      <button
        type="button"
        className="mb-1.5 flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{group.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden className={cn("opacity-60 transition-transform", open && "rotate-180")}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div className="flex flex-wrap gap-1.5">
          {group.colors.map((item) => {
            const color = toColor(item);
            const hex = color.toHexString().toLowerCase();
            const token = typeof item === "string" ? item : color.toCssString();
            const active = currentHex === hex;
            return (
              <button
                key={`${String(group.key ?? "")}:${token}`}
                type="button"
                title={color.toHexString()}
                aria-label={color.toHexString()}
                className={cn(
                  "nonla-color-checkered size-5 cursor-pointer overflow-hidden rounded-sm border border-glass-border",
                  active && "ring-2 ring-brand ring-offset-1 ring-offset-background",
                )}
                onClick={() => onPick(color)}
              >
                <span className="block size-full" style={{ backgroundColor: color.toRgbString() }} />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ColorBlock({
  color,
  cleared,
  className,
  style,
}: {
  color: Color;
  cleared?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={cn("nonla-color-checkered relative block overflow-hidden", className)} style={style}>
      <span className="absolute inset-0" style={{ backgroundColor: cleared ? "transparent" : color.toRgbString() }} />
      {cleared ? <span className="nonla-color-cleared absolute inset-0" /> : null}
    </span>
  );
}

function ClearIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M3.2 3.2L8.8 8.8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function ColorPicker({
  value,
  defaultValue,
  defaultFormat = "hex",
  format: formatProp,
  allowClear = false,
  arrow = false,
  children,
  className,
  style,
  classNames,
  styles,
  disabled,
  disabledAlpha,
  disabledFormat,
  destroyOnHidden,
  open: openProp,
  onOpenChange,
  placement = "bottomLeft",
  presets,
  panelRender,
  showText,
  size,
  status,
  trigger = "click",
  onChange,
  onChangeComplete,
  onFormatChange,
  onClear,
  popupClassName,
  getPopupContainer,
}: ColorPickerProps) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState<Color>(() => toColor(defaultValue));
  const [clearedInner, setClearedInner] = useState(() => defaultValue == null || defaultValue === "");
  const committed = controlled ? parseColor(value) : inner;
  const cleared = controlled ? value == null || value === "" : clearedInner;
  const [draft, setDraft] = useState<Color | null>(null);
  const current = draft ?? committed ?? DEFAULT_COLOR;
  const triggerColor = controlled && !onChange ? (committed ?? DEFAULT_COLOR) : current;
  const hsba = (disabledAlpha ? Color.fromHsba({ ...current.toHsb(), a: 1 }) : current).toHsb();
  const panelColor = Color.fromHsba(hsba);
  const liveRef = useRef(panelColor);
  liveRef.current = panelColor;

  const formatControlled = formatProp !== undefined;
  const [innerFormat, setInnerFormat] = useState<ColorFormat>(defaultFormat);
  const format = formatProp ?? innerFormat;

  const [innerOpen, setInnerOpen] = useState(false);
  const open = openProp ?? innerOpen;
  const hover = trigger === "hover";
  const enterTimer = useRef(0);
  const leaveTimer = useRef(0);
  const { side, align } = placementToRadix(placement);
  const portal = usePopupContainer(getPopupContainer);
  const resolvedSize = useControlSize(size);
  const tok = getSizeTokens(resolvedSize);
  const showArrow = Boolean(arrow);

  useEffect(() => () => {
    window.clearTimeout(enterTimer.current);
    window.clearTimeout(leaveTimer.current);
  }, []);

  const setOpen = (next: boolean) => {
    if (disabled) return;
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const emit = (next: Color, complete: boolean) => {
    const color = disabledAlpha ? Color.fromHsba({ ...next.toHsb(), a: 1 }) : next;
    if (!controlled) setInner(color);
    setClearedInner(false);
    setDraft(complete ? null : color);
    onChange?.(color, color.toCssString());
    if (complete) onChangeComplete?.(color);
  };

  const setFormat = (next: ColorFormat) => {
    if (!formatControlled) setInnerFormat(next);
    onFormatChange?.(next);
  };

  const cycleFormat = () => {
    const i = FORMATS.indexOf(format);
    setFormat(FORMATS[(i + 1) % FORMATS.length]!);
  };

  const onEnter = () => {
    if (!hover || disabled) return;
    window.clearTimeout(leaveTimer.current);
    enterTimer.current = window.setTimeout(() => setOpen(true), 100);
  };
  const onLeave = () => {
    if (!hover) return;
    window.clearTimeout(enterTimer.current);
    leaveTimer.current = window.setTimeout(() => setOpen(false), 100);
  };

  const clear = (e?: { preventDefault(): void; stopPropagation(): void }) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!controlled) {
      setInner(DEFAULT_COLOR);
      setClearedInner(true);
    }
    setDraft(null);
    onClear?.();
  };

  const pick = (next: Color) => emit(next, true);
  const rgb = hsbaToRgba(hsba);

  const pickerBody = (
    <div className="flex flex-col gap-2">
      <Palette hsba={hsba} onChange={(next) => emit(Color.fromHsba(next), false)} onComplete={() => emit(liveRef.current, true)} />
      <div className="flex items-center gap-2">
        <ColorBlock color={panelColor} className="size-8 shrink-0 rounded-md" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Slider
            ariaLabel="Hue"
            value={(((hsba.h % 360) + 360) % 360) / 360}
            background={HUE_GRADIENT}
            onChange={(n) => emit(Color.fromHsba({ ...hsba, h: n * 360 }), false)}
            onComplete={() => emit(liveRef.current, true)}
          />
          {disabledAlpha ? null : (
            <div className="relative">
              <span className="nonla-color-checkered pointer-events-none absolute inset-0 rounded-full" />
              <Slider
                ariaLabel="Alpha"
                value={hsba.a}
                background={`linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0), rgb(${rgb.r},${rgb.g},${rgb.b}))`}
                onChange={(n) => emit(Color.fromHsba({ ...hsba, a: n }), false)}
                onComplete={() => emit(liveRef.current, true)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const presetsBody = presets?.length ? (
    <div className="flex flex-col gap-2 border-t border-border pt-2">
      {presets.map((group, i) => (
        <PresetGroup key={group.key ?? i} group={group} current={cleared ? null : panelColor} onPick={pick} />
      ))}
    </div>
  ) : null;

  const Picker: FC = () => pickerBody;
  const Presets: FC = () => presetsBody;

  const panel = (
    <div className="flex w-[234px] flex-col gap-2">
      {pickerBody}
      <div className="flex items-center gap-1.5">
        {disabledFormat ? (
          <span className="w-11 shrink-0 text-xs text-muted-foreground">{format.toUpperCase()}</span>
        ) : (
          <button
            type="button"
            className="inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-between rounded-md border-0 bg-transparent px-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            onClick={cycleFormat}
          >
            {format.toUpperCase()}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
              <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <FormatFields color={panelColor} format={format} disabledAlpha={Boolean(disabledAlpha)} onCommit={(next) => emit(next, true)} />
        {allowClear ? (
          <button
            type="button"
            aria-label="Clear"
            className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-ink-hover hover:text-foreground"
            onClick={() => clear()}
          >
            <ClearIcon />
          </button>
        ) : null}
      </div>
      {presetsBody}
    </div>
  );

  const rendered = panelRender ? panelRender(panel, { components: { Picker, Presets } }) : panel;
  const textNode =
    showText && !cleared
      ? typeof showText === "function"
        ? showText(triggerColor)
        : triggerColor.toString(format)
      : null;

  const pad = 2;
  const defaultTrigger = (
    <button
      type="button"
      disabled={disabled}
      aria-label="Color picker"
      aria-expanded={open}
      className={cn(
        "box-border inline-flex cursor-pointer items-center justify-center leading-none",
        textNode != null ? "gap-2" : "aspect-square",
        controlFieldSurface,
        "shadow-none",
        controlFieldTransition,
        controlFieldFocusBorder,
        "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45",
        controlStatusClass(status),
        classNames?.root,
        className,
      )}
      style={{
        height: controlHeightVar(resolvedSize),
        minHeight: controlHeightVar(resolvedSize),
        width: textNode != null ? undefined : controlHeightVar(resolvedSize),
        paddingTop: pad,
        paddingBottom: pad,
        paddingLeft: pad,
        paddingRight: textNode != null ? tok.paddingInline : pad,
        borderRadius: controlRadiusVar(resolvedSize),
        ...styles?.root,
        ...style,
      }}
    >
      <span
        className={cn("block size-full min-h-0 min-w-0 shrink-0 overflow-hidden", classNames?.body)}
        style={{
          width: textNode != null ? "auto" : "100%",
          height: "100%",
          aspectRatio: "1",
          borderRadius: `max(4px, calc(${controlRadiusVar(resolvedSize)} - ${pad}px))`,
          ...styles?.body,
        }}
      >
        <ColorBlock color={triggerColor} cleared={cleared} className={cn("size-full", classNames?.content)} style={styles?.content} />
      </span>
      {textNode != null ? (
        <span className={cn("min-w-0 flex-1 truncate font-mono text-foreground", classNames?.description)} style={{ fontSize: tok.fontSize, ...styles?.description }}>
          {textNode}
        </span>
      ) : null}
    </button>
  );

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        if (hover && v) return;
        setOpen(v);
      }}
    >
      <PopoverPrimitive.Trigger asChild onMouseEnter={onEnter} onMouseLeave={onLeave}>
        {children == null ? defaultTrigger : isValidElement(children) ? children : <span className="inline-flex">{children}</span>}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={portal()}>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={showArrow ? 8 : 6}
          forceMount={destroyOnHidden === false ? true : undefined}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn("w-auto p-3", glassOverlayClass, classNames?.popup, popupClassName)}
          style={styles?.popup}
        >
          {rendered}
          {showArrow ? <PopoverPrimitive.Arrow width={12} height={6} className="fill-glass drop-shadow-[0_1px_0_var(--glass-border)]" /> : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
