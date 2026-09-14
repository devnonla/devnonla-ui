import { useCallback, useEffect, useRef, useState } from "react";
import { buildAgentHistory, failOpenTools, finalizeStreaming, nextId } from "./agentStreamHelpers";
import { createAgentSseSession } from "./createAgentSseSession";
import { parseSseStream } from "./sse";
import type { AgentMessage, AgentPanelEndpoint, AgentToolCallEvent, AgentToolHook, AgentToolResultEvent } from "./types";
import { matchesToolHook } from "./utils";

export { buildAgentHistory } from "./agentStreamHelpers";

export type UseAgentStreamOptions = {
  endpoint: AgentPanelEndpoint;
  extraBody?: Record<string, unknown> | (() => Record<string, unknown>);
  headers?: Record<string, string>;
  fetcher?: typeof fetch;
  initialMessages?: AgentMessage[];
  toolHooks?: AgentToolHook[];
};

type OpenTool = AgentToolCallEvent;

export function useAgentStream({
  endpoint,
  extraBody,
  headers,
  fetcher = fetch,
  initialMessages,
  toolHooks,
}: UseAgentStreamOptions) {
  const [messages, setMessages] = useState<AgentMessage[]>(() => initialMessages ?? []);
  const [generating, setGenerating] = useState(false);
  const thinkingRef = useRef("");
  const thinkingStartRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
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
  }, []);

  const emitResult = useCallback((event: AgentToolResultEvent) => {
    for (const hook of toolHooksRef.current ?? []) {
      if (matchesToolHook(hook.name, event.toolName)) hook.onResult?.(event);
    }
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
      const session = createAgentSseSession({
        setMessages,
        setGenerating,
        thinkingRef,
        thinkingStartRef,
        openToolsRef,
        emitCall,
        emitResult,
        flushOpenTools,
        assistantId,
      });

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

        const result = await parseSseStream(response.body, session.callbacks, { signal: controller.signal });
        session.finishAfterParse(result);
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          session.finishAbortError();
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        session.finishThrown(message);
      } finally {
        abortRef.current = null;
      }
    },
    [generating, messages, fetcher, headers, emitCall, emitResult, flushOpenTools],
  );

  return { messages, generating, send, cancel, clear };
}
