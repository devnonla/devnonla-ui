import { type ComponentProps, useEffect, useState } from "react";
import { cn } from "../lib/cn";

export type ButtonCopyProps = Omit<ComponentProps<"button">, "children"> & {
  text?: string;
  getText?: () => string;
  /** Idle tooltip / aria-label. Copied state uses "Copied". */
  label?: string;
};

function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="8" y="8" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 16V4c0-1.1.9-2 2-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ButtonCopy({ text, getText, label = "Copy", className, onClick, ...props }: ButtonCopyProps) {
  const [copied, setCopied] = useState(false);

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
      className={cn("inline-flex size-7 cursor-pointer shrink-0 items-center justify-center text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
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
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}
