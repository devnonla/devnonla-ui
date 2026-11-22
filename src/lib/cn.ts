import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Keyboard focus ring for buttons, toggles, and icon buttons (`--nonla-focus-ring`).
 * The 2px offset keeps it visible on solid brand fills. Fields use the border instead.
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
