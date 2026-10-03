import { SolarIcon } from "../../icon/SolarIcon";
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
  if (failed) return <SolarIcon name="close-circle-linear" size={13} className="text-destructive" />;
  if (!chevron) return null;
  return <SolarIcon name="alt-arrow-right-linear" size={12} className={cn("shrink-0 opacity-0 transition-[opacity,transform] duration-150", chevronClassName)} />;
}
