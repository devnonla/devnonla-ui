import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type KbdProps = HTMLAttributes<HTMLElement> & {
  /** Keys of a shortcut, drawn as separate caps: `["⌘", "K"]`. Without it, `children` is one cap. */
  keys?: ReactNode[];
};

const capClass = "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-solid border-border bg-background px-1 text-xs leading-none font-medium text-muted-foreground";
/** `.nonla-ui kbd` is mono for markdown; caps read better in the UI font. */
const capStyle = { fontFamily: "var(--nonla-font)", letterSpacing: "0" };

/** Keyboard key cap for shortcuts in menus, search fields, and tooltips. */
export function Kbd({ keys, className, children, ...rest }: KbdProps) {
  if (keys?.length) {
    return (
      <span className={cn("inline-flex items-center gap-1", className)} {...rest}>
        {keys.map((key, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: keys of a shortcut can repeat and never reorder
          <kbd key={i} className={capClass} style={capStyle}>
            {key}
          </kbd>
        ))}
      </span>
    );
  }
  return (
    <kbd {...rest} className={cn(capClass, className)} style={{ ...capStyle, ...rest.style }}>
      {children}
    </kbd>
  );
}
