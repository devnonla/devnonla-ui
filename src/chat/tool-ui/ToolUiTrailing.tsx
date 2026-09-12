import { FluentIcon } from "../../icon/FluentIcon";
import { cn } from "../../lib/cn";
import { ChatSpinner } from "../message-ui/ChatSpinner";

export function ToolUiTrailing({
  running = false,
  failed = false,
  chevron = false,
  chevronClassName,
}: {
  running?: boolean;
  failed?: boolean;
  chevron?: boolean;
  chevronClassName?: string;
}) {
  if (running) return <ChatSpinner />;
  if (failed) return <FluentIcon name="error-circle-24" size={13} className="text-destructive" />;
  if (!chevron) return null;
  return (
    <svg className={cn("h-3 w-3 shrink-0 opacity-0 transition-[opacity,transform] duration-150", chevronClassName)} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
