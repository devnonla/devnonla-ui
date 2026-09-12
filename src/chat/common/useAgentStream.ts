import { useCallback, useEffect, useRef, useState } from "react";
import { parseSseStream } from "./sse";
import type { AgentHistoryMessage, AgentMessage, AgentPanelEndpoint, AgentToolAction, AgentToolCallEvent, AgentToolHook, AgentToolResultEvent } from "./types";
import { formatToolName, matchesToolHook } from "./utils";

let _id = 0;
function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${++_id}`;
}

function thinkingDurationSec(startedAt: number): number {
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

function finalizeStreaming(prev: AgentMessage[]): AgentMessage[] {
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

function failOpenTools(prev: AgentMessage[], error: string): AgentMessage[] {
  return prev.map((m) => {
    if (m.role !== "tool-call" || m.toolOutput != null || m.toolError) return m;
    return { ...m, toolError: error, toolOutput: JSON.stringify({ success: false, error }) };
  });
}

export type UseAgentStreamOptions = {
  endpoint: AgentPanelEndpoint;
  extraBody?: Record<string, unknown> | (() => Record<string, unknown>);
  headers?: Record<string, string>;
  fetcher?: typeof fetch;
  initialMessages?: AgentMessage[];
  onToolAction?: (event: AgentToolAction) => void;
  toolHooks?: AgentToolHook[];
};

type OpenTool = AgentToolCallEvent;

export function useAgentStream({ endpoint, extraBody, headers, fetcher = fetch, initialMessages, onToolAction, toolHooks }: UseAgentStreamOptions) {
  const [messages, setMessages] = useState<AgentMessage[]>(() => initialMessages ?? []);
  const [generating, setGenerating] = useState(false);
  const thinkingRef = useRef("");
  const thinkingStartRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const onToolActionRef = useRef(onToolAction);
  onToolActionRef.current = onToolAction;
  const toolHooksRef = useRef(toolHooks);
  toolHooksRef.current = toolHooks;
  const extraBodyRef = useRef(extraBody);
  extraBodyRef.current = extraBody;
  const endpointRef = useRef(endpoint);
  endpointRef.current = endpoint;
  const openToolsRef = useRef<Map<string, OpenTool>>(new Map());

  const emitCall = useCallback((event: AgentToolCallEvent) => {
    for (const hook of toolHooksRef.current ?? []) {
      if (matchesToolHook(hook.name, event.toolName)) hook.onCall?.(event);
    }
    onToolActionRef.current?.({ type: "tool-call", ...event });
  }, []);

  const emitResult = useCallback((event: AgentToolResultEvent) => {
    for (const hook of toolHooksRef.current ?? []) {
      if (matchesToolHook(hook.name, event.toolName)) hook.onResult?.(event);
    }
    onToolActionRef.current?.({ type: "tool-result", ...event });
  }, []);

  const flushOpenTools = useCallback(
    (error: string) => {
      const open = [...openToolsRef.current.values()];
      if (!open.length) return;
      openToolsRef.current.clear();
      for (const tool of open) {
        emitResult({
          toolCallId: tool.toolCallId,
          toolName: tool.toolName,
          output: { success: false, error },
          error,
        });
      }
    },
    [emitResult],
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    flushOpenTools("Cancelled");
    setMessages((prev) => finalizeStreaming(failOpenTools(prev, "Cancelled")));
    setGenerating(false);
    thinkingRef.current = "";
    thinkingStartRef.current = 0;
  }, [flushOpenTools]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    flushOpenTools("Cancelled");
    setMessages([]);
    setGenerating(false);
    thinkingRef.current = "";
    thinkingStartRef.current = 0;
  }, [flushOpenTools]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || generating) return;

      abortRef.current?.abort();
      flushOpenTools("Cancelled");
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: AgentMessage = { id: nextId("u"), role: "user", content: trimmed, timestamp: new Date() };
      const assistantId = nextId("a");
      const assistantMsg: AgentMessage = { id: assistantId, role: "assistant", content: "", streaming: true, timestamp: new Date() };
      const historySnapshot = messages;

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setGenerating(true);
      thinkingRef.current = "";
      thinkingStartRef.current = 0;

      const history = buildAgentHistory(historySnapshot);
      let assistantText = "";
      let currentId = assistantId;
      let needsNewBubble = false;

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
        thinkingRef.current = "";
        thinkingStartRef.current = 0;
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

      try {
        const extra = typeof extraBodyRef.current === "function" ? extraBodyRef.current() : extraBodyRef.current;
        const payload = [...history, { role: "user" as const, content: trimmed }];
        const ep = endpointRef.current;
        const response =
          typeof ep === "function"
            ? await ep({ messages: payload, signal: controller.signal })
            : await fetcher(ep, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", ...headers },
                body: JSON.stringify({ messages: payload, ...extra }),
                signal: controller.signal,
              });

        if (!response.ok || !response.body) {
          const errText = await response.text();
          throw new Error(errText || `HTTP ${response.status}`);
        }

        const result = await parseSseStream(
          response.body,
          {
            onTextDelta: (delta) => {
              stampThinkingDuration();
              if (needsNewBubble || !currentId) {
                assistantText = delta;
                thinkingRef.current = "";
                thinkingStartRef.current = 0;
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
              freezeOpen();
              const id = nextId("tc");
              const call: AgentToolCallEvent = {
                toolCallId: event.toolCallId,
                toolName: event.toolName,
                toolLabel: label,
                input: event.input,
              };
              openToolsRef.current.set(event.toolCallId || id, call);
              setMessages((prev) => [
                ...prev,
                {
                  id,
                  role: "tool-call",
                  content: event.toolName,
                  toolCallId: event.toolCallId,
                  toolName: event.toolName,
                  toolLabel: label,
                  toolInput: event.input,
                  timestamp: new Date(),
                },
              ]);
              emitCall(call);
            },
            onToolResult: (event) => {
              const raw = event.result;
              const resultStr = typeof raw === "string" ? raw : JSON.stringify(raw);
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
              setMessages((prev) => {
                let matchIdx = -1;
                if (event.toolCallId) {
                  matchIdx = prev.findIndex((m) => m.role === "tool-call" && m.toolCallId === event.toolCallId && m.toolOutput == null);
                }
                if (matchIdx === -1) {
                  const rev = [...prev].reverse().findIndex((m) => m.role === "tool-call" && m.toolName === event.toolName && !m.toolOutput);
                  matchIdx = rev === -1 ? -1 : prev.length - 1 - rev;
                }
                if (matchIdx === -1) return prev;
                return prev.map((m, i) => (i === matchIdx ? { ...m, toolOutput: resultStr } : m));
              });
              emitResult({ toolCallId: event.toolCallId, toolName: event.toolName, output: raw });
            },
            onDone: () => {
              flushOpenTools("Tool did not return a result");
              setMessages((prev) => finalizeStreaming(failOpenTools(prev, "Tool did not return a result")));
              setGenerating(false);
              thinkingRef.current = "";
              thinkingStartRef.current = 0;
            },
            onError: (error) => {
              const reason = error === "cancelled" ? "Cancelled" : error;
              flushOpenTools(reason);
              if (error === "Connection lost") {
                setMessages((prev) => finalizeStreaming(failOpenTools(prev, "Connection lost")));
                setGenerating(false);
                thinkingRef.current = "";
                thinkingStartRef.current = 0;
                return;
              }
              setMessages((prev) => [
                ...finalizeStreaming(failOpenTools(prev, reason)),
                ...(error === "cancelled" ? [] : [{ id: nextId("err"), role: "error" as const, content: error, timestamp: new Date() }]),
              ]);
              setGenerating(false);
              thinkingRef.current = "";
              thinkingStartRef.current = 0;
            },
          },
          { signal: controller.signal },
        );

        if (result === "aborted") {
          flushOpenTools("Cancelled");
          setMessages((prev) => finalizeStreaming(failOpenTools(prev, "Cancelled")));
          setGenerating(false);
          thinkingRef.current = "";
          thinkingStartRef.current = 0;
          return;
        }

        flushOpenTools("Tool did not return a result");
        setMessages((prev) => finalizeStreaming(failOpenTools(prev, "Tool did not return a result")));
        setGenerating(false);
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          flushOpenTools("Cancelled");
          setMessages((prev) => finalizeStreaming(failOpenTools(prev, "Cancelled")));
          setGenerating(false);
          thinkingRef.current = "";
          thinkingStartRef.current = 0;
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        flushOpenTools(message);
        setMessages((prev) => [
          ...finalizeStreaming(failOpenTools(prev, message)),
          { id: nextId("err"), role: "error", content: message, timestamp: new Date() },
        ]);
        setGenerating(false);
      } finally {
        abortRef.current = null;
      }
    },
    [generating, messages, fetcher, headers, emitCall, emitResult, flushOpenTools],
  );

  return { messages, generating, send, cancel, clear };
}
