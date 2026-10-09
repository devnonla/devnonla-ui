import { Icon } from "../../icon/Icon";
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
  if (failed) return <Icon name="error" size={13} className="shrink-0 text-destructive" />;
  if (!chevron) return null;
  return <Icon name="arrow-right" size={12} className={cn("shrink-0 opacity-0 transition-[opacity,transform] duration-150", chevronClassName)} />;
}
