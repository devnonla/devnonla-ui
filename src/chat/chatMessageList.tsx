import { useCallback, useRef } from "react";
import { cn } from "../lib/cn";
import { Shimmer } from "../shimmer/Shimmer";
import { chatRowBoxClass, chatRowClass } from "./chatRhythm";
import { parseBgTaskRef } from "./common/bgTasks";
import type { AgentMessage } from "./common/types";
import { formatToolName } from "./common/utils";
import { ChatAgentMessage } from "./message-ui/ChatAgentMessage";
import { ChatError } from "./message-ui/ChatError";
import { ChatThinking } from "./message-ui/ChatThinking";
import { ChatUserMessage } from "./message-ui/ChatUserMessage";
import { BackgroundTaskToolUI } from "./tool-ui/BackgroundTaskToolUI";
import { ChatToolCall } from "./tool-ui/ChatToolCall";
import { type AgentToolUI, resolveToolUI } from "./tool-ui/registry";

export function activityStatus(messages: AgentMessage[]): string {
  const last = messages[messages.length - 1];
  if (!last) return "Thinking...";
  if (last.role === "tool-call") {
    if (last.toolOutput != null || last.toolError) return "Waiting for model...";
    return `Running ${last.toolLabel ?? formatToolName(last.toolName ?? "tool")}...`;
  }
  if (last.role === "assistant" && last.streaming && last.content) return "Writing...";
  return "Thinking...";
}

export function useStickToBottom() {
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

export function MessageRow({ msg, generating, toolUis }: { msg: AgentMessage; generating: boolean; toolUis?: AgentToolUI[] }) {
  if (msg.role === "user") return <ChatUserMessage content={msg.content} />;
  if (msg.role === "error") return <ChatError>{msg.content}</ChatError>;
  if (msg.role === "thinking") {
    return <ChatThinking className={chatRowClass} thinking={msg.content} duration={(msg.meta?.thinkingDuration as number) ?? 0} />;
  }
  if (msg.role === "tool-call") {
    const CustomUI = resolveToolUI(msg.toolName, toolUis);
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
    <ChatAgentMessage content={msg.content} streaming={!!msg.streaming} thinking={thinking} thinkingDuration={thinkingDuration ?? 0} thinkingStreaming={thinking != null && thinkingDuration == null} />
  );
}


export function AgentMessageList({
  messages,
  generating,
  toolUis,
  showFooter,
  status,
}: {
  messages: AgentMessage[];
  generating: boolean;
  toolUis?: AgentToolUI[];
  showFooter: boolean;
  status: string;
}) {
  return (
    <div className="flex flex-col">
      {messages.map((msg) => (
        <MessageRow key={msg.id} msg={msg} generating={generating} toolUis={toolUis} />
      ))}
      {showFooter ? (
        <div className={cn(chatRowClass, chatRowBoxClass)}>
          <Shimmer className="text-sm font-medium leading-5.5 text-tertiary-foreground">{status}</Shimmer>
        </div>
      ) : null}
    </div>
  );
}

