import { type ReactNode, useState } from "react";
import { CodeBlock } from "../codeblock/CodeBlock";
import { Icon } from "../icon/Icon";
import { cn } from "../lib/cn";
import { Segmented } from "../segmented/Segmented";
import { Tooltip } from "../tooltip/Tooltip";

type Tab = "preview" | "code";

const TABS = [
  { label: "Preview", value: "preview" },
  { label: "Code", value: "code" },
] satisfies { label: string; value: Tab }[];

export type ReactCodeFrameProps = {
  /** Label above the preview. Omit for no label bar. */
  title?: ReactNode;
  /** Icon before the title. */
  icon?: ReactNode;
  /** `false` drops the frame, so the result sits inline with the text around it. */
  showHeader?: boolean;
  /** Source for the Code view. Omit to show the result only. The switch lives in the frame, so no frame means no code. */
  code?: string;
  className?: string;
  /** The rendered result. */
  children: ReactNode;
};

/** Preview, and a way to open the source. A title bar keeps that switch beside the label. */
export function ReactCodeFrame({ title, icon, showHeader = true, code, className, children }: ReactCodeFrameProps) {
  const [tab, setTab] = useState<Tab>("preview");
  const [open, setOpen] = useState(false);
  if (!showHeader) return <div className={cn("mb-2 w-full min-w-0", className)}>{children}</div>;
  const hasCode = code !== undefined;
  const hasLabel = (title != null && title !== false) || icon != null;
  const showingCode = hasLabel ? tab === "code" : open;
  const codeLabel = open ? "Hide code" : "Show code";
  return (
    <div className={cn("mb-2 flex w-full min-w-0 flex-col overflow-clip rounded-xl border border-border text-foreground", className)}>
      {hasLabel ? (
        <div className="flex h-10 items-center justify-between gap-2 border-b border-border pr-2 pl-3 text-xs font-medium">
          <div className="flex min-w-0 items-center gap-2">
            {icon}
            {title != null && title !== false ? <span className="truncate">{title}</span> : null}
          </div>
          {hasCode ? <Segmented<Tab> size="small" options={TABS} value={tab} onChange={setTab} /> : null}
        </div>
      ) : null}
      {/* Stays mounted when the Code tab replaces it, so an iframe keeps its state. The code button keeps this and opens the source under it. */}
      <div className={cn("min-w-0 px-6 py-8", hasLabel && showingCode && "hidden")}>{children}</div>
      {hasCode && !hasLabel ? (
        <div className="flex h-10 items-center justify-end border-t border-border pr-1.5">
          <Tooltip title={codeLabel}>
            <button
              type="button"
              aria-expanded={open}
              aria-label={codeLabel}
              className={cn(
                "inline-flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/55",
                open ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name="code" size={16} />
            </button>
          </Tooltip>
        </div>
      ) : null}
      {hasCode && showingCode ? (
        <div className={cn(!hasLabel && "border-t border-border")}>
          <CodeBlock code={code} language="tsx" className="my-0 rounded-none border-0" />
        </div>
      ) : null}
    </div>
  );
}
