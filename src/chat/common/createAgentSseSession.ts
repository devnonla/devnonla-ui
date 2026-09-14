import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import {
  failOpenTools,
  finalizeStreaming,
  findToolCallMergeIndex,
  lastToolIndex,
  nextId,
  sameStreamTool,
  thinkingDurationSec,
} from "./agentStreamHelpers";
import type { AgentSseCallbacks } from "./sse";
import type { AgentMessage, AgentToolCallEvent, AgentToolResultEvent } from "./types";
import { formatToolName, hasMeaningfulInput } from "./utils";

export type AgentSseSessionArgs = {
  setMessages: Dispatch<SetStateAction<AgentMessage[]>>;
  setGenerating: (value: boolean) => void;
  thinkingRef: MutableRefObject<string>;
  thinkingStartRef: MutableRefObject<number>;
  openToolsRef: MutableRefObject<Map<string, AgentToolCallEvent>>;
  emitCall: (event: AgentToolCallEvent) => void;
  emitResult: (event: AgentToolResultEvent) => void;
  flushOpenTools: (error: string) => void;
  /** Existing assistant bubble id when resuming mid-stream; omit to start without a bubble. */
  assistantId?: string;
};

export type AgentSseSession = {
  callbacks: AgentSseCallbacks;
  finishAfterParse: (result: "done" | "error" | "aborted" | "connection-lost") => void;
  finishAbortError: () => void;
  finishThrown: (message: string) => void;
};

export function createAgentSseSession(args: AgentSseSessionArgs): AgentSseSession {
  const {
    setMessages,
    setGenerating,
    thinkingRef,
    thinkingStartRef,
    openToolsRef,
    emitCall,
    emitResult,
    flushOpenTools,
    assistantId,
  } = args;

  let assistantText = "";
  let currentId = assistantId ?? "";
  let needsNewBubble = !assistantId;

  const resetThinking = () => {
    thinkingRef.current = "";
    thinkingStartRef.current = 0;
  };

  const freezeOpen = () => {
    const freezeId = currentId;
    if (freezeId) {
      const thinkingSnapshot = thinkingRef.current;
      const liveDuration = thinkingStartRef.current > 0 ? thinkingDurationSec(thinkingStartRef.current) : undefined;
      if (assistantText.trim()) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== freezeId) return m;
            const existing = typeof m.meta?.thinkingDuration === "number" ? m.meta.thinkingDuration : undefined;
            return {
              ...m,
              content: assistantText,
              streaming: false,
              meta: thinkingSnapshot ? { ...m.meta, thinking: thinkingSnapshot, thinkingDuration: liveDuration ?? existing ?? 0 } : m.meta,
            };
          }),
        );
      } else if (thinkingSnapshot) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === freezeId
              ? {
                  id: freezeId,
                  role: "thinking" as const,
                  content: thinkingSnapshot,
                  streaming: false,
                  timestamp: m.timestamp,
                  meta: { thinking: thinkingSnapshot, thinkingDuration: liveDuration ?? 0 },
                }
              : m,
          ),
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== freezeId));
      }
    }
    resetThinking();
    assistantText = "";
    currentId = "";
    needsNewBubble = true;
  };

  const ensureBubble = (seed?: { content?: string; thinking?: string }): string => {
    if (!needsNewBubble && currentId) return currentId;
    const newId = nextId("a");
    currentId = newId;
    needsNewBubble = false;
    setMessages((prev) => [
      ...prev,
      {
        id: newId,
        role: "assistant",
        content: seed?.content ?? "",
        streaming: true,
        timestamp: new Date(),
        meta: seed?.thinking ? { thinking: seed.thinking } : undefined,
      },
    ]);
    return newId;
  };

  const stampThinkingDuration = () => {
    if (!thinkingRef.current || !thinkingStartRef.current) return;
    const duration = thinkingDurationSec(thinkingStartRef.current);
    const targetId = currentId;
    if (targetId) {
      setMessages((prev) => prev.map((m) => (m.id === targetId ? { ...m, meta: { ...m.meta, thinkingDuration: duration } } : m)));
    }
    thinkingStartRef.current = 0;
  };

  const finishTerminalTools = (error: string) => {
    flushOpenTools(error);
    setMessages((prev) => finalizeStreaming(failOpenTools(prev, error)));
    setGenerating(false);
    resetThinking();
  };

  const callbacks: AgentSseCallbacks = {
    onTextDelta: (delta) => {
      stampThinkingDuration();
      if (needsNewBubble || !currentId) {
        assistantText = delta;
        resetThinking();
        ensureBubble({ content: delta });
      } else {
        assistantText += delta;
        const targetId = currentId;
        setMessages((prev) => prev.map((m) => (m.id === targetId ? { ...m, content: assistantText, streaming: true } : m)));
      }
    },
    onThinkingDelta: (delta) => {
      if (needsNewBubble || !currentId) {
        thinkingRef.current = delta;
        thinkingStartRef.current = Date.now();
        assistantText = "";
        ensureBubble({ thinking: delta });
        return;
      }
      if (!thinkingRef.current) thinkingStartRef.current = Date.now();
      thinkingRef.current += delta;
      const thinking = thinkingRef.current;
      const targetId = currentId;
      setMessages((prev) => prev.map((m) => (m.id === targetId ? { ...m, meta: { ...m.meta, thinking } } : m)));
    },
    onToolCall: (event) => {
      const label = event.toolLabel ? (event.toolLabel.includes(" ") ? event.toolLabel : formatToolName(event.toolLabel)) : formatToolName(event.toolName);

      const call: AgentToolCallEvent = {
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        toolLabel: label,
        input: event.input,
      };

      freezeOpen();
      setMessages((prev) => {
        const idx = findToolCallMergeIndex(prev, { ...event, toolLabel: label });
        if (idx !== -1) {
          const target = prev[idx];
          const nextInput = hasMeaningfulInput(event.input) ? event.input : target.toolInput;
          const mergedCallId = event.toolCallId ?? target.toolCallId;
          if (target.toolOutput == null) {
            const mapKey =
              [...openToolsRef.current.entries()].find(([, t]) => t.toolCallId === target.toolCallId || t.toolName === target.toolName)?.[0] ??
              mergedCallId ??
              target.id;
            openToolsRef.current.set(mapKey, { ...call, toolCallId: mergedCallId, input: nextInput });
          }
          return prev.map((m, i) =>
            i === idx
              ? {
                  ...m,
                  content: event.toolName,
                  toolCallId: mergedCallId,
                  toolName: event.toolName,
                  toolLabel: label,
                  toolInput: nextInput,
                }
              : m,
          );
        }

        const id = nextId("tc");
        openToolsRef.current.set(event.toolCallId || id, call);
        return [
          ...prev,
          {
            id,
            role: "tool-call" as const,
            content: event.toolName,
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            toolLabel: label,
            toolInput: event.input,
            timestamp: new Date(),
          },
        ];
      });
      if (event.input !== undefined) emitCall(call);
    },
    onToolResult: (event) => {
      const raw = event.result;
      const resultStr = typeof raw === "string" ? raw : JSON.stringify(raw);
      const resultLabel = formatToolName(event.toolName);
      if (event.toolCallId) {
        openToolsRef.current.delete(event.toolCallId);
      } else {
        for (const [key, tool] of [...openToolsRef.current.entries()].reverse()) {
          if (tool.toolName === event.toolName) {
            openToolsRef.current.delete(key);
            break;
          }
        }
      }
      freezeOpen();
      setMessages((prev) => {
        let matchIdx = -1;
        if (event.toolCallId) {
          matchIdx = prev.findIndex((m) => m.role === "tool-call" && m.toolCallId === event.toolCallId);
        }
        if (matchIdx === -1) {
          matchIdx = lastToolIndex(prev, (m) => sameStreamTool(m, event.toolName, resultLabel) && m.toolOutput == null);
        }
        if (matchIdx !== -1) {
          return prev.map((m, i) => (i === matchIdx ? { ...m, toolOutput: resultStr, toolCallId: event.toolCallId ?? m.toolCallId } : m));
        }
        const id = nextId("tc");
        return [
          ...prev,
          {
            id,
            role: "tool-call" as const,
            content: event.toolName,
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            toolLabel: resultLabel,
            toolOutput: resultStr,
            timestamp: new Date(),
          },
        ];
      });
      emitResult({ toolCallId: event.toolCallId, toolName: event.toolName, output: raw });
    },
    onDone: () => {
      finishTerminalTools("Tool did not return a result");
    },
    onError: (error) => {
      const reason = error === "cancelled" ? "Cancelled" : error;
      flushOpenTools(reason);
      if (error === "Connection lost") {
        setMessages((prev) => finalizeStreaming(failOpenTools(prev, "Connection lost")));
        setGenerating(false);
        resetThinking();
        return;
      }
      setMessages((prev) => [
        ...finalizeStreaming(failOpenTools(prev, reason)),
        ...(error === "cancelled" ? [] : [{ id: nextId("err"), role: "error" as const, content: error, timestamp: new Date() }]),
      ]);
      setGenerating(false);
      resetThinking();
    },
  };

  return {
    callbacks,
    finishAfterParse: (result) => {
      if (result === "aborted") {
        finishTerminalTools("Cancelled");
        return;
      }
      // Match AgentPanel stream: always finalize open tools after parse returns.
      finishTerminalTools("Tool did not return a result");
    },
    finishAbortError: () => finishTerminalTools("Cancelled"),
    finishThrown: (message) => {
      flushOpenTools(message);
      setMessages((prev) => [
        ...finalizeStreaming(failOpenTools(prev, message)),
        { id: nextId("err"), role: "error", content: message, timestamp: new Date() },
      ]);
      setGenerating(false);
      resetThinking();
    },
  };
}
