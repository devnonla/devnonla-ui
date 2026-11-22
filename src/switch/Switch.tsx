import * as SwitchPrimitive from "@radix-ui/react-switch";
import { type ComponentPropsWithoutRef, type CSSProperties, forwardRef } from "react";
import { cn, focusRing } from "../lib/cn";
import { type ControlSize, controlRadiusVar, useControlSize } from "../lib/sizes";

export type SwitchVariant = "default" | "square";
/** Checked track. `white` is the on-state for dark surfaces — thumb stays ink. */
export type SwitchColor = "default" | "brand" | "success" | "white";

export type SwitchProps = Omit<ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, "onCheckedChange" | "checked" | "onChange"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Receives the next checked boolean (not a DOM event). */
  onChange?: (checked: boolean) => void;
  size?: ControlSize;
  variant?: SwitchVariant;
  color?: SwitchColor;
};

/** Checked fill and thumb per color. `default` is ink, so its thumb takes the page color to stay visible in dark mode. */
const CHECKED: Record<SwitchColor, { on: string; thumb?: string }> = {
  default: { on: "var(--nonla-selected)", thumb: "var(--nonla-text-on-selected)" },
  brand: { on: "var(--nonla-brand)", thumb: "var(--nonla-text-on-brand)" },
  success: { on: "var(--nonla-success-fill)" },
  white: { on: "#ffffff", thumb: "var(--nonla-bg)" },
};

/** Switch track heights — compact, like Cloudflare (32×16 by default). */
const SWITCH_TRACK_H = { small: 14, default: 16, large: 20 } as const;

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch({ className, checked, defaultChecked, onChange, size, variant = "default", color = "default", disabled, style, ...rest }, ref) {
  const resolvedSize = useControlSize(size);
  const trackH = SWITCH_TRACK_H[resolvedSize];
  // Pill track twice as wide as tall; the thumb fills the full height and slides one height across.
  const trackW = trackH * 2;
  const thumb = trackH;
  const travel = trackW - thumb;
  const square = variant === "square";
  const squareRadius = `max(3px, calc(${controlRadiusVar(resolvedSize)} * 0.55))`;

  return (
    <SwitchPrimitive.Root
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={onChange}
      className={cn(
        "nonla-switch peer inline-flex shrink-0 cursor-pointer items-center border-0 p-0 transition-[background-color,box-shadow]",
        square ? undefined : "rounded-full",
        focusRing,
        "disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      style={{ width: trackW, height: trackH, borderRadius: square ? squareRadius : undefined, ["--sw-on" as string]: CHECKED[color].on, ...(CHECKED[color].thumb ? { ["--sw-thumb-on" as string]: CHECKED[color].thumb } : null), ...style } as CSSProperties}
      {...rest}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "nonla-switch-thumb pointer-events-none block transition-[transform,background-color] duration-(--nonla-dur) data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-(--nonla-switch-travel)",
          square ? undefined : "rounded-full",
        )}
        style={
          {
            width: thumb,
            height: thumb,
            borderRadius: square ? squareRadius : undefined,
            ["--nonla-switch-travel" as string]: `${travel}px`,
          } as CSSProperties
        }
      />
    </SwitchPrimitive.Root>
  );
});
