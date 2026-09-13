import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";
import { Tooltip } from "../tooltip/Tooltip";

export function DesktopBarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip title={label} placement="bottom">
      <button
        type="button"
        aria-label={label}
        aria-current={active ? "true" : undefined}
        onClick={onClick}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full border-0 bg-transparent cursor-pointer",
          active ? "bg-ink-active text-foreground" : "text-foreground/65 hover:bg-ink-hover hover:text-foreground",
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
}

export function DesktopBarItem({
  label,
  active,
  onClick,
  className,
  children,
  ...rest
}: {
  label?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center rounded-md border-0 bg-transparent px-2.5 text-sm font-medium leading-5 cursor-pointer",
        active ? "bg-ink-active text-foreground" : "text-foreground/85 hover:bg-ink-hover hover:text-foreground",
        className,
      )}
      {...rest}
    >
      {children ?? label}
    </button>
  );
}

export function DesktopBarDivider({ className }: { className?: string }) {
  return <span className={cn("mx-2 h-4 w-px bg-ink-line", className)} aria-hidden />;
}

export type DesktopHeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export function DesktopHeader({ left, right, className }: DesktopHeaderProps) {
  return (
    <header
      className={cn(
        "nonla-header-layer fixed inset-x-0 top-0 flex h-desktop-bar items-center justify-between gap-3 border-0 bg-glass-bar px-3 backdrop-blur-lg",
        className,
      )}
    >
      <div className="flex min-w-0 items-center">{left}</div>
      <div className="flex min-w-0 shrink-0 items-center">{right}</div>
    </header>
  );
}
