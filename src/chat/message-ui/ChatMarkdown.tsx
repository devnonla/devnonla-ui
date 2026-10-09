import type { CSSProperties } from "react";
import { MarkdownViewer } from "../../markdown-editor/MarkdownViewer";

export type ChatMarkdownProps = {
  content: string;
  streaming?: boolean;
};

/** Reply headings match the body: `text-md`, weight 400. Strong is 500. Tables stay `text-base`. */
const chatHeadingScale = {
  "--md-h1-size": "var(--nonla-md-text-size)",
  "--md-h2-size": "var(--nonla-md-text-size)",
  "--md-h3-size": "var(--nonla-md-text-size)",
  "--md-h4-size": "var(--nonla-md-text-size)",
  "--md-h5-size": "var(--nonla-md-text-size)",
  "--md-h6-size": "var(--nonla-md-text-size)",
  "--md-h1-leading": "var(--md-body-leading)",
  "--md-h2-leading": "var(--md-body-leading)",
  "--md-h3-leading": "var(--md-body-leading)",
  "--md-h4-leading": "var(--md-body-leading)",
  "--md-h5-leading": "var(--md-body-leading)",
  "--md-h6-leading": "var(--md-body-leading)",
  "--md-h1-weight": "400",
  "--md-h2-weight": "400",
  "--md-h3-weight": "400",
  "--md-h4-weight": "400",
  "--md-h5-weight": "400",
  "--md-h6-weight": "400",
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

/** Agent markdown. Headings use the body size at weight 400. */
export function ChatMarkdown({ content, streaming = false }: ChatMarkdownProps) {
  return <MarkdownViewer value={content} streaming={streaming} className={chatEdgeClass} style={chatHeadingScale} />;
}
