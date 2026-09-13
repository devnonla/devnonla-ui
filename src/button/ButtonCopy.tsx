import { Check, Copy } from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";
import { cn } from "../lib/cn";
import { type ControlSize, getSizeTokens, useControlSize } from "../lib/sizes";

export type ButtonCopyProps = Omit<ComponentProps<"button">, "children" | "size"> & {
  text?: string;
  getText?: () => string;
  /** Idle tooltip / aria-label. Copied state uses "Copied". */
  label?: string;
  size?: ControlSize;
};

export function ButtonCopy({ text, getText, label = "Copy", className, onClick, size, ...props }: ButtonCopyProps) {
  const [copied, setCopied] = useState(false);
  const tok = getSizeTokens(useControlSize(size));
  const icon = tok.icon;
  const box = icon + 14;

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      {...props}
      title={copied ? "Copied" : label}
      aria-label={copied ? "Copied" : label}
      className={cn("inline-flex cursor-pointer shrink-0 items-center justify-center text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      style={{ width: box, height: box }}
      onClick={async (e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        const value = getText?.() ?? text ?? "";
        if (!value) return;
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? <Check size={icon} aria-hidden /> : <Copy size={icon} aria-hidden />}
    </button>
  );
}
