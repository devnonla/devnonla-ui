import { ChevronRight, CircleX } from "lucide-react";
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
  if (failed) return <CircleX size={13} className="text-destructive" aria-hidden />;
  if (!chevron) return null;
  return <ChevronRight size={12} className={cn("shrink-0 opacity-0 transition-[opacity,transform] duration-150", chevronClassName)} aria-hidden />;
}
