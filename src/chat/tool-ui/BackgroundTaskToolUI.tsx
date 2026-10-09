import { useEffect, useState } from "react";
import { Shimmer } from "../../shimmer/Shimmer";
import { Spin } from "../../spin/Spin";
import { chatRowClass, chatToolLineClass } from "../chatRhythm";
import { formatBgElapsed, parseBgTaskRef } from "../common/bgTasks";
import { formatToolName, timestampMs } from "../common/utils";
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
    <div className={`${chatRowClass} animate-fadeIn`}>
      <ToolUiBadge show={showAvatar} label={assistantLabel} color={assistantColor} />
      <div className="px-4">
        <div className={chatToolLineClass}>
          <Spin variant="agent" size="small" className="shrink-0" />
          <Shimmer className="min-w-0 truncate font-medium text-muted-foreground">
            {label}
            <span className="text-muted-foreground [-webkit-text-fill-color:currentcolor]"> in background</span>
          </Shimmer>
          <span className="shrink-0 tabular-nums text-tertiary-foreground">{formatBgElapsed(timestampMs(msg.timestamp), now)}</span>
        </div>
      </div>
    </div>
  );
}
