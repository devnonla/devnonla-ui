import { type ReactNode, useEffect, useRef, useState } from "react";
import { FluentIcon } from "../../icon/FluentIcon";
import { cn } from "../../lib/cn";
import { Shimmer } from "../../shimmer/Shimmer";
import { formatBgElapsed, parseBgTaskRef } from "../common/bgTasks";
import { parseJsonObject, prettyJson, timestampMs } from "../common/utils";
import { ChatMarkdown } from "../message-ui/ChatMarkdown";
import { ChatSpinner } from "../message-ui/ChatSpinner";
import { ToolUiBadge } from "./ToolUiBadge";
import { ToolUiTrailing } from "./ToolUiTrailing";
import type { ToolUIProps } from "./types";

type CallAgentParsed = {
  success: boolean;
  response: string | null;
  agentId: string | null;
  error: string | null;
};

function parseCallAgentOutput(raw: unknown): CallAgentParsed | null {
  if (raw == null) return null;
  const parsed = typeof raw === "string" ? parseJsonObject<Record<string, unknown>>(raw) : typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  if (!parsed || !("success" in parsed)) return null;
  return {
    success: Boolean(parsed.success),
    response: (parsed.response as string | null | undefined) ?? null,
    agentId: (parsed.agent_id as string | null | undefined) ?? null,
    error: (parsed.error as string | null | undefined) ?? null,
  };
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-0.5 py-0.5" role="status" aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </div>
  );
}

function AgentAvatar({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  return (
    <div className={cn("flex items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground", className)} style={{ width: size, height: size }} aria-hidden>
      {initial}
    </div>
  );
}

function AgentTurn({
  name,
  children,
  align = "start",
}: {
  name: string;
  children: ReactNode;
  align?: "start" | "end";
}) {
  return (
    <div className={cn("flex items-start gap-2", align === "end" && "flex-row-reverse")}>
      <AgentAvatar name={name} className="mt-0.5 shrink-0" />
      <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5", align === "end" ? "items-end" : "items-start")}>
        <span className="select-none text-[12px] font-medium text-tertiary-foreground">{name}</span>
        <div className="w-fit max-w-[92%]">{children}</div>
      </div>
    </div>
  );
}

function ExpandableBody({ children, className }: { children: ReactNode; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) setOverflows(el.scrollHeight > 160);
  }, [children]);

  return (
    <div>
      <div ref={bodyRef} className={cn("overflow-hidden transition-[max-height] duration-200", !expanded && "max-h-40", className)}>
        {children}
      </div>
      {overflows ? (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-1 cursor-pointer border-0 bg-transparent p-0 text-[13px] text-tertiary-foreground hover:text-foreground">
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}

export function CallAgentToolUI({ msg, assistantLabel = "Assistant", assistantColor, showAvatar = false }: ToolUIProps) {
  const hasOutput = msg.toolOutput != null;
  const hasError = Boolean(msg.toolError);
  const bgRef = parseBgTaskRef(msg.toolOutput);
  const parsed = parseCallAgentOutput(msg.toolOutput);
  const failed = hasError || parsed?.success === false;
  const bgRunning = Boolean(bgRef) && !failed && !parsed;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!bgRunning) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [bgRunning]);

  const requestMessage = ((msg.toolInput as Record<string, unknown> | null)?.message as string | undefined)?.trim() ?? "";
  const hasRequest = requestMessage.length > 0;
  const composing = !hasOutput && !hasError && !hasRequest;
  const awaitingReply = bgRunning || (!hasOutput && !hasError && hasRequest);
  const showCallee = awaitingReply || failed || parsed != null;
  const calleeName = msg.toolLabel?.replace(/^Call\s+/i, "") ?? "Agent";
  const statusLabel = failed && !awaitingReply ? (parsed?.error ?? "Call failed") : null;

  return (
    <div className="mt-1 animate-fadeIn">
      <ToolUiBadge show={showAvatar} label={assistantLabel} color={assistantColor} />
      <div className="px-4 py-1">
        <div className={cn("overflow-hidden rounded-xl border bg-card", failed ? "border-destructive/35" : "border-border")}>
          <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
            <FluentIcon name="chat-24" size={13} className="shrink-0 text-muted-foreground" />
            <Shimmer active={composing || awaitingReply} className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground">Calling {calleeName}</Shimmer>
            {bgRunning ? <span className="text-[14px] tabular-nums text-muted-foreground">{formatBgElapsed(timestampMs(msg.timestamp), now)}</span> : null}
            {statusLabel ? <span className="max-w-40 truncate text-[13px] italic text-destructive">{statusLabel}</span> : null}
            <ToolUiTrailing running={composing || awaitingReply} failed={failed && !awaitingReply} />
          </div>

          {composing || hasRequest || showCallee ? (
            <div className="flex flex-col gap-3 px-3 py-3">
              {composing || hasRequest ? (
                <AgentTurn name={assistantLabel} align="end">
                  <div className="rounded-2xl rounded-tr-sm border border-brand/40 bg-[color-mix(in_oklab,var(--brand)_14%,var(--card))] px-3 py-2 text-left">
                    {composing ? <TypingDots /> : <p className="m-0 text-[14px] leading-[1.55] whitespace-pre-wrap text-foreground">{requestMessage}</p>}
                  </div>
                </AgentTurn>
              ) : null}

              {showCallee ? (
                <AgentTurn name={calleeName} align="start">
                  <div className={cn("w-fit rounded-2xl rounded-tl-sm border bg-transparent px-3 py-2 text-left", failed && !awaitingReply ? "border-destructive/35" : "border-border")}>
                    {awaitingReply ? (
                      <div className="flex items-center gap-1.5 py-0.5">
                        <ChatSpinner />
                        <span className="text-[14px] italic text-muted-foreground">Replying…</span>
                      </div>
                    ) : failed ? (
                      <p className="m-0 text-[14px] leading-[1.55] text-destructive">{parsed?.error ?? "Agent call failed"}</p>
                    ) : parsed ? (
                      <ExpandableBody>
                        <ChatMarkdown content={parsed.response ?? "(no response)"} className="[&_p]:m-0 [&_p]:mb-0 [&_p+p]:mt-2" />
                      </ExpandableBody>
                    ) : (
                      <ExpandableBody>
                        <pre className="m-0 font-mono text-[14px] leading-normal break-all whitespace-pre-wrap text-muted-foreground">{prettyJson(msg.toolOutput)}</pre>
                      </ExpandableBody>
                    )}
                  </div>
                </AgentTurn>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
