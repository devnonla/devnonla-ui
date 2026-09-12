import { type ReactNode, useState } from "react";
import { cn } from "../../lib/cn";
import { formatToolName, hasMeaningfulInput, prettyJson } from "../common/utils";
import { ChatSpinner } from "../message-ui/ChatSpinner";
import { ToolUiTrailing } from "./ToolUiTrailing";

export type ChatToolCallProps = {
  toolName?: string;
  label?: string;
  toolInput?: unknown;
  toolOutput?: unknown;
  toolError?: boolean | string;
  /** Show running spinner (pending execution). */
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

  const identityIcon = icon ?? (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 text-muted-foreground" aria-hidden>
      <path d="M8 7h8M8 12h8M8 17h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );

  const header = (
    <>
      {identityIcon}
      <span className={cn("min-w-0 flex-1 truncate text-left text-[14px] font-medium", running ? "nonla-chat-shimmer" : "text-muted-foreground", expandable && !running && "transition-colors group-hover:text-foreground")}>{displayLabel}</span>
      <ToolUiTrailing running={running} failed={hasError} chevron={expandable} chevronClassName={cn("group-hover:opacity-100", open && "opacity-100 rotate-90")} />
    </>
  );

  return (
    <div className={cn("nonla-chat-tool mt-1", className)}>
      <div className="px-4 pb-0.5">
        <div className={cn("mb-1 overflow-hidden rounded-xl border", hasError ? "border-destructive/35" : "border-border")}>
          {expandable ? (
            <button type="button" onClick={() => setOpen((v) => !v)} className={cn("group flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 outline-none transition-colors hover:bg-muted border-0 bg-transparent", open && "bg-muted")}>
              {header}
            </button>
          ) : (
            <div className="flex w-full items-center gap-2 px-2.5 py-1.5">{header}</div>
          )}

          {open && expandable ? (
            <div className="border-t border-border font-mono text-[14px]">
              {hasInput ? <pre className="m-0 max-h-27.5 overflow-y-auto bg-transparent px-3 py-2 break-all whitespace-pre-wrap font-normal leading-[1.65] text-muted-foreground">{prettyJson(toolInput)}</pre> : null}
              {running ? (
                <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-3 py-2 text-muted-foreground">
                  <ChatSpinner />
                  <span className="italic">Running…</span>
                </div>
              ) : null}
              {!isPending ? (
                <pre className={cn("m-0 max-h-75 overflow-y-auto px-3 py-2 break-all whitespace-pre-wrap font-normal leading-[1.65] text-muted-foreground", hasInput && "border-t border-border", hasError ? "bg-destructive/6" : "bg-muted/40")}>
                  {hasOutput ? prettyJson(toolOutput) : typeof toolError === "string" ? toolError : "Tool execution failed"}
                </pre>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
