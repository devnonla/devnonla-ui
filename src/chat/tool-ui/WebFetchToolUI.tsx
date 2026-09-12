import { FluentIcon } from "../../icon/FluentIcon";
import { cn } from "../../lib/cn";
import { parseJsonObject } from "../common/utils";
import { ToolUiBadge } from "./ToolUiBadge";
import { ToolUiTrailing } from "./ToolUiTrailing";
import { isToolRunning, type ToolUIProps } from "./types";

type FetchInput = {
  url?: string;
  actions?: { action?: string; url?: string }[];
};

type FetchOutput = {
  ok?: boolean;
  url?: string;
  text?: string;
  error?: string;
};

function inputUrl(input: unknown): string {
  const rec = parseJsonObject<FetchInput>(input);
  if (rec?.url) return rec.url;
  const nav = rec?.actions?.find((a) => a.action === "navigate" && a.url);
  return nav?.url || "";
}

export function WebFetchToolUI({ msg, assistantLabel = "Assistant", assistantColor, showAvatar = false, generating = false }: ToolUIProps) {
  const hasError = Boolean(msg.toolError);
  const output = parseJsonObject<FetchOutput>(msg.toolOutput);
  const failed = hasError || output?.ok === false;
  const running = isToolRunning(msg, generating);
  const url = output?.url || inputUrl(msg.toolInput) || "—";
  const body = failed ? (output?.error ?? (typeof msg.toolError === "string" ? msg.toolError : null) ?? "Tool execution failed") : output?.text?.trim() || "";
  const verb = running || failed ? "Fetch page" : "Fetched page";

  return (
    <div className="mt-1 animate-fadeIn">
      <ToolUiBadge show={showAvatar} label={assistantLabel} color={assistantColor} />
      <details className="group/webfetch px-4 pb-2" style={{ overflowAnchor: "none" }}>
        <summary className="flex cursor-pointer list-none items-center gap-2 py-0.5 text-[14px] leading-5.5 select-none [&::-webkit-details-marker]:hidden">
          <FluentIcon name="globe-24" size={13} className="shrink-0 text-muted-foreground" />
          <span className={cn("min-w-0 truncate font-medium text-muted-foreground", running && "nonla-chat-shimmer")}>
            {verb} <span className="font-normal text-tertiary-foreground">{url}</span>
          </span>
          <ToolUiTrailing running={running} failed={failed} chevron chevronClassName="group-hover/webfetch:opacity-100 group-open/webfetch:opacity-100 group-open/webfetch:rotate-90" />
        </summary>
        {body ? (
          <pre className={cn("m-0 mt-1.5 mb-1 max-h-40 overflow-y-auto rounded-lg border px-3 py-2 font-mono text-[14px] font-normal leading-[1.65] break-all whitespace-pre-wrap", failed ? "border-destructive/35 bg-destructive/6 text-destructive" : "border-(--popper-border) bg-(--nonla-elevated) text-muted-foreground")}>{body}</pre>
        ) : null}
      </details>
    </div>
  );
}
