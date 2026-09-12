import { useEffect, useState } from "react";
import { Shimmer } from "../../shimmer/Shimmer";
import { formatBgElapsed, parseBgTaskRef } from "../common/bgTasks";
import { formatToolName, timestampMs } from "../common/utils";
import { ChatSpinner } from "../message-ui/ChatSpinner";
import { ToolUiBadge } from "./ToolUiBadge";
import type { ToolUIProps } from "./types";

export function BackgroundTaskToolUI({ msg, assistantLabel = "Assistant", assistantColor, showAvatar = false }: ToolUIProps) {
  const ref = parseBgTaskRef(msg.toolOutput);
  const [now, setNow] = useState(() => Date.now());
  const label = formatToolName(ref?.toolName ?? msg.toolLabel ?? msg.toolName ?? "Tool");

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-1 animate-fadeIn">
      <ToolUiBadge show={showAvatar} label={assistantLabel} color={assistantColor} />
      <div className="px-4 pb-1">
        <div className="flex gap-0">
          <div className="w-0.5 shrink-0 self-stretch rounded-full bg-brand-700" />
          <div className="min-w-0 flex-1 pl-2">
            <div className="flex items-center gap-2 py-1">
              <ChatSpinner />
              <Shimmer className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground">{label}</Shimmer>
              <span className="shrink-0 rounded px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-brand-700">Background</span>
              <span className="shrink-0 text-[14px] tabular-nums text-muted-foreground">{formatBgElapsed(timestampMs(msg.timestamp), now)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
