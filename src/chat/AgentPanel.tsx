import { type ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { cn } from "../lib/cn";
import { OverlayScroll, type OverlayScrollVisibility } from "../scroll/OverlayScroll";
import { AgentMessageList, activityStatus, useStickToBottom } from "./chatMessageList";
import type { AgentMessage, AgentPanelEndpoint, AgentToolHook } from "./common/types";
import { useAgentStream } from "./common/useAgentStream";
import { ChatInput } from "./message-ui/ChatInput";
import { ChatWelcome } from "./message-ui/ChatWelcome";
import type { AgentToolUI } from "./tool-ui/registry";

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
  /** Custom node in the composer toolbar (model picker, tools, …). */
  toolbar?: ReactNode;
  /** Extra tool cards keyed by stream `toolName`. Checked before builtins. */
  toolUis?: AgentToolUI[];
  /** Tool lifecycle hooks, matched by `name` like `toolUis`. Omit `name` to hear every tool. */
  toolHooks?: AgentToolHook[];
  accessory?: ReactNode;
  emptyState?: ReactNode;
  /** Overlay scrollbar — does not reserve layout space. */
  scrollbar?: OverlayScrollVisibility;
  className?: string;
  onGeneratingChange?: (generating: boolean) => void;
};

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
  toolUis,
  toolHooks,
  accessory,
  emptyState,
  scrollbar = "hover",
  className,
  onGeneratingChange,
}: AgentPanelProps) {
  const { messages, generating, send, cancel, clear } = useAgentStream({
    endpoint,
    extraBody,
    headers,
    fetcher,
    initialMessages,
    toolHooks,
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
        <div data-chat-scroll-content className={`max-w-200 mx-auto min-w-0 w-full ${messages.length === 0 ? "flex flex-1 flex-col pb-24" : "pt-4 pb-28"}`}>
          {messages.length === 0 ? (
            (emptyState ?? (
              <ChatWelcome name={welcomeName} description={description} avatar={avatar} starters={starters} onStarter={sendMessage} disabled={generating} />
            ))
          ) : (
            <AgentMessageList messages={messages} generating={generating} toolUis={toolUis} showFooter={showFooter} status={status} />
          )}
        </div>
      </OverlayScroll>

      <div className="relative shrink-0">
        {accessory}
        <div className="mx-auto w-full max-w-200">
          <ChatInput generating={generating} placeholder={placeholder} onSend={sendMessage} onCancel={cancel} onClear={handleNewChat} toolbar={toolbar} focusSignal={String(epoch)} enableTypeToFocus />
        </div>
      </div>
    </div>
  );
}
