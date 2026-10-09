import type { ReactNode } from "react";
import { Icon } from "../../icon/Icon";
import { cn } from "../../lib/cn";
import { chatRowClass } from "../chatRhythm";

export type ChatErrorProps = {
  children: ReactNode;
  className?: string;
};

export function ChatError({ children, className }: ChatErrorProps) {
  return (
    <div className={cn("nonla-chat-error px-4 py-1", chatRowClass, className)}>
      <div
        role="alert"
        className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-[color-mix(in_oklab,var(--destructive)_14%,var(--nonla-surface))] px-3 py-2 text-sm text-destructive"
      >
        <Icon name="error" size={16} className="shrink-0" />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
