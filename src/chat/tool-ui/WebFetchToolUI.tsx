import { Icon } from "../../icon/Icon";
import { cn } from "../../lib/cn";
import { Shimmer } from "../../shimmer/Shimmer";
import { chatRowClass, chatToolLineClass } from "../chatRhythm";
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
  const expandable = Boolean(body);
  const verb = running ? "Fetching page" : failed ? "Fetch page" : "Fetched page";

  const header = (
    <>
      <Icon name="globe" size={13} className="shrink-0 text-muted-foreground" />
      <Shimmer active={running} className="min-w-0 truncate font-medium text-muted-foreground">
        {verb} <span className="text-tertiary-foreground">{url}</span>
      </Shimmer>
      <ToolUiTrailing failed={failed} chevron={expandable} chevronClassName="group-hover/webfetch:opacity-100 group-open/webfetch:opacity-100 group-open/webfetch:rotate-90" />
    </>
  );

  return (
    <div className={`${chatRowClass} animate-fadeIn`}>
      <ToolUiBadge show={showAvatar} label={assistantLabel} color={assistantColor} />
      {expandable ? (
        <details className="group/webfetch px-4" style={{ overflowAnchor: "none" }}>
          <summary className={cn(chatToolLineClass, "cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden")}>{header}</summary>
          <pre className={cn("m-0 mt-1.5 mb-1 max-h-40 overflow-y-auto rounded-lg border px-3 py-2 font-mono text-sm font-normal leading-[1.65] break-all whitespace-pre-wrap", failed ? "border-destructive/35 bg-destructive/6 text-destructive" : "border-border bg-card text-muted-foreground")}>{body}</pre>
        </details>
      ) : (
        <div className="px-4">
          <div className={chatToolLineClass}>{header}</div>
        </div>
      )}
    </div>
  );
}
