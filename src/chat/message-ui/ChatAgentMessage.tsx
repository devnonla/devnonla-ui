import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import type { MarkdownComponents } from "../../markdown-editor/MarkdownViewer";
import { chatRowBoxClass, chatRowClass } from "../chatRhythm";
import { ChatMarkdown } from "./ChatMarkdown";
import { ChatThinking } from "./ChatThinking";

export type ChatAgentMessageProps = {
  /** Markdown body. Rendered with `MarkdownViewer`. */
  content?: string;
  streaming?: boolean;
  /** Fence language → component for `content`. */
  components?: MarkdownComponents;
  /** Extra row content. Replaces `content` when set. */
  children?: ReactNode;
  thinking?: string;
  thinkingDuration?: number;
  thinkingStreaming?: boolean;
  className?: string;
};

export function ChatAgentMessage({ content, streaming = false, components, children, thinking, thinkingDuration, thinkingStreaming, className }: ChatAgentMessageProps) {
  const body = children ?? (content ? <ChatMarkdown content={content} streaming={streaming} components={components} /> : null);

  return (
    <div className={cn("nonla-chat-agent", chatRowClass, className)}>
      {thinking ? <ChatThinking thinking={thinking} duration={thinkingDuration ?? 0} streaming={thinkingStreaming} /> : null}
      {body ? <div className={cn("min-w-0", chatRowBoxClass, thinking && chatRowClass)}>{body}</div> : null}
    </div>
  );
}
