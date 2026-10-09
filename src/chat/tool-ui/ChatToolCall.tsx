import { type ReactNode, useState } from "react";
import { Icon } from "../../icon/Icon";
import { cn } from "../../lib/cn";
import { Shimmer } from "../../shimmer/Shimmer";
import { chatRowClass, chatToolLineClass } from "../chatRhythm";
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

  const identityIcon = icon ?? <Icon name="code" size={13} className="shrink-0 text-muted-foreground" />;

  const header = (
    <>
      {identityIcon}
      <span className="flex min-w-0 items-center gap-1">
        <Shimmer active={running} className={cn("min-w-0 truncate text-left font-medium", !running && "text-muted-foreground")}>{displayLabel}</Shimmer>
        <ToolUiTrailing failed={hasError} chevron={expandable} chevronClassName={cn("text-muted-foreground group-hover:opacity-100", open && "opacity-100 rotate-90")} />
      </span>
    </>
  );

  return (
    <div className={cn("nonla-chat-tool", chatRowClass, className)}>
      <div className="px-4">
        {expandable ? (
          <button type="button" onClick={() => setOpen((v) => !v)} className={cn(chatToolLineClass, "group w-full cursor-pointer border-0 bg-transparent outline-none")}>
            {header}
          </button>
        ) : (
          <div className={cn(chatToolLineClass, "w-full")}>{header}</div>
        )}

        {open && expandable ? (
          <div className={cn("mt-1.5 mb-1 overflow-hidden rounded-lg border font-mono text-sm", hasError ? "border-destructive/35 bg-destructive/6" : "border-border bg-card")}>
            {hasInput ? <pre className="m-0 max-h-27.5 overflow-y-auto px-3 py-1.5 break-all whitespace-pre-wrap font-normal leading-[1.65] text-muted-foreground">{prettyJson(toolInput)}</pre> : null}
            {running ? (
              <div className={cn("px-3 py-1.5 text-muted-foreground", hasInput && "border-t border-border")}>
                <Shimmer className="italic">Running…</Shimmer>
              </div>
            ) : null}
            {!isPending ? (
              <pre className={cn("m-0 max-h-75 overflow-y-auto px-3 py-1.5 break-all whitespace-pre-wrap font-normal leading-[1.65]", hasInput && "border-t", hasError ? "border-destructive/35 text-destructive" : "border-border text-muted-foreground")}>
                {hasOutput ? prettyJson(toolOutput) : typeof toolError === "string" ? toolError : "Tool execution failed"}
              </pre>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
