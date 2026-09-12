import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type ShimmerProps = HTMLAttributes<HTMLSpanElement> & {
  /** When false, children render as static text. Default true. */
  active?: boolean;
  children?: ReactNode;
};

/** Sweep highlight on live status text (Thinking, Fetching, …). */
export function Shimmer({ active = true, className, children, ...rest }: ShimmerProps) {
  return (
    <span className={cn(active && "nonla-shimmer", className)} aria-busy={active || undefined} {...rest}>
      {children}
    </span>
  );
}
