import { type ReactNode, useState } from "react";
import { CodeBlock } from "../codeblock/CodeBlock";
import { cn } from "../lib/cn";
import { Segmented } from "../segmented/Segmented";

type Tab = "preview" | "code";

const TABS = [
  { label: "Preview", value: "preview" },
  { label: "Code", value: "code" },
] satisfies { label: string; value: Tab }[];

export type ReactCodeFrameProps = {
  /** Header text, such as `Sandbox`. */
  title: ReactNode;
  /** Icon before the title. `null` hides it. */
  icon?: ReactNode;
  /** `false` drops the header and the border, so the result sits inline with the text around it. */
  showHeader?: boolean;
  /** Source for the Code tab. Omit to show the result only. The tab lives in the header, so no header means no tab. */
  code?: string;
  className?: string;
  /** The rendered result. */
  children: ReactNode;
};

/** Header, result, and an optional Code tab around a rendered `live-react` block. */
export function ReactCodeFrame({ title, icon, showHeader = true, code, className, children }: ReactCodeFrameProps) {
  const [tab, setTab] = useState<Tab>("preview");
  if (!showHeader) return <div className={cn("mb-2 w-full min-w-0", className)}>{children}</div>;
  const hasCode = code !== undefined;
  return (
    <div className={cn("mb-2 flex w-full min-w-0 flex-col overflow-clip rounded-xl border border-border text-foreground", className)}>
      <div className="flex h-10 items-center justify-between gap-2 border-b border-border pr-2 pl-3 text-xs font-medium">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="truncate">{title}</span>
        </div>
        {hasCode ? <Segmented<Tab> size="small" options={TABS} value={tab} onChange={setTab} /> : null}
      </div>
      {/* Stays mounted on the Code tab, so an iframe keeps its state. */}
      <div className={cn("min-w-0 px-3 py-3", hasCode && tab === "code" && "hidden")}>{children}</div>
      {hasCode && tab === "code" ? <CodeBlock code={code} language="tsx" className="my-0 rounded-none border-0" /> : null}
    </div>
  );
}
