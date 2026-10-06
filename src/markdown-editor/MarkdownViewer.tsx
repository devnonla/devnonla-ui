import { type ReactNode, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Checkbox } from "../checkbox/Checkbox";
import { CodeBlock } from "../codeblock/CodeBlock";
import { cn } from "../lib/cn";
import { type InlineEdit, type MarkdownBlock, parseMarkdownDoc, readFence, readInlineEdit } from "./blocks";
import { MarkdownTable } from "./MarkdownTable";
import { MermaidBlock } from "./MermaidBlock";
import { ReactCode } from "./ReactCode";
import { ReactCodeSandbox } from "./ReactCodeSandbox";

const documentClass = cn(
  "min-w-0 wrap-anywhere text-[15px] leading-7 text-foreground",
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
    return <MarkdownTable>{children}</MarkdownTable>;
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

export function headingClass(level: number): string {
  if (level === 1) return "text-[32px] font-bold leading-tight tracking-tight";
  if (level === 2) return "text-[24px] font-bold leading-tight tracking-tight";
  if (level === 3) return "text-[20px] font-semibold leading-snug";
  if (level === 4) return "text-[18px] font-semibold leading-snug";
  if (level === 5) return "text-[16px] font-semibold leading-snug";
  return "text-[15px] font-semibold leading-snug";
}

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

export function ListItem({ view, children }: { view: Extract<InlineEdit, { kind: "list" }>; children: ReactNode }) {
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

export function spaceBefore(block: MarkdownBlock, prev?: MarkdownBlock): string {
  if (!prev) return "";
  if (isListBlock(block) && isListBlock(prev)) return "mt-0.5";
  if (block.kind === "text") {
    const view = readInlineEdit(block.body);
    if (view.kind === "heading") return headingGap(view.level);
  }
  if (prev.kind === "text" && readInlineEdit(prev.body).kind === "heading") return "mt-2";
  return "mt-3";
}

function fenceClosed(body: string): boolean {
  const lines = body.split("\n");
  if (lines.length < 2) return false;
  const last = (lines[lines.length - 1] ?? "").trim();
  return /^(?:`{3,}|~{3,})$/.test(last);
}

type LiveReactOptions = {
  trustedModules?: Record<string, unknown>;
  sandboxSrc?: string;
  showHeader?: boolean;
  showCode?: boolean;
};

export function BlockBody({ block, streaming, trustedModules, sandboxSrc, showHeader, showCode }: { block: MarkdownBlock; streaming?: boolean } & LiveReactOptions): ReactNode {
  if (block.kind === "mermaid") {
    const fence = readFence(block.body);
    const code = fence?.code ?? block.body;
    if (streaming && !fenceClosed(block.body)) return <CodeBlock code={code} language="mermaid" className="my-0" />;
    return <MermaidView code={code} />;
  }
  if (block.kind === "code") {
    const fence = readFence(block.body);
    if (!fence) return <CodeBlock code={block.body} className="my-0" />;
    // An unclosed fence is still being written, so it never runs.
    if (fence.lang === "live-react" && fenceClosed(block.body)) {
      if (sandboxSrc) return <ReactCodeSandbox key={fence.code} code={fence.code} src={sandboxSrc} showHeader={showHeader} showCode={showCode} />;
      if (trustedModules) return <ReactCode code={fence.code} trustedModules={trustedModules} showHeader={showHeader} showCode={showCode} />;
    }
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

export type MarkdownViewerProps = {
  value?: string;
  /** An open mermaid fence stays a code block until the stream closes it. */
  streaming?: boolean;
  placeholder?: string;
  className?: string;
  /**
   * Runs ```live-react fences in a sandboxed iframe. Use this for markdown written by
   * users or agents. Points at a page that calls `mountReactCodeRunner`, on its own origin.
   * Wins over `trustedModules` when both are set.
   */
  sandboxSrc?: string;
  /**
   * Runs ```live-react fences in this page, with its cookies, storage, and network.
   * Only for markdown you wrote. `react` is provided. Other imports must be listed here.
   */
  trustedModules?: Record<string, unknown>;
  /** Header on `live-react` results (`Sandbox` or `Live`). `false` shows the result inline. Default `true`. */
  showHeader?: boolean;
  /** Code tab in the header of `live-react` results. Needs `showHeader`. Default `true`. */
  showCode?: boolean;
};

/** Read-only markdown. Same blocks as the editor preview, without editing. */
export function MarkdownViewer({ value = "", streaming = false, sandboxSrc, trustedModules, showHeader = true, showCode = true, placeholder, className }: MarkdownViewerProps) {
  const doc = useMemo(() => parseMarkdownDoc(value), [value]);
  if (doc.blocks.length === 0) {
    return placeholder ? <p className={cn("m-0 text-sm text-placeholder", className)}>{placeholder}</p> : null;
  }
  return (
    <div className={cn("nonla-markdown-viewer flex min-w-0 flex-col text-foreground", className)}>
      {doc.blocks.map((block, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: block position is the document identity
          key={`${index}:${block.kind}`}
          data-md-block={block.kind}
          className={cn("outline-none", spaceBefore(block, doc.blocks[index - 1]))}
        >
          <BlockBody block={block} streaming={streaming} trustedModules={trustedModules} sandboxSrc={sandboxSrc} showHeader={showHeader} showCode={showCode} />
        </div>
      ))}
    </div>
  );
}
