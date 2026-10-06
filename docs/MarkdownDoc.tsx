import * as ui from "@nonla-agents/ui";
import { MarkdownViewer } from "@nonla-agents/ui";
import * as rhf from "react-hook-form";

/** Same modules a docs fence may import. Stable so each block compiles once. */
const trustedModules = {
  "devnonla-ui": ui,
  "@nonla-agents/ui": ui,
  "react-hook-form": rhf,
};

/** Renders a docs page whose body is a markdown string. */
export function MarkdownDoc({ value }: { value: string }) {
  return <MarkdownViewer value={value} trustedModules={trustedModules} />;
}
