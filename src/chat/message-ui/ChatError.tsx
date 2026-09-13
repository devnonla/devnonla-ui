import { CircleX } from "lucide-react";
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
        <CircleX className="size-4 shrink-0" aria-hidden />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
