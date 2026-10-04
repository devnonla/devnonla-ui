import { MarkdownViewer } from "../../markdown-editor/MarkdownViewer";

export type ChatMarkdownProps = {
  content: string;
  streaming?: boolean;
};

/** Agent markdown. Uses MarkdownViewer as-is, with no extra prose styles. */
export function ChatMarkdown({ content, streaming = false }: ChatMarkdownProps) {
  return <MarkdownViewer value={content} streaming={streaming} />;
}
