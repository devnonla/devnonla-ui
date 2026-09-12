import { FluentIcon } from "../../icon/FluentIcon";
import { parseJsonObject } from "../common/utils";
import { ToolUiBadge } from "./ToolUiBadge";
import { ToolUiTrailing } from "./ToolUiTrailing";
import { isToolRunning, type ToolUIProps } from "./types";

type TimeResult = {
  time?: string;
  timezone?: string;
  iso?: string;
};

function formatLabel(iso: string | undefined, timezone: string | undefined, fallback: string | undefined): string {
  if (iso) {
    try {
      const d = new Date(iso);
      if (!Number.isNaN(d.getTime())) {
        const tz = timezone || "UTC";
        const clock = d.toLocaleTimeString("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
        const date = d.toLocaleDateString("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" });
        return `${clock} · ${date} · ${tz}`;
      }
    } catch {
      /* fall through */
    }
  }
  if (fallback && timezone) return `${fallback} · ${timezone}`;
  return fallback ?? timezone ?? "—";
}

export function GetCurrentTimeToolUI({ msg, assistantLabel = "Assistant", assistantColor, showAvatar = false, generating = false }: ToolUIProps) {
  const hasError = Boolean(msg.toolError);
  const output = parseJsonObject<TimeResult>(msg.toolOutput);
  const running = isToolRunning(msg, generating);
  const label = formatLabel(output?.iso, output?.timezone, output?.time);

  return (
    <div className="mt-1 animate-fadeIn">
      <ToolUiBadge show={showAvatar} label={assistantLabel} color={assistantColor} />
      <div className="px-4 pb-1">
        <div className="flex items-center gap-2 py-1">
          <FluentIcon name="clock-24" size={13} className="shrink-0 text-muted-foreground" />
          <span className="truncate text-[14px] font-medium tabular-nums text-muted-foreground">{hasError ? "Failed to get time" : running ? "Getting time…" : label}</span>
          <ToolUiTrailing running={running} failed={hasError} />
        </div>
      </div>
    </div>
  );
}
