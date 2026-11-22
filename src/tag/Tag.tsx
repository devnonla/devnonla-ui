import type { CSSProperties, ReactNode } from "react";
import { cn, focusRing } from "../lib/cn";

export type TagVariant = "soft" | "solid";

export type TagProps = {
  children?: ReactNode;
  color?: string;
  /** @deprecated prefer `variant="soft"` */
  bordered?: boolean;
  /**
   * `soft` — quiet wash (default).
   * `solid` — saturated chip.
   * `filled` / `outlined` map to `soft` for backwards compat.
   */
  variant?: TagVariant | "filled" | "outlined";
  className?: string;
  onClose?: () => void;
  closable?: boolean;
  /** Leading status dot. On by default for soft colored tags; `false` hides it, `true` forces it. */
  dot?: boolean;
};

const NAMED_VAR: Record<string, string> = {
  success: "var(--success)",
  error: "var(--destructive)",
  warning: "var(--warn)",
  processing: "var(--link)",
  brand: "var(--brand)",
  blue: "light-dark(#3b7fc4, #7bafe9)",
  purple: "light-dark(#6d5bd0, #9386f2)",
  cyan: "light-dark(#3d6a8c, #81a1c1)",
  green: "light-dark(#2f7d4a, #3fa266)",
  magenta: "light-dark(#9a5f8a, #b48ead)",
  pink: "light-dark(#9a5f8a, #b48ead)",
  orange: "light-dark(#c2613f, #d08770)",
  gold: "light-dark(#a16207, #f1b467)",
  red: "light-dark(#e23b57, #fc6b83)",
  yellow: "light-dark(#a16207, #f1b467)",
  volcano: "light-dark(#e23b57, #fc6b83)",
  geekblue: "light-dark(#3b7fc4, #7bafe9)",
  lime: "light-dark(#3d8f5c, #70b489)",
};

const SOFT = "bg-[color-mix(in_oklab,var(--nonla-tag)_12%,transparent)] text-[color-mix(in_oklab,var(--nonla-tag)_72%,var(--nonla-text-main))]";
const SOLID = "bg-[var(--nonla-tag-fill,var(--nonla-tag))] text-[var(--nonla-tag-ink,light-dark(#ffffff,#141413))]";

/** Status roles: solid chips take the role fill and its label color. Presets: white in light, ink in dark (their dark tones are light). */
const ROLE_SOLID: Record<string, { fill: string; ink: string }> = {
  success: { fill: "var(--nonla-success-fill)", ink: "var(--nonla-text-on-success)" },
  error: { fill: "var(--nonla-danger-fill)", ink: "var(--nonla-text-on-danger)" },
  warning: { fill: "var(--nonla-warn-fill)", ink: "var(--nonla-text-on-warn)" },
  processing: { fill: "var(--nonla-link)", ink: "var(--nonla-bg)" },
  brand: { fill: "var(--nonla-brand)", ink: "var(--nonla-text-on-brand)" },
};

function resolveVariant(variant: TagProps["variant"]): TagVariant {
  if (variant === "solid") return "solid";
  return "soft";
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2.2 2.2L7.8 7.8M7.8 2.2L2.2 7.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Tag({
  children,
  color = "default",
  bordered: _bordered,
  variant = "soft",
  className,
  closable,
  onClose,
  dot,
}: TagProps) {
  const named = NAMED_VAR[color];
  const isDefault = color === "default";
  const token = named ?? (isDefault ? undefined : color);
  const mode = resolveVariant(variant);
  const solid = mode === "solid";
  const showDot = (dot ?? (!solid && !isDefault)) && Boolean(token || isDefault);

  return (
    <span
      className={cn(
        "inline-flex h-5.5 max-w-full items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
        isDefault && (solid ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground"),
        !isDefault && (solid ? SOLID : SOFT),
        className,
      )}
      style={token ? ({ "--nonla-tag": token, ...(ROLE_SOLID[color] && { "--nonla-tag-fill": ROLE_SOLID[color].fill, "--nonla-tag-ink": ROLE_SOLID[color].ink }) } as CSSProperties) : undefined}
    >
      {showDot ? (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", isDefault ? "bg-(--nonla-text-secondary)" : "bg-(--nonla-tag)")}
          aria-hidden
        />
      ) : null}
      <span className="min-w-0 overflow-clip text-ellipsis whitespace-nowrap [overflow-clip-margin:4px] [text-box:trim-both_cap_alphabetic]">
        {children}
      </span>
      {closable ? (
        <button
          type="button"
          className={cn("-mr-0.5 inline-flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-current/55 transition-colors hover:bg-ink-hover hover:text-current", focusRing, "focus-visible:ring-offset-0")}
          aria-label="Remove"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      ) : null}
    </span>
  );
}
