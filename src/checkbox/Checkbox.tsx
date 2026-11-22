import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from "react";
import { cn, focusRing } from "../lib/cn";

/** Checked fill. `default` is ink (`--nonla-selected`). `white` is the on-state for dark surfaces — the mark stays ink. */
export type CheckboxColor = "default" | "brand" | "success" | "white";

export type CheckboxProps = Omit<ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, "onCheckedChange" | "checked" | "onChange"> & {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean;
  /** Receives next checked boolean (not a DOM event). */
  onChange?: (checked: boolean) => void;
  children?: ReactNode;
  indeterminate?: boolean;
  color?: CheckboxColor;
};

const CHECKED_FILL: Record<CheckboxColor, string> = {
  default:
    "data-[state=checked]:bg-selected data-[state=checked]:border-selected data-[state=checked]:text-on-selected data-[state=indeterminate]:bg-selected data-[state=indeterminate]:border-selected data-[state=indeterminate]:text-on-selected",
  brand:
    "data-[state=checked]:bg-brand data-[state=checked]:border-brand data-[state=checked]:text-(--nonla-text-on-brand) data-[state=indeterminate]:bg-brand data-[state=indeterminate]:border-brand data-[state=indeterminate]:text-(--nonla-text-on-brand)",
  success:
    "data-[state=checked]:bg-success-fill data-[state=checked]:border-success-fill data-[state=checked]:text-on-success data-[state=indeterminate]:bg-success-fill data-[state=indeterminate]:border-success-fill data-[state=indeterminate]:text-on-success",
  white:
    "data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-(--nonla-bg) data-[state=indeterminate]:bg-white data-[state=indeterminate]:border-white data-[state=indeterminate]:text-(--nonla-bg)",
};

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 5.2L4.1 7.2L8 2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { className, checked, defaultChecked, onChange, children, indeterminate, disabled, color = "default", ...rest },
  ref,
) {
  const resolved = indeterminate ? "indeterminate" : checked;
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: wraps Radix checkbox button, not a native input
    <label className={cn("inline-flex items-center gap-2 text-sm text-foreground cursor-pointer", disabled && "opacity-45 cursor-not-allowed")}>
      <CheckboxPrimitive.Root
        ref={ref}
        checked={resolved}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onCheckedChange={(v) => onChange?.(v === true)}
        className={cn(
          "size-4 shrink-0 rounded-sm border border-input bg-(--nonla-surface) transition-colors",
          focusRing,
          CHECKED_FILL[color],
          className,
        )}
        {...rest}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current animate-[nonla-check-in_var(--nonla-dur-fast)_var(--nonla-ease-out)]">
          <CheckIcon />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {children != null ? <span>{children}</span> : null}
    </label>
  );
});
