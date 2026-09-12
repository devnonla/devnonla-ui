import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { OverlayScroll, type OverlayScrollVisibility } from "../scroll/OverlayScroll";
import type { AgentMessage, AgentPanelEndpoint, AgentToolAction } from "./common/types";
import { parseBgTaskRef } from "./common/bgTasks";
import { useAgentStream } from "./common/useAgentStream";
import { formatToolName } from "./common/utils";
import { ChatAgentMessage } from "./message-ui/ChatAgentMessage";
import { ChatError } from "./message-ui/ChatError";
import { ChatInput } from "./message-ui/ChatInput";
import { ChatMarkdown } from "./message-ui/ChatMarkdown";
import { ChatThinking } from "./message-ui/ChatThinking";
import { ChatUserMessage } from "./message-ui/ChatUserMessage";
import { ChatWelcome } from "./message-ui/ChatWelcome";
import { BackgroundTaskToolUI } from "./tool-ui/BackgroundTaskToolUI";
import { ChatToolCall } from "./tool-ui/ChatToolCall";
import { resolveToolUI } from "./tool-ui/registry";

export type AgentPanelProps = {
  /** POST URL, or a function that returns an SSE `Response`. */
  endpoint: AgentPanelEndpoint;
  title?: string;
  /** Welcome name. Falls back to `title`. */
  name?: string;
  description?: string;
  avatar?: ReactNode;
  starters?: string[];
  placeholder?: string;
  /** Extra JSON merged into the POST body (string endpoint only). */
  extraBody?: Record<string, unknown> | (() => Record<string, unknown>);
  headers?: Record<string, string>;
  fetcher?: typeof fetch;
  initialMessages?: AgentMessage[];
  toolbar?: ReactNode;
  accessory?: ReactNode;
  emptyState?: ReactNode;
  /** Overlay scrollbar — does not reserve layout space. */
  scrollbar?: OverlayScrollVisibility;
  className?: string;
  onToolAction?: (event: AgentToolAction) => void;
  onGeneratingChange?: (generating: boolean) => void;
};

function activityStatus(messages: AgentMessage[]): string {
  const last = messages[messages.length - 1];
  if (!last) return "Thinking...";
  if (last.role === "tool-call") {
    if (last.toolOutput != null || last.toolError) return "Waiting for model...";
    return `Running ${last.toolLabel ?? formatToolName(last.toolName ?? "tool")}...`;
  }
  if (last.role === "assistant" && last.streaming && last.content) return "Writing...";
  return "Thinking...";
}

function useStickToBottom() {
  const elRef = useRef<HTMLDivElement | null>(null);
  const pinned = useRef(true);

  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    elRef.current = node;
  }, []);

  const onScroll = () => {
    const el = elRef.current;
    if (!el) return;
    pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };

  const scrollToBottom = useCallback((opts?: { force?: boolean }) => {
    const el = elRef.current;
    if (!el) return;
    if (!opts?.force && !pinned.current) return;
    pinned.current = true;
    el.scrollTop = el.scrollHeight;
  }, []);

  return { scrollRef, onScroll, scrollToBottom };
}

function MessageRow({ msg, generating }: { msg: AgentMessage; generating: boolean }) {
  if (msg.role === "user") return <ChatUserMessage content={msg.content} />;
  if (msg.role === "error") return <ChatError>{msg.content}</ChatError>;
  if (msg.role === "thinking") {
    return <ChatThinking thinking={msg.content} duration={(msg.meta?.thinkingDuration as number) ?? 0} />;
  }
  if (msg.role === "tool-call") {
    const CustomUI = resolveToolUI(msg.toolName);
    if (CustomUI) {
      return <CustomUI msg={msg} generating={generating} showAvatar={false} />;
    }
    if (parseBgTaskRef(msg.toolOutput)) {
      return <BackgroundTaskToolUI msg={msg} generating={generating} showAvatar={false} />;
    }
    const pending = msg.toolOutput == null && !msg.toolError;
    return (
      <ChatToolCall
        toolName={msg.toolName}
        label={msg.toolLabel}
        toolInput={msg.toolInput}
        toolOutput={msg.toolOutput}
        toolError={msg.toolError}
        running={pending && generating}
      />
    );
  }

  const thinking = msg.meta?.thinking;
  const thinkingDuration = msg.meta?.thinkingDuration;
  return (
    <ChatAgentMessage thinking={thinking} thinkingDuration={thinkingDuration ?? 0} thinkingStreaming={thinking != null && thinkingDuration == null}>
      {msg.content ? <ChatMarkdown content={msg.content} streaming={!!msg.streaming} /> : null}
    </ChatAgentMessage>
  );
}

export function AgentPanel({
  endpoint,
  title = "Assistant",
  name,
  description,
  avatar,
  starters,
  placeholder = "Message…",
  extraBody,
  headers,
  fetcher,
  initialMessages,
  toolbar,
  accessory,
  emptyState,
  scrollbar = "hover",
  className,
  onToolAction,
  onGeneratingChange,
}: AgentPanelProps) {
  const { messages, generating, send, cancel, clear } = useAgentStream({
    endpoint,
    extraBody,
    headers,
    fetcher,
    initialMessages,
    onToolAction,
  });
  const { scrollRef, onScroll, scrollToBottom } = useStickToBottom();
  const [epoch, setEpoch] = useState(0);
  const welcomeName = name ?? title;
  const lastMsg = messages[messages.length - 1];
  const status = activityStatus(messages);
  const lastToolPending = lastMsg?.role === "tool-call" && lastMsg.toolOutput == null && !lastMsg.toolError;
  const hasActiveThinking = lastMsg?.role === "assistant" && Boolean(lastMsg.meta?.thinking) && lastMsg.meta?.thinkingDuration == null;
  const isLiveText = status === "Writing..." || (lastMsg?.role === "assistant" && Boolean(lastMsg.streaming) && Boolean(lastMsg.content));
  const showFooter = generating && !hasActiveThinking && !lastToolPending && !isLiveText;

  useEffect(() => {
    onGeneratingChange?.(generating);
  }, [generating, onGeneratingChange]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages, generating, showFooter, scrollToBottom]);

  const sendMessage = (text: string) => {
    scrollToBottom({ force: true });
    void send(text);
  };

  const handleNewChat = () => {
    clear();
    setEpoch((n) => n + 1);
  };

  return (
    <div className={cn("nonla-agent-panel relative flex h-full min-h-0 flex-col overflow-hidden bg-chat", className)}>
      <OverlayScroll visibility={scrollbar} scrollRef={scrollRef} onScroll={onScroll} className="flex-1 min-h-0 min-w-0" innerClassName={messages.length === 0 ? "flex flex-col" : undefined}>
        <div data-chat-scroll-content className={`max-w-190 mx-auto min-w-0 w-full ${messages.length === 0 ? "flex flex-1 flex-col pb-24" : "pt-4 pb-28"}`}>
          {messages.length === 0 ? (
            (emptyState ?? (
              <ChatWelcome name={welcomeName} description={description} avatar={avatar} starters={starters} onStarter={sendMessage} disabled={generating} />
            ))
          ) : (
            <div className="flex flex-col">
              {messages.map((msg) => (
                <MessageRow key={msg.id} msg={msg} generating={generating} />
              ))}
              {showFooter ? (
                <div className="mt-1 px-4 pb-0.5">
                  <span className="nonla-chat-shimmer text-(length:--chat-body-size) leading-5.5 font-medium">{status}</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </OverlayScroll>

      <div className="relative shrink-0">
        {accessory}
        <div className="mx-auto w-full max-w-190">
          <ChatInput generating={generating} placeholder={placeholder} onSend={sendMessage} onCancel={cancel} onClear={handleNewChat} toolbar={toolbar} focusSignal={String(epoch)} enableTypeToFocus />
        </div>
      </div>
    </div>
  );
}
