import { MarkdownViewer } from "../../markdown-editor/MarkdownViewer";

export type ChatMarkdownProps = {
  content: string;
  streaming?: boolean;
};

/** Agent markdown. `MarkdownViewer` on the `chat` scale. */
export function ChatMarkdown({ content, streaming = false }: ChatMarkdownProps) {
  return <MarkdownViewer value={content} streaming={streaming} variant="chat" />;
}
