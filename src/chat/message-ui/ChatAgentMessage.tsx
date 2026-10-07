import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ChatMarkdown } from "./ChatMarkdown";
import { ChatThinking } from "./ChatThinking";

export type ChatAgentMessageProps = {
  /** Markdown body. Rendered with `MarkdownViewer` `variant="chat"`. */
  content?: string;
  streaming?: boolean;
  /** Extra row content. Replaces `content` when set. */
  children?: ReactNode;
  thinking?: string;
  thinkingDuration?: number;
  thinkingStreaming?: boolean;
  className?: string;
};

export function ChatAgentMessage({ content, streaming = false, children, thinking, thinkingDuration, thinkingStreaming, className }: ChatAgentMessageProps) {
  const body = children ?? (content ? <ChatMarkdown content={content} streaming={streaming} /> : null);

  return (
    <div className={cn("nonla-chat-agent mt-1", className)}>
      {thinking ? <ChatThinking thinking={thinking} duration={thinkingDuration ?? 0} streaming={thinkingStreaming} /> : null}
      {body ? <div className="min-w-0 px-4 pb-0.5">{body}</div> : null}
    </div>
  );
}
