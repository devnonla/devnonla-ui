import { type ReactNode, useEffect, useLayoutEffect } from "react";
import { cn } from "../lib/cn";
import { OverlayScroll, type OverlayScrollVisibility } from "../scroll/OverlayScroll";
import { AgentMessageList, activityStatus, useStickToBottom } from "./chatMessageList";
import type { AgentMessage, AgentToolHook } from "./common/types";
import {
  type AgentChatResumeRequest,
  type AgentChatSendRequest,
  useAgentChatStream,
} from "./common/useAgentChatStream";
import { ChatInput } from "./message-ui/ChatInput";
import { ChatWelcome } from "./message-ui/ChatWelcome";
import type { AgentToolUI } from "./tool-ui/registry";

export type AgentChatboxProps = {
  /** Seed messages for display (mount only). Remount when conversation changes. */
  initialMessages?: AgentMessage[];
  /** App POSTs only the new user text; must return an SSE `Response`. */
  send: (req: AgentChatSendRequest) => Promise<Response>;
  /** On mount: reattach a live stream (e.g. GET /stream). `null` = idle. */
  resume?: (req: AgentChatResumeRequest) => Promise<Response | null>;
  /** User pressed Stop — after client abort, notify app to cancel server generation. */
  onStop?: () => void | Promise<void>;

  title?: string;
  name?: string;
  description?: string;
  avatar?: ReactNode;
  starters?: string[];
  placeholder?: string;
  toolbar?: ReactNode;
  toolUis?: AgentToolUI[];
  toolHooks?: AgentToolHook[];
  accessory?: ReactNode;
  emptyState?: ReactNode;
  scrollbar?: OverlayScrollVisibility;
  className?: string;
  onGeneratingChange?: (generating: boolean) => void;
};

export function AgentChatbox({
  initialMessages,
  send,
  resume,
  onStop,
  title = "Assistant",
  name,
  description,
  avatar,
  starters,
  placeholder = "Message…",
  toolbar,
  toolUis,
  toolHooks,
  accessory,
  emptyState,
  scrollbar = "hover",
  className,
  onGeneratingChange,
}: AgentChatboxProps) {
  const { messages, generating, send: sendText, cancel } = useAgentChatStream({
    initialMessages,
    send,
    resume,
    onStop,
    toolHooks,
  });
  const { scrollRef, onScroll, scrollToBottom } = useStickToBottom();
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
    void sendText(text);
  };

  return (
    <div className={cn("nonla-agent-chatbox relative flex h-full min-h-0 flex-col overflow-hidden bg-chat", className)}>
      <OverlayScroll visibility={scrollbar} scrollRef={scrollRef} onScroll={onScroll} className="flex-1 min-h-0 min-w-0" innerClassName={messages.length === 0 ? "flex flex-col" : undefined}>
        <div data-chat-scroll-content className={`max-w-200 mx-auto min-w-0 w-full ${messages.length === 0 ? "flex flex-1 flex-col pb-16" : "pt-4 pb-20"}`}>
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
          <ChatInput generating={generating} placeholder={placeholder} onSend={sendMessage} onCancel={cancel} toolbar={toolbar} enableTypeToFocus />
        </div>
      </div>
    </div>
  );
}
