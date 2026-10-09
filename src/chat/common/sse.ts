/**
 * AG-UI SSE subscriber for AgentChatbox.
 *
 * Wire format comes from `@ag-ui/client` `parseSSEStream`.
 * Each frame is checked with `EventSchemas` from `@ag-ui/core`.
 * This file only maps those events onto chat bubbles.
 *
 * Renders TEXT_MESSAGE_*, REASONING_MESSAGE_*, and TOOL_CALL_*.
 * RUN_FINISHED ends the turn. RUN_ERROR shows the error row.
 * RUN_STARTED, STEP_*, STATE_*, MESSAGES_SNAPSHOT, ACTIVITY_*, and RAW are ignored.
 * CUSTOM `tool-meta` and `tool-call-input` update the open tool card.
 */

import { parseSSEStream, runHttpRequest } from "@ag-ui/client";
import { EventSchemas } from "@ag-ui/core/schemas";

export interface AgentSseCallbacks {
  onTextDelta: (text: string) => void;
  onThinkingDelta: (text: string) => void;
  onToolCall: (call: { toolCallId?: string; toolName: string; toolLabel?: string; toolIcon?: string | null; input: unknown }) => void;
  onToolResult: (call: { toolCallId?: string; toolName: string; result: unknown }) => void;
  onDone: (text: string) => void | Promise<void>;
  onError: (error: string) => void | Promise<void>;
  /** Close the current assistant bubble so the next text delta starts another. */
  onTextEnd?: () => void;
}

export type ParseSseResult = "done" | "error" | "aborted" | "connection-lost";

function readToolCallId(raw: Record<string, unknown>): string | undefined {
  const v = raw.toolCallId;
  if (typeof v === "string" && v.trim()) return v;
  return undefined;
}

const AG_UI_TYPES = new Set([
  "TEXT_MESSAGE_START",
  "TEXT_MESSAGE_CONTENT",
  "TEXT_MESSAGE_END",
  "TEXT_MESSAGE_CHUNK",
  "TOOL_CALL_START",
  "TOOL_CALL_ARGS",
  "TOOL_CALL_END",
  "TOOL_CALL_CHUNK",
  "TOOL_CALL_RESULT",
  "REASONING_MESSAGE_CONTENT",
  "REASONING_MESSAGE_CHUNK",
  "RUN_FINISHED",
  "RUN_ERROR",
]);

type OpenTool = { name: string; args: string; announced: boolean; label?: string; icon?: string | null };

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function toolContent(content: unknown): unknown {
  return typeof content === "string" ? parseJson(content) : content;
}

function createSseDispatcher(callbacks: AgentSseCallbacks) {
  const tools = new Map<string, OpenTool>();
  const toolNames = new Map<string, string>();
  const ignoredText = new Set<string>();
  let textId: string | undefined;
  let currentToolId: string | undefined;
  let anon = 0;

  const paint = (id: string, tool: OpenTool, input: unknown) => {
    callbacks.onToolCall({
      toolCallId: id,
      toolName: tool.name,
      toolLabel: tool.label,
      toolIcon: tool.icon,
      input,
    });
  };

  const announce = (id: string) => {
    const tool = tools.get(id);
    if (!tool || tool.announced) return;
    tool.announced = true;
    paint(id, tool, undefined);
  };

  const flushTool = (id: string) => {
    const tool = tools.get(id);
    if (!tool) return;
    announce(id);
    const trimmed = tool.args.trim();
    tools.delete(id);
    if (!trimmed) return;
    paint(id, tool, parseJson(trimmed));
  };

  const applyCustom = (raw: Record<string, unknown>) => {
    const value = (raw.value ?? {}) as Record<string, unknown>;
    const toolCallId = typeof value.toolCallId === "string" ? value.toolCallId : "";
    if (!toolCallId) return;
    const tool = tools.get(toolCallId);

    if (raw.name === "tool-meta") {
      if (!tool) return;
      if (typeof value.toolLabel === "string") tool.label = value.toolLabel;
      if ("toolIcon" in value) tool.icon = (value.toolIcon as string | null | undefined) ?? null;
      paint(toolCallId, tool, tool.args.trim() ? parseJson(tool.args) : undefined);
      return;
    }

    if (raw.name === "tool-call-input") {
      const toolName = typeof value.toolName === "string" && value.toolName ? value.toolName : (tool?.name ?? "unknown");
      if (tool) tool.name = toolName;
      toolNames.set(toolCallId, toolName);
      callbacks.onToolCall({
        toolCallId,
        toolName,
        toolLabel: tool?.label,
        toolIcon: tool?.icon,
        input: value.input,
      });
    }
  };

  const flushAll = () => {
    for (const id of [...tools.keys()]) flushTool(id);
  };

  const ensure = (id: string, name?: string) => {
    let tool = tools.get(id);
    if (!tool) {
      tool = { name: name?.trim() ? name : "unknown", args: "", announced: false };
      tools.set(id, tool);
    } else if (name?.trim()) {
      tool.name = name;
    }
    announce(id);
    toolNames.set(id, tool.name);
    return tool;
  };

  const resolveToolId = (raw: Record<string, unknown>) => {
    const id = readToolCallId(raw);
    if (id) {
      currentToolId = id;
      return id;
    }
    if (currentToolId && tools.has(currentToolId)) return currentToolId;
    anon += 1;
    currentToolId = `tool-${anon}`;
    return currentToolId;
  };

  const noteText = (raw: Record<string, unknown>) => {
    const messageId = typeof raw.messageId === "string" ? raw.messageId : undefined;
    if (raw.role != null && raw.role !== "assistant") {
      if (messageId) ignoredText.add(messageId);
      return false;
    }
    if (messageId && ignoredText.has(messageId)) return false;
    if (messageId && textId && messageId !== textId) callbacks.onTextEnd?.();
    if (messageId) textId = messageId;
    return true;
  };

  return async (raw: Record<string, unknown>): Promise<"done" | "error" | false> => {
    const type = raw.type;
    if (type === "CUSTOM") {
      applyCustom(raw);
      return false;
    }
    if (typeof type !== "string" || !AG_UI_TYPES.has(type)) return false;

    switch (type) {
      case "TEXT_MESSAGE_START":
      case "TEXT_MESSAGE_CONTENT":
      case "TEXT_MESSAGE_CHUNK": {
        if (!noteText(raw)) return false;
        if (typeof raw.delta === "string" && raw.delta) callbacks.onTextDelta(raw.delta);
        return false;
      }
      case "TEXT_MESSAGE_END": {
        const messageId = typeof raw.messageId === "string" ? raw.messageId : undefined;
        if (messageId && ignoredText.has(messageId)) return false;
        callbacks.onTextEnd?.();
        textId = undefined;
        return false;
      }
      case "REASONING_MESSAGE_CONTENT":
      case "REASONING_MESSAGE_CHUNK": {
        if (typeof raw.delta === "string" && raw.delta) callbacks.onThinkingDelta(raw.delta);
        return false;
      }
      case "TOOL_CALL_START":
        ensure(resolveToolId(raw), typeof raw.toolCallName === "string" ? raw.toolCallName : undefined);
        return false;
      case "TOOL_CALL_ARGS": {
        const tool = ensure(resolveToolId(raw));
        if (typeof raw.delta === "string") tool.args += raw.delta;
        return false;
      }
      case "TOOL_CALL_CHUNK": {
        const tool = ensure(resolveToolId(raw), typeof raw.toolCallName === "string" ? raw.toolCallName : undefined);
        if (typeof raw.delta === "string") tool.args += raw.delta;
        return false;
      }
      case "TOOL_CALL_END": {
        const id = readToolCallId(raw) ?? currentToolId;
        if (id) flushTool(id);
        if (id && id === currentToolId) currentToolId = undefined;
        return false;
      }
      case "TOOL_CALL_RESULT": {
        const id = readToolCallId(raw);
        const name = (id && (tools.get(id)?.name || toolNames.get(id))) || (typeof raw.toolCallName === "string" ? raw.toolCallName : "unknown");
        if (id) {
          flushTool(id);
          toolNames.delete(id);
        }
        callbacks.onToolResult({ toolCallId: id, toolName: name, result: toolContent(raw.content) });
        return false;
      }
      case "RUN_FINISHED":
        flushAll();
        await Promise.resolve(callbacks.onDone(""));
        return "done";
      case "RUN_ERROR":
        flushAll();
        await Promise.resolve(callbacks.onError(String(raw.message ?? "Unknown error")));
        return "error";
      default:
        return false;
    }
  };
}

function invalidEventMessage(error: { issues?: { message?: string }[] }): string {
  return error.issues?.[0]?.message || "Invalid AG-UI event";
}

export async function parseSseStream(body: ReadableStream<Uint8Array>, callbacks: AgentSseCallbacks, options?: { signal?: AbortSignal }): Promise<ParseSseResult> {
  if (options?.signal?.aborted) return "aborted";

  const dispatch = createSseDispatcher(callbacks);
  const events$ = parseSSEStream(
    runHttpRequest(
      async () =>
        new Response(body, {
          status: 200,
          headers: { "content-type": "text/event-stream" },
        }),
    ),
  );

  return await new Promise<ParseSseResult>((resolve) => {
    let settled = false;
    let gotTerminal = false;
    let chain = Promise.resolve();
    let sub: { unsubscribe: () => void } | undefined;

    const finish = (result: ParseSseResult) => {
      if (settled) return;
      settled = true;
      options?.signal?.removeEventListener("abort", onAbort);
      sub?.unsubscribe();
      resolve(result);
    };

    const onAbort = () => finish("aborted");
    options?.signal?.addEventListener("abort", onAbort);

    const fail = async (message: string) => {
      if (settled) return;
      await Promise.resolve(callbacks.onError(message));
      finish("error");
    };

    sub = events$.subscribe({
      next: (json) => {
        chain = chain
          .then(async () => {
            if (settled || options?.signal?.aborted) return;
            const parsed = EventSchemas.safeParse(json);
            if (!parsed.success) {
              await fail(invalidEventMessage(parsed.error));
              return;
            }
            const result = await dispatch(parsed.data as Record<string, unknown>);
            if (!result || settled) return;
            gotTerminal = true;
            finish(result);
          })
          .catch(async (err: unknown) => {
            if ((err as Error).name === "AbortError" || options?.signal?.aborted) {
              finish("aborted");
              return;
            }
            await fail((err as Error).message ?? "Stream read error");
          });
      },
      error: (err: unknown) => {
        void chain.then(async () => {
          if (settled) return;
          if ((err as Error)?.name === "AbortError" || options?.signal?.aborted) {
            finish("aborted");
            return;
          }
          await fail((err as Error)?.message ?? "Stream read error");
        });
      },
      complete: () => {
        void chain.then(async () => {
          if (settled) return;
          if (options?.signal?.aborted) {
            finish("aborted");
            return;
          }
          if (!gotTerminal) {
            await Promise.resolve(callbacks.onError("Connection lost"));
            finish("connection-lost");
          }
        });
      },
    });
  });
}
