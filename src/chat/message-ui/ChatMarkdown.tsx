import { useRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Checkbox } from "../../checkbox/Checkbox";
import { CodeBlock } from "../../codeblock/CodeBlock";
import { cn } from "../../lib/cn";
import { ChatMarkdownTable } from "./ChatMarkdownTable";
import { MermaidBlock } from "./MermaidBlock";
import { isPendingMermaidBlock } from "./mermaidFence";

/** Message body — sizes come from --chat-* tokens. */
export const chatBodyClass = "font-normal text-foreground text-(length:--chat-body-size) leading-(--chat-body-leading)";

/** Shared Tailwind prose classes for chat markdown. */
export const chatMarkdownClass = cn(
  chatBodyClass,
  "min-w-0 wrap-anywhere",
  "[&_p]:m-0 [&_p]:mb-(--chat-p-mb) [&_p:last-child]:mb-0",
  "[&_:is(h1,h2,h3,h4,h5,h6)]:mt-(--chat-h-mt) [&_:is(h1,h2,h3,h4,h5,h6)]:mb-(--chat-h-mb) [&_:is(h1,h2,h3,h4,h5,h6)]:text-(length:--chat-body-size) [&_:is(h1,h2,h3,h4,h5,h6)]:font-semibold [&_:is(h1,h2,h3,h4,h5,h6)]:leading-(--chat-body-leading)",
  "[&_:is(h1,h2,h3,h4,h5,h6):first-child]:mt-0",
  "[&_strong]:font-semibold [&_em]:italic",
  "[&_blockquote]:m-0 [&_blockquote]:mb-(--chat-p-mb) [&_blockquote]:border-0 [&_blockquote]:p-0 [&_blockquote]:not-italic [&_blockquote]:text-inherit [&_blockquote:last-child]:mb-0",
  "[&_ul]:mt-2 [&_ul]:mb-(--chat-p-mb)",
  "[&_ul:not(.contains-task-list)]:list-disc [&_ul:not(.contains-task-list)]:pl-6.5",
  "[&_ul.contains-task-list]:list-none [&_ul.contains-task-list]:pl-6.5",
  "[&_li.task-list-item]:relative",
  "[&_li.task-list-item>.nonla-md-task-check]:absolute [&_li.task-list-item>.nonla-md-task-check]:top-0 [&_li.task-list-item>.nonla-md-task-check]:-left-5.5",
  "[&_ol]:mt-2 [&_ol]:mb-(--chat-p-mb) [&_ol]:list-decimal [&_ol]:pl-6.5",
  "[&_li]:my-1.5 [&_li]:leading-(--chat-body-leading)",
  "[&_a]:text-link [&_a]:no-underline [&_a]:hover:underline [&_a]:hover:underline-offset-[3px]",
);

export type ChatMarkdownStreamState = {
  content: string;
  streaming: boolean;
};

export type ChatMarkdownProps = {
  content: string;
  streaming?: boolean;
  className?: string;
};

/**
 * Build markdown components. Pass getState so pending-mermaid can update via ref
 * without recreating the components object (avoids remounting finished charts).
 */
export function createChatMarkdownComponents(getState?: () => ChatMarkdownStreamState): Components {
  return {
    code({ className, children }) {
      const match = /language-(\w+)/.exec(className || "");
      const lang = match?.[1] ?? "";
      const codeText = String(children).replace(/\n$/, "");
      const isBlock = codeText.includes("\n") || !!match;

      if (isBlock) {
        const isMermaid = lang.toLowerCase() === "mermaid";
        if (isMermaid) {
          const state = getState?.();
          const pending = state ? isPendingMermaidBlock(state.content, codeText, state.streaming) : false;
          if (!pending) return <MermaidBlock>{codeText}</MermaidBlock>;
        }

        return <CodeBlock code={codeText} language={lang || undefined} className="my-3 last:mb-0" />;
      }

      return <span className="rounded-sm bg-foreground/12 font-mono px-px">{children}</span>;
    },
    hr() {
      return null;
    },
    table({ children }) {
      return <ChatMarkdownTable>{children}</ChatMarkdownTable>;
    },
    th({ children }) {
      return (
        <th>
          <div className="inline-block max-w-75 wrap-break-word">{children}</div>
        </th>
      );
    },
    td({ children }) {
      return (
        <td>
          <div className="inline-block max-w-75 wrap-break-word">{children}</div>
        </td>
      );
    },
    a({ href, children, ...props }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },
    input({ type, checked }) {
      if (type !== "checkbox") return <input type={type} checked={checked} readOnly />;
      return (
        <span className="nonla-md-task-check pointer-events-none inline-flex h-(--chat-body-leading) items-center">
          <Checkbox
            checked={Boolean(checked)}
            tabIndex={-1}
            className="data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-(--nonla-bg) data-[state=indeterminate]:border-white data-[state=indeterminate]:bg-white data-[state=indeterminate]:text-(--nonla-bg)"
          />
        </span>
      );
    },
  };
}

export const chatMarkdownComponents: Components = createChatMarkdownComponents();

export function ChatMarkdown({ content, streaming = false, className }: ChatMarkdownProps) {
  const streamStateRef = useRef<ChatMarkdownStreamState>({ content, streaming });
  streamStateRef.current = { content, streaming };

  const componentsRef = useRef<Components | null>(null);
  if (!componentsRef.current) {
    componentsRef.current = createChatMarkdownComponents(() => streamStateRef.current);
  }

  return (
    <div className={cn(chatMarkdownClass, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={componentsRef.current}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
