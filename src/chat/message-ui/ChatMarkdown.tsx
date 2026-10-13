import type { CSSProperties } from "react";
import { type MarkdownComponents, MarkdownViewer, useMarkdownComponents } from "../../markdown-editor/MarkdownViewer";

export type ChatMarkdownProps = {
  content: string;
  streaming?: boolean;
  /** Fence language → component, such as `step`, `subagent`, or `mindmap`. */
  components?: MarkdownComponents;
};

/** Reply headings are `text-lg` at the strong weight. Body stays `text-md`. Strong is 500. Tables stay `text-base`. */
const chatHeadingScale = {
  "--md-h1-size": "var(--text-lg)",
  "--md-h2-size": "var(--text-lg)",
  "--md-h3-size": "var(--text-lg)",
  "--md-h4-size": "var(--text-lg)",
  "--md-h5-size": "var(--text-lg)",
  "--md-h6-size": "var(--text-lg)",
  "--md-h1-leading": "var(--text-lg--line-height)",
  "--md-h2-leading": "var(--text-lg--line-height)",
  "--md-h3-leading": "var(--text-lg--line-height)",
  "--md-h4-leading": "var(--text-lg--line-height)",
  "--md-h5-leading": "var(--text-lg--line-height)",
  "--md-h6-leading": "var(--text-lg--line-height)",
  "--md-h1-weight": "500",
  "--md-h2-weight": "500",
  "--md-h3-weight": "500",
  "--md-h4-weight": "500",
  "--md-h5-weight": "500",
  "--md-h6-weight": "500",
  "--md-strong-weight": "500",
} as CSSProperties;

/**
 * Headings use the paragraph box, so `#` does not keep the article margin.
 * The first and last line drop that padding so the row padding is the only gap.
 */
const chatEdgeClass = [
  "[&_:is(h1,h2,h3,h4,h5,h6)]:my-(--md-p-my,1px)! [&_:is(h1,h2,h3,h4,h5,h6)]:py-(--md-p-py,4px)!",
  "[&_[data-md-block]:not(:first-child)_p:first-child]:mt-(--md-p-my,1px)! [&_[data-md-block]:not(:first-child)_p:first-child]:pt-(--md-p-py,4px)!",
  "[&_[data-md-block]:first-child_:is(p,h1,h2,h3,h4,h5,h6,ul,ol)]:mt-0! [&_[data-md-block]:first-child_:is(p,h1,h2,h3,h4,h5,h6)]:pt-0! [&_[data-md-block]:last-child_:is(p,h1,h2,h3,h4,h5,h6,ul,ol)]:mb-0! [&_[data-md-block]:last-child_:is(p,h1,h2,h3,h4,h5,h6)]:pb-0!",
].join(" ");

/** Agent markdown. Headings are `text-lg` at the strong weight. */
export function ChatMarkdown({ content, streaming = false, components }: ChatMarkdownProps) {
  const inherited = useMarkdownComponents();
  return <MarkdownViewer value={content} streaming={streaming} className={chatEdgeClass} style={chatHeadingScale} components={components ?? inherited} />;
}
