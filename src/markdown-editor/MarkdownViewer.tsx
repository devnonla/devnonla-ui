import { type CSSProperties, type ReactNode, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Checkbox } from "../checkbox/Checkbox";
import { CodeBlock } from "../codeblock/CodeBlock";
import { cn } from "../lib/cn";
import { type InlineEdit, type MarkdownBlock, parseMarkdownDoc, readFence, readInlineEdit } from "./blocks";
import { MarkdownTable } from "./MarkdownTable";
import { MermaidBlock } from "./MermaidBlock";
import { headingClass, markdownScaleStyle } from "./markdownScale";
import { ReactCode } from "./ReactCode";
import { ReactCodeSandbox } from "./ReactCodeSandbox";

export { headingClass, markdownScaleStyle };

/** Task checks use the body ink, so a checked box sits with the text instead of the brand fill. */
const taskCheckClass =
  "data-[state=checked]:border-foreground! data-[state=checked]:bg-foreground! data-[state=checked]:text-background! data-[state=indeterminate]:border-foreground! data-[state=indeterminate]:bg-foreground! data-[state=indeterminate]:text-background!";

const documentClass = cn(
  "min-w-0 wrap-anywhere text-(length:--md-body-size,var(--nonla-md-text-size,16px)) leading-(--md-body-leading,calc(var(--nonla-md-text-size,16px)*1.6)) text-foreground",
  "[&_:is(h1,h2,h3,h4,h5,h6)]:text-foreground",
  "[&_:is(h1,h2)]:mt-(--md-h2-mt,24px) [&_h1]:mb-(--md-h1-mb,12px) [&_h2]:mb-(--md-h2-mb,8px) [&_:is(h1,h2)]:pt-(--md-h2-py,3px) [&_:is(h1,h2)]:pb-(--md-h2-py,3px) [&_:is(h1,h2)]:text-(length:--md-h2-size,26px) [&_:is(h1,h2)]:leading-(--md-h2-leading,32px) [&_:is(h1,h2)]:font-(--md-h2-weight,600) [&_:is(h1,h2)]:tracking-normal",
  "[&_h3]:mt-(--md-h3-mt,22px) [&_h3]:mb-(--md-h3-mb,8px) [&_h3]:text-(length:--md-h3-size,24px) [&_h3]:leading-(--md-h3-leading,32px) [&_h3]:font-(--md-h3-weight,600)",
  "[&_:is(h4,h5,h6)]:mt-(--md-h4-mt,16px) [&_:is(h4,h5,h6)]:mb-(--md-h4-mb,1px) [&_:is(h4,h5,h6)]:text-(length:--md-h4-size,20px) [&_:is(h4,h5,h6)]:leading-(--md-h4-leading,26px) [&_:is(h4,h5,h6)]:font-(--md-h4-weight,700)",
  "[&_p]:my-(--md-p-my,1px) [&_p]:py-(--md-p-py,4px) [&_p]:leading-(--md-p-leading,1.6)",
  "[&_ul]:my-(--md-list-my,8px) [&_ul]:list-disc [&_ul]:pl-(--md-ul-pl,4px)",
  "[&_ol]:my-(--md-list-my,8px) [&_ol]:list-decimal [&_ol]:pl-(--md-ol-pl,4px)",
  "[&_li>ul]:mt-1 [&_li>ol]:mt-1 [&_li>ol]:pl-(--md-nest,1.25rem)",
  "[&_th_ul]:my-0 [&_td_ul]:my-0 [&_th_ol]:my-0 [&_td_ol]:my-0 [&_th_li]:mt-0 [&_td_li]:mt-0 [&_th_li>ul]:mt-0.5 [&_td_li>ul]:mt-0.5 [&_th_li>ol]:mt-0.5 [&_td_li>ol]:mt-0.5 [&_th_li>p]:my-0 [&_td_li>p]:my-0",
  "[&_ul.contains-task-list]:list-none",
  "[&_li]:mt-(--md-li-mt,4px) [&_li]:leading-[1.6]",
  "[&_li.task-list-item]:relative",
  "[&_li.task-list-item>.nonla-md-task-check]:absolute [&_li.task-list-item>.nonla-md-task-check]:top-1 [&_li.task-list-item>.nonla-md-task-check]:-left-5",
  /* Body paragraphs sit in separate blocks, so their margins do not collapse. Quote paragraphs share one block, so the next paragraph's top margin is doubled to land on that same gap. */
  "[&_blockquote]:my-(--md-quote-my,0px) [&_blockquote>p:not(:first-child)]:mt-[calc(var(--md-p-my,1px)*2)] [&_blockquote>p:not(:last-child)]:mb-0 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-foreground",
  "[&_a]:text-link [&_a]:underline-offset-[3px] hover:[&_a]:underline",
  "[&_hr]:hidden",
  "[&_strong]:font-(--md-strong-weight,600)",
  "[&_img]:my-(--md-img-my,4px) [&_img]:max-w-full [&_img]:rounded-lg",
);

const previewComponents: Components = {
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || "");
    const lang = match?.[1] ?? "";
    const codeText = String(children).replace(/\n$/, "");
    const isBlock = codeText.includes("\n") || !!match;
    if (!isBlock) {
      return <code className="nonla-inline-code rounded-[4px] bg-muted px-[2px] py-px align-baseline font-mono text-(length:--md-inline-size,var(--nonla-mono-text-size)) leading-none whitespace-nowrap [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">{children}</code>;
    }
    if (lang.toLowerCase() === "mermaid") return <MermaidView code={codeText} />;
    return <CodeBlock code={codeText} language={lang || undefined} className="my-(--md-code-my,8px)" />;
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
        <span className="nonla-md-task-check pointer-events-none inline-flex h-(--md-body-leading,calc(var(--nonla-md-text-size,16px)*1.6)) items-center">
        <Checkbox checked={Boolean(checked)} tabIndex={-1} className={taskCheckClass} />
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
  const marker = "w-6 shrink-0 pt-0.5 text-(length:--md-body-size,var(--nonla-md-text-size,16px)) leading-(--md-p-leading,1.6)";
  return (
    <div className="flex items-start gap-1.5 pl-(--md-item-pl,4px)" style={level > 0 ? { marginLeft: `calc(${level} * var(--md-nest, 1.25rem))` } : undefined}>
      {view.task ? (
        <span className={cn(marker, "pointer-events-none inline-flex justify-center")}>
          <span className="mt-[calc((1lh-1rem)/2)] inline-flex">
            <Checkbox checked={view.checked} tabIndex={-1} className={taskCheckClass} />
          </span>
        </span>
      ) : view.ordered ? (
        <span className={cn(marker, "text-right tabular-nums")}>{ordinal}.</span>
      ) : (
        <span className={cn(marker, "flex justify-center")} aria-hidden>
          <span className="mt-[calc((1lh-0.375rem)/2)] size-1.5 rounded-full bg-current" />
        </span>
      )}
      <div className="min-w-0 flex-1 [&_p]:my-0! [&_p]:py-0.5!">{children}</div>
    </div>
  );
}

function isListBlock(block: MarkdownBlock): boolean {
  return block.kind === "text" && readInlineEdit(block.body).kind === "list";
}

export function spaceBefore(block: MarkdownBlock, prev?: MarkdownBlock): string {
  if (!prev) return "";
  if (isListBlock(block) && isListBlock(prev)) return "mt-0.5";
  if (prev.kind === "text" && readInlineEdit(prev.body).kind === "heading") return "[&_p:first-child]:mt-0! [&_p:first-child]:pt-0.5!";
  if (isListBlock(block) && prev.kind === "text") return "mt-1";
  if (block.kind === "text" && prev.kind === "text") return "";
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
  /** Frame around `live-react` results. `false` shows the result inline. Default `true`. */
  showHeader?: boolean;
  /** Switch that opens the source of a `live-react` preview. Needs `showHeader`. Default `true`. */
  showCode?: boolean;
  /** Overrides scale variables from `markdownScaleStyle`, such as heading size. */
  style?: CSSProperties;
};

/** Read-only markdown. Same blocks as the editor preview, without editing. */
export function MarkdownViewer({ value = "", streaming = false, sandboxSrc, trustedModules, showHeader = true, showCode = true, placeholder, className, style }: MarkdownViewerProps) {
  const doc = useMemo(() => parseMarkdownDoc(value), [value]);
  if (doc.blocks.length === 0) {
    return placeholder ? <p className={cn("m-0 text-sm text-quaternary-foreground", className)}>{placeholder}</p> : null;
  }
  return (
    <div className={cn("nonla-markdown-viewer flex min-w-0 flex-col text-foreground", className)} style={{ ...markdownScaleStyle, ...style }}>
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
