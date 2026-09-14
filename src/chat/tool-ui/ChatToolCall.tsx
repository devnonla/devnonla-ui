import { type ReactNode, useState } from "react";
import { FluentIcon } from "../../icon/FluentIcon";
import { cn } from "../../lib/cn";
import { Shimmer } from "../../shimmer/Shimmer";
import { formatToolName, hasMeaningfulInput, prettyJson } from "../common/utils";
import { ToolUiTrailing } from "./ToolUiTrailing";

export type ChatToolCallProps = {
  toolName?: string;
  label?: string;
  toolInput?: unknown;
  toolOutput?: unknown;
  toolError?: boolean | string;
  /** Pending execution — label shimmers, no spinner. */
  running?: boolean;
  /** Optional icon node (left of label). */
  icon?: ReactNode;
  className?: string;
  defaultOpen?: boolean;
};

export function ChatToolCall({ toolName = "Tool", label, toolInput, toolOutput, toolError, running = false, icon, className, defaultOpen = false }: ChatToolCallProps) {
  const hasOutput = toolOutput != null;
  const hasInput = hasMeaningfulInput(toolInput);
  const hasError = Boolean(toolError);
  const isPending = !hasOutput && !hasError;
  const expandable = hasInput || hasOutput || hasError || running;
  const [open, setOpen] = useState(defaultOpen);
  const displayLabel = label ?? formatToolName(toolName);

  const identityIcon = icon ?? <FluentIcon name="board-24" size={13} className="shrink-0" />;

  const header = (
    <>
      {identityIcon}
      <span className="flex min-w-0 items-center gap-1">
        <Shimmer active={running} className={cn("min-w-0 truncate text-left text-[14px] font-medium", !running && "text-muted-foreground", expandable && !running && "transition-colors group-hover:text-foreground")}>{displayLabel}</Shimmer>
        <ToolUiTrailing failed={hasError} chevron={expandable} chevronClassName={cn("group-hover:opacity-100", open && "opacity-100 rotate-90")} />
      </span>
    </>
  );

  return (
    <div className={cn("nonla-chat-tool mt-1", className)}>
      <div className="px-4 pb-2">
        {expandable ? (
          <button type="button" onClick={() => setOpen((v) => !v)} className="group flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent py-0.5 text-[14px] leading-5.5 outline-none">
            {header}
          </button>
        ) : (
          <div className="flex w-full items-center gap-2 py-0.5 text-[14px] leading-5.5">{header}</div>
        )}

        {open && expandable ? (
          <div className="mt-1.5 mb-1 overflow-hidden rounded-lg font-mono text-[13px]">
            {hasInput ? <pre className="m-0 max-h-27.5 overflow-y-auto bg-well px-3 py-1.5 break-all whitespace-pre-wrap font-normal leading-[1.65] text-muted-foreground">{prettyJson(toolInput)}</pre> : null}
            {running ? (
              <div className="bg-well-strong px-3 py-1.5 text-muted-foreground">
                <Shimmer className="italic">Running…</Shimmer>
              </div>
            ) : null}
            {!isPending ? (
              <pre className={cn("m-0 max-h-75 overflow-y-auto px-3 py-1.5 break-all whitespace-pre-wrap font-normal leading-[1.65] text-muted-foreground", hasError ? "bg-destructive/6" : "nonla-chat-tool-result-ok")}>
                {hasOutput ? prettyJson(toolOutput) : typeof toolError === "string" ? toolError : "Tool execution failed"}
              </pre>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
