import { useCallback, useEffect, useRef, useState } from "react";
import { failOpenTools, finalizeStreaming, nextId } from "./agentStreamHelpers";
import { createAgentSseSession } from "./createAgentSseSession";
import { parseSseStream } from "./sse";
import type { AgentMessage, AgentToolCallEvent, AgentToolHook, AgentToolResultEvent } from "./types";
import { matchesToolHook } from "./utils";

export type AgentChatSendRequest = { text: string; signal: AbortSignal };
export type AgentChatResumeRequest = { signal: AbortSignal };

export type UseAgentChatStreamOptions = {
  /** Seed display messages (mount only — remount to change conversation). */
  initialMessages?: AgentMessage[];
  /** App POSTs only the new message; returns an SSE `Response`. */
  send: (req: AgentChatSendRequest) => Promise<Response>;
  /** On mount: reattach a live stream. `null` / no body = idle. */
  resume?: (req: AgentChatResumeRequest) => Promise<Response | null>;
  /** User hit Stop — abort client then notify app to cancel server generation. */
  onStop?: () => void | Promise<void>;
  toolHooks?: AgentToolHook[];
};

type OpenTool = AgentToolCallEvent;

export function useAgentChatStream({ initialMessages, send: sendRequest, resume, onStop, toolHooks }: UseAgentChatStreamOptions) {
  const [messages, setMessages] = useState<AgentMessage[]>(() => initialMessages ?? []);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const [generating, setGenerating] = useState(false);
  const thinkingRef = useRef("");
  const thinkingStartRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const toolHooksRef = useRef(toolHooks);
  toolHooksRef.current = toolHooks;
  const sendRef = useRef(sendRequest);
  sendRef.current = sendRequest;
  const resumeRef = useRef(resume);
  resumeRef.current = resume;
  const onStopRef = useRef(onStop);
  onStopRef.current = onStop;
  const openToolsRef = useRef<Map<string, OpenTool>>(new Map());
  const resumedRef = useRef(false);

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

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    flushOpenTools("Cancelled");
    setMessages((prev) => finalizeStreaming(failOpenTools(prev, "Cancelled")));
    setGenerating(false);
    thinkingRef.current = "";
    thinkingStartRef.current = 0;
    void onStopRef.current?.();
  }, [flushOpenTools]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const attachStream = useCallback(
    async (response: Response, opts?: { assistantId?: string }) => {
      if (!response.ok || !response.body) {
        const errText = await response.text().catch(() => "");
        throw new Error(errText || `HTTP ${response.status}`);
      }

      const session = createAgentSseSession({
        setMessages,
        setGenerating,
        thinkingRef,
        thinkingStartRef,
        openToolsRef,
        emitCall,
        emitResult,
        flushOpenTools,
        assistantId: opts?.assistantId,
      });

      try {
        const result = await parseSseStream(response.body, session.callbacks, {
          signal: abortRef.current?.signal,
        });
        session.finishAfterParse(result);
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") {
          session.finishAbortError();
          return;
        }
        session.finishThrown(err instanceof Error ? err.message : String(err));
      } finally {
        abortRef.current = null;
      }
    },
    [emitCall, emitResult, flushOpenTools],
  );

  // Resume live stream once on mount.
  useEffect(() => {
    if (resumedRef.current) return;
    resumedRef.current = true;
    const resumeFn = resumeRef.current;
    if (!resumeFn) return;

    let cancelled = false;
    const controller = new AbortController();
    abortRef.current = controller;

    void (async () => {
      try {
        const response = await resumeFn({ signal: controller.signal });
        if (cancelled || !response || !response.body) {
          abortRef.current = null;
          return;
        }
        setGenerating(true);
        thinkingRef.current = "";
        thinkingStartRef.current = 0;

        // Continue the last streaming assistant bubble when history left one open.
        const last = messagesRef.current[messagesRef.current.length - 1];
        const assistantId = last?.role === "assistant" && last.streaming ? last.id : undefined;
        await attachStream(response, { assistantId });
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError" || cancelled) return;
        setMessages((prev) => [
          ...finalizeStreaming(failOpenTools(prev, err instanceof Error ? err.message : String(err))),
          {
            id: nextId("err"),
            role: "error",
            content: err instanceof Error ? err.message : String(err),
            timestamp: new Date(),
          },
        ]);
        setGenerating(false);
        abortRef.current = null;
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only resume
  }, [attachStream]);

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

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setGenerating(true);
      thinkingRef.current = "";
      thinkingStartRef.current = 0;

      try {
        const response = await sendRef.current({ text: trimmed, signal: controller.signal });
        await attachStream(response, { assistantId });
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
        thinkingRef.current = "";
        thinkingStartRef.current = 0;
        abortRef.current = null;
      }
    },
    [generating, flushOpenTools, attachStream],
  );

  return { messages, generating, send, cancel };
}
