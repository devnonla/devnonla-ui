import type { AgentHistoryMessage, AgentMessage } from "./types";
import { hasMeaningfulInput } from "./utils";

let _id = 0;
export function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${++_id}`;
}

export function thinkingDurationSec(startedAt: number): number {
  if (!startedAt) return 0;
  return Math.round((Date.now() - startedAt) / 1000);
}

export function buildAgentHistory(messages: AgentMessage[]): AgentHistoryMessage[] {
  return messages
    .filter((m) => {
      if (m.role === "user") return m.content.trim() !== "";
      if (m.role === "assistant") return m.content.trim() !== "";
      if (m.role === "tool-call") return m.toolOutput != null;
      return false;
    })
    .map((m) => {
      if (m.role === "tool-call") {
        return {
          role: "tool-call" as const,
          content: "" as const,
          toolCallId: m.toolCallId,
          toolName: m.toolName,
          toolInput: m.toolInput,
          toolOutput: m.toolOutput,
        };
      }
      return { role: m.role as "user" | "assistant", content: m.content };
    });
}

export function finalizeStreaming(prev: AgentMessage[]): AgentMessage[] {
  return prev
    .map((m) => {
      if (m.role === "assistant" && m.streaming) {
        if (!m.content.trim() && m.meta?.thinking) {
          return {
            ...m,
            role: "thinking" as const,
            content: String(m.meta.thinking),
            streaming: false,
          };
        }
        return { ...m, streaming: false };
      }
      return m;
    })
    .filter((m) => !(m.role === "assistant" && !m.content.trim() && !m.meta?.thinking));
}

export function failOpenTools(prev: AgentMessage[], error: string): AgentMessage[] {
  return prev.map((m) => {
    if (m.role !== "tool-call" || m.toolOutput != null || m.toolError) return m;
    return { ...m, toolError: error, toolOutput: JSON.stringify({ success: false, error }) };
  });
}

export function sameStreamTool(m: AgentMessage, toolName: string, toolLabel: string) {
  if (m.role !== "tool-call") return false;
  if (m.toolName === toolName) return true;
  if (m.toolLabel && (m.toolLabel === toolLabel || m.toolLabel === toolName)) return true;
  return false;
}

export function lastToolIndex(prev: AgentMessage[], pred: (m: AgentMessage) => boolean): number {
  for (let i = prev.length - 1; i >= 0; i--) {
    if (pred(prev[i])) return i;
  }
  return -1;
}

/** Merge a streamed tool-call into an existing card (same id, still running, or result-before-params). */
export function findToolCallMergeIndex(
  prev: AgentMessage[],
  event: { toolCallId?: string; toolName: string; toolLabel: string; input: unknown },
): number {
  if (event.toolCallId) {
    const byId = prev.findIndex((m) => m.role === "tool-call" && m.toolCallId === event.toolCallId);
    if (byId !== -1) return byId;
  }

  const pending = lastToolIndex(
    prev,
    (m) => sameStreamTool(m, event.toolName, event.toolLabel) && m.toolOutput == null && !m.toolError,
  );
  if (pending !== -1) {
    const m = prev[pending];
    if (!event.toolCallId || !m.toolCallId || m.toolCallId === event.toolCallId) return pending;
  }

  if (!hasMeaningfulInput(event.input)) return -1;

  const sparse = lastToolIndex(prev, (m) => sameStreamTool(m, event.toolName, event.toolLabel) && !hasMeaningfulInput(m.toolInput));
  if (sparse === -1) return -1;
  const m = prev[sparse];
  if (!event.toolCallId || !m.toolCallId || m.toolCallId === event.toolCallId) return sparse;
  return -1;
}

