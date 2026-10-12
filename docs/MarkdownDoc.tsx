import * as ui from "@nonla-agents/ui";
import * as chat from "@nonla-agents/ui/chat";
import * as markdown from "@nonla-agents/ui/markdown";
import { MarkdownViewer } from "@nonla-agents/ui/markdown";
import * as rhf from "react-hook-form";

/** Same modules a docs fence may import. Stable so each block compiles once. */
const trustedModules = {
  "devnonla-ui": ui,
  "devnonla-ui/markdown": markdown,
  "devnonla-ui/chat": chat,
  "@nonla-agents/ui": ui,
  "@nonla-agents/ui/markdown": markdown,
  "@nonla-agents/ui/chat": chat,
  "react-hook-form": rhf,
};

/** Renders a docs page whose body is a markdown string. */
export function MarkdownDoc({ value }: { value: string }) {
  return <MarkdownViewer value={value} trustedModules={trustedModules} />;
}
