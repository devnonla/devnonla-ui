import { type MouseEvent, type ReactNode, useLayoutEffect, useRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMarkdownTable } from "../chat/message-ui/ChatMarkdownTable";
import { MermaidBlock } from "../chat/message-ui/MermaidBlock";
import { Checkbox } from "../checkbox/Checkbox";
import { CodeBlock } from "../codeblock/CodeBlock";
import { cn } from "../lib/cn";
import { OverlayScroll } from "../scroll/OverlayScroll";
import { type InlineEdit, type MarkdownBlock, type MarkdownDoc, readFence, readInlineEdit, writeInlineEdit } from "./blocks";

const documentClass = cn(
  "min-w-0 text-[15px] leading-7 text-foreground",
  "[&_h1]:my-0 [&_h1]:text-[32px] [&_h1]:leading-tight [&_h1]:font-bold [&_h1]:tracking-tight",
  "[&_h2]:my-0 [&_h2]:text-[24px] [&_h2]:leading-tight [&_h2]:font-bold [&_h2]:tracking-tight",
  "[&_h3]:my-0 [&_h3]:text-[20px] [&_h3]:leading-snug [&_h3]:font-semibold",
  "[&_h4]:my-0 [&_h4]:text-[18px] [&_h4]:leading-snug [&_h4]:font-semibold",
  "[&_h5]:my-0 [&_h5]:text-[16px] [&_h5]:leading-snug [&_h5]:font-semibold",
  "[&_h6]:my-0 [&_h6]:text-[15px] [&_h6]:leading-snug [&_h6]:font-semibold",
  "[&_p]:my-0",
  "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-6",
  "[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_ul.contains-task-list]:list-none",
  "[&_li]:my-0.5",
  "[&_li.task-list-item]:relative",
  "[&_li.task-list-item>.nonla-md-task-check]:absolute [&_li.task-list-item>.nonla-md-task-check]:top-1 [&_li.task-list-item>.nonla-md-task-check]:-left-5",
  "[&_blockquote]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  "[&_a]:text-link [&_a]:underline-offset-[3px] hover:[&_a]:underline",
  "[&_hr]:my-2 [&_hr]:border-border",
  "[&_strong]:font-semibold",
  "[&_img]:my-1 [&_img]:max-w-full [&_img]:rounded-lg",
);

const previewComponents: Components = {
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || "");
    const lang = match?.[1] ?? "";
    const codeText = String(children).replace(/\n$/, "");
    const isBlock = codeText.includes("\n") || !!match;
    if (!isBlock) {
      return <code className="rounded-sm bg-secondary px-1 py-0.5 font-mono text-[0.9em]">{children}</code>;
    }
    if (lang.toLowerCase() === "mermaid") return <MermaidView code={codeText} />;
    return <CodeBlock code={codeText} language={lang || undefined} className="my-2" />;
  },
  table({ children }) {
    return <ChatMarkdownTable>{children}</ChatMarkdownTable>;
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
      <span className="nonla-md-task-check pointer-events-none inline-flex h-7 items-center">
          <Checkbox checked={Boolean(checked)} tabIndex={-1} />
      </span>
    );
  },
};

function MermaidView({ code }: { code: string }) {
  if (!code.trim()) {
    return <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">Empty diagram</div>;
  }
  return <MermaidBlock className="my-0">{code}</MermaidBlock>;
}

function headingClass(level: number): string {
  if (level === 1) return "text-[32px] font-bold leading-tight tracking-tight";
  if (level === 2) return "text-[24px] font-bold leading-tight tracking-tight";
  if (level === 3) return "text-[20px] font-semibold leading-snug";
  if (level === 4) return "text-[18px] font-semibold leading-snug";
  if (level === 5) return "text-[16px] font-semibold leading-snug";
  return "text-[15px] font-semibold leading-snug";
}

function BlockEditor({ value, mono, className, caret = "end", onChange, onBlur, onEnter }: { value: string; mono?: boolean; className?: string; caret?: "start" | "end"; onChange: (value: string) => void; onBlur: () => void; onEnter?: (before: string, after: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const pos = caret === "start" ? 0 : el.value.length;
    el.setSelectionRange(pos, pos);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      data-md-editor="block"
      value={value}
      rows={1}
      spellCheck={!mono}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.currentTarget.blur();
          return;
        }
        if (event.key === "Enter" && onEnter && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault();
          const el = event.currentTarget;
          onEnter(value.slice(0, el.selectionStart), value.slice(el.selectionEnd));
          return;
        }
        if (event.key !== "Tab") return;
        event.preventDefault();
        const el = event.currentTarget;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const next = `${value.slice(0, start)}  ${value.slice(end)}`;
        onChange(next);
        const pos = start + 2;
        requestAnimationFrame(() => {
          el.selectionStart = pos;
          el.selectionEnd = pos;
        });
      }}
      className={cn(
        "block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-[15px] leading-7 text-foreground shadow-none outline-none ring-0 placeholder:text-placeholder focus:outline-none focus:ring-0",
        mono && "font-mono text-[13px] leading-5",
        className,
      )}
      aria-label="Edit markdown"
    />
  );
}

function interactiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest("a, button, textarea, input");
}

export type MarkdownPreviewProps = {
  doc: MarkdownDoc;
  editingIndex: number | null;
  readOnly?: boolean;
  placeholder?: string;
  onStartEdit: (index: number) => boolean;
  onEditMouseDown: (index: number, event: MouseEvent) => void;
  onChangeBody: (body: string) => void;
  onBlurBlock: () => void;
  onEnterList: (before: string, after: string) => void;
  /** Where the caret goes when an edit starts. */
  caret?: "start" | "end";
  onAppend: () => void;
};

type MdNode = {
  type: string;
  value?: string;
  children?: MdNode[];
};

/** A single Enter stays a visible line after the block editor closes. */
function remarkKeepLineBreaks() {
  return (tree: MdNode) => {
    breakParagraphLines(tree);
  };
}

function breakParagraphLines(node: MdNode) {
  if (!node.children) return;
  if (node.type === "paragraph" || node.type === "heading") {
    splitInlineBreaks(node);
    return;
  }
  for (const child of node.children) breakParagraphLines(child);
}

function splitInlineBreaks(node: MdNode) {
  if (!node.children) return;
  node.children = node.children.flatMap((child) => {
    if (child.type === "inlineCode" || child.type === "code") return [child];
    splitInlineBreaks(child);
    return splitSoftBreaks(child);
  });
}

function splitSoftBreaks(node: MdNode): MdNode[] {
  if (node.type !== "text" || !node.value?.includes("\n")) return [node];
  const parts = node.value.split("\n");
  const out: MdNode[] = [];
  for (let index = 0; index < parts.length; index++) {
    if (index > 0) out.push({ type: "break" });
    const part = parts[index] ?? "";
    if (part.length > 0) out.push({ type: "text", value: part });
  }
  return out;
}

function RichText({ source }: { source: string }) {
  return (
    <div className={documentClass}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkKeepLineBreaks]} components={previewComponents}>
        {source}
      </ReactMarkdown>
    </div>
  );
}

function ListItem({ view, children }: { view: Extract<InlineEdit, { kind: "list" }>; children: ReactNode }) {
  const level = Math.floor(view.indent.length / 2);
  const ordinal = Number(/^(\d+)/.exec(view.marker)?.[1] ?? "1");
  return (
    <div className="flex items-start gap-1.5" style={level > 0 ? { marginLeft: `${level * 1.25}rem` } : undefined}>
      {view.task ? (
        <span className="pointer-events-none inline-flex h-7 w-5 shrink-0 items-center justify-center">
          <Checkbox checked={view.checked} tabIndex={-1} />
        </span>
      ) : view.ordered ? (
        <span className="w-6 shrink-0 text-right text-[15px] leading-7 tabular-nums">{ordinal}.</span>
      ) : (
        <span className="flex h-7 w-5 shrink-0 items-center justify-center" aria-hidden>
          <span className="size-1.5 rounded-full bg-current" />
        </span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function isListBlock(block: MarkdownBlock): boolean {
  return block.kind === "text" && readInlineEdit(block.body).kind === "list";
}

function headingGap(level: number): string {
  if (level <= 2) return "mt-6";
  if (level === 3) return "mt-5";
  if (level === 4) return "mt-4";
  return "mt-3";
}

function spaceBefore(block: MarkdownBlock, prev?: MarkdownBlock): string {
  if (!prev) return "";
  if (isListBlock(block) && isListBlock(prev)) return "mt-0.5";
  if (block.kind === "text") {
    const view = readInlineEdit(block.body);
    if (view.kind === "heading") return headingGap(view.level);
  }
  if (prev.kind === "text" && readInlineEdit(prev.body).kind === "heading") return "mt-2";
  return "mt-3";
}

function BlockBody({ block }: { block: MarkdownBlock }): ReactNode {
  if (block.kind === "mermaid") {
    const fence = readFence(block.body);
    return <MermaidView code={fence?.code ?? block.body} />;
  }
  if (block.kind === "code") {
    const fence = readFence(block.body);
    if (!fence) return <CodeBlock code={block.body} className="my-0" />;
    return <CodeBlock code={fence.code} language={fence.lang || undefined} className="my-0" />;
  }
  const view = readInlineEdit(block.body);
  if (view.kind === "list") {
    return (
      <ListItem view={view}>
        <RichText source={view.text} />
      </ListItem>
    );
  }
  return <RichText source={block.body} />;
}

export function MarkdownPreview({ doc, editingIndex, readOnly, placeholder = "Write markdown…", onStartEdit, onEditMouseDown, onChangeBody, onBlurBlock, onEnterList, caret = "end", onAppend }: MarkdownPreviewProps) {
  return (
    <OverlayScroll className="h-full bg-card">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-8 py-6">
        {doc.blocks.map((block, index) => {
          const editing = editingIndex === index;
          const locked = block.kind === "mermaid" || readOnly;
          const view = block.kind === "text" ? readInlineEdit(block.body) : null;
          const editor =
            view?.kind === "heading" ? (
              <BlockEditor value={view.text} className={headingClass(view.level)} caret={caret} onChange={(text) => onChangeBody(writeInlineEdit(block.body, text))} onBlur={onBlurBlock} />
            ) : view?.kind === "list" ? (
              <ListItem view={view}>
                <BlockEditor value={view.text} caret={caret} onEnter={onEnterList} onChange={(text) => onChangeBody(writeInlineEdit(block.body, text))} onBlur={onBlurBlock} />
              </ListItem>
            ) : (
              <BlockEditor value={block.body} mono={block.kind === "code"} caret={caret} onChange={onChangeBody} onBlur={onBlurBlock} />
            );
          const gap = spaceBefore(block, doc.blocks[index - 1]);
          if (locked) {
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: block position is the edit identity
                key={`${index}:${block.kind}`}
                data-md-block={block.kind}
                className={cn("outline-none", gap)}
              >
                <BlockBody block={block} />
              </div>
            );
          }
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: block position is the edit identity
              key={`${index}:${block.kind}`}
              role="button"
              data-md-block={block.kind}
              tabIndex={0}
              className={cn("cursor-text outline-none", gap)}
              onMouseDown={(event) => onEditMouseDown(index, event)}
              onClick={(event) => {
                if (editing || interactiveTarget(event.target)) return;
                const selection = window.getSelection();
                if (selection && selection.toString().length > 0) return;
                onStartEdit(index);
              }}
              onKeyDown={(event) => {
                if (editing || event.key !== "Enter") return;
                event.preventDefault();
                onStartEdit(index);
              }}
            >
              {editing ? editor : <BlockBody block={block} />}
            </div>
          );
        })}
        {readOnly ? (
          doc.blocks.length === 0 ? <p className="m-0 text-sm text-placeholder">{placeholder}</p> : null
        ) : (
          <button type="button" className="mt-3 min-h-16 text-left text-sm text-placeholder" onClick={onAppend} aria-label="Add paragraph">
            {doc.blocks.length === 0 ? placeholder : ""}
          </button>
        )}
      </div>
    </OverlayScroll>
  );
}
