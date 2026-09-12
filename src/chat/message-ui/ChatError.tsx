import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type ChatErrorProps = {
  children: ReactNode;
  className?: string;
};

export function ChatError({ children, className }: ChatErrorProps) {
  return (
    <div className={cn("nonla-chat-error px-4 py-1", className)}>
      <div
        role="alert"
        className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-[color-mix(in_oklab,var(--destructive)_14%,var(--nonla-surface))] px-3 py-2 text-(length:--chat-body-size) leading-(--chat-body-leading) text-destructive"
      >
        <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
