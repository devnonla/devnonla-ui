import { type ReactNode, useState } from "react";
import { cn } from "../lib/cn";
import { OverlayScroll } from "../scroll/OverlayScroll";
import { type DiffLine, type FoldItem, foldContext, type MarkdownDiffModel } from "./diff";

export type MarkdownDiffLayout = "inline" | "side-by-side";

function rowBg(kind: DiffLine["kind"]): string {
  if (kind === "insert") return "bg-[color-mix(in_oklab,var(--success)_16%,var(--card))]";
  if (kind === "delete") return "bg-[color-mix(in_oklab,var(--destructive)_14%,var(--card))]";
  if (kind === "empty") return "bg-muted/45";
  return "bg-card";
}

function charBg(kind: DiffLine["kind"]): string {
  if (kind === "insert") return "bg-[color-mix(in_oklab,var(--success)_42%,var(--card))]";
  if (kind === "delete") return "bg-[color-mix(in_oklab,var(--destructive)_36%,var(--card))]";
  return "";
}

function marker(kind: DiffLine["kind"]): string {
  if (kind === "insert") return "+";
  if (kind === "delete") return "−";
  return "";
}

function DiffText({ line }: { line: DiffLine }) {
  if (line.kind === "empty" || line.spans.length === 0) return <span className="inline-block min-h-5">{"\u00a0"}</span>;
  const parts: { key: string; text: string; changed: boolean }[] = [];
  let offset = 0;
  for (const span of line.spans) {
    parts.push({ key: `${offset}:${span.changed ? "c" : "s"}`, text: span.text, changed: span.changed });
    offset += span.text.length + 1;
  }
  return (
    <>
      {parts.map((part) => (
        <span key={part.key} className={cn(part.changed && "rounded-xs", part.changed && charBg(line.kind))}>
          {part.text}
        </span>
      ))}
    </>
  );
}

function Gutter({ value, className }: { value?: number; className?: string }) {
  return <span className={cn("w-10 shrink-0 select-none pr-2 text-right font-mono text-[11px] leading-5 text-quaternary-foreground tabular-nums", className)}>{value ?? ""}</span>;
}

function Mark({ kind }: { kind: DiffLine["kind"] }) {
  return (
    <span aria-hidden className={cn("w-4 shrink-0 text-center font-mono text-[13px] leading-5", kind === "insert" && "text-success", kind === "delete" && "text-destructive")}>
      {marker(kind)}
    </span>
  );
}

function LineBody({ line }: { line: DiffLine }) {
  return (
    <span className="min-h-5 whitespace-pre pr-4 font-mono text-[13px] leading-5">
      <DiffText line={line} />
    </span>
  );
}

function FoldButton({ count, onClick, span }: { count: number; onClick: () => void; span?: boolean }) {
  return (
    <button type="button" className={cn("flex w-full items-center justify-center border-y border-border bg-muted/70 py-0.5 text-xs text-link hover:bg-muted", span && "col-span-2")} onClick={onClick}>
      Show {count} unchanged {count === 1 ? "line" : "lines"}
    </button>
  );
}

function useFolds(): [Set<number>, (id: number) => void] {
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const toggle = (id: number) => {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return [open, toggle];
}

function visibleNodes<T>(entries: FoldItem<T>[], open: Set<number>, toggle: (id: number) => void, span: boolean, renderItem: (item: T, key: string) => ReactNode): ReactNode[] {
  const nodes: ReactNode[] = [];
  entries.forEach((entry, index) => {
    if (entry.type === "fold" && !open.has(entry.id)) {
      nodes.push(<FoldButton key={`fold-${entry.id}`} count={entry.count} span={span} onClick={() => toggle(entry.id)} />);
      return;
    }
    const items = entry.type === "fold" ? entry.items : [entry.item];
    items.forEach((item, itemIndex) => {
      nodes.push(renderItem(item, `${index}-${itemIndex}`));
    });
  });
  return nodes;
}

function SideCell({ line, num }: { line: DiffLine; num?: number }) {
  return (
    <div className="flex min-h-5 min-w-max">
      <Gutter value={num} />
      <Mark kind={line.kind} />
      <LineBody line={line} />
    </div>
  );
}

function InlineLine({ line }: { line: DiffLine }) {
  const bg = rowBg(line.kind);
  return (
    <div className={cn("flex min-h-5 min-w-full w-max", bg)}>
      <Gutter value={line.kind === "insert" ? undefined : line.oldNo} className={cn("sticky left-0 z-10", bg)} />
      <Gutter value={line.kind === "delete" ? undefined : line.newNo} className={cn("sticky left-10 z-10", bg)} />
      <Mark kind={line.kind} />
      <LineBody line={line} />
    </div>
  );
}

export type MarkdownDiffProps = {
  model: MarkdownDiffModel;
  layout: MarkdownDiffLayout;
  originalLabel?: ReactNode;
  modifiedLabel?: ReactNode;
};

export function MarkdownDiff({ model, layout, originalLabel = "Original", modifiedLabel = "Modified" }: MarkdownDiffProps) {
  const [openSplit, toggleSplit] = useFolds();
  const [openInline, toggleInline] = useFolds();

  if (layout === "inline") {
    const folded = foldContext(model.inline, (line) => line.kind === "equal");
    return (
      <OverlayScroll className="h-full bg-card" innerClassName="overflow-x-auto">
        <div role="region" aria-label="Markdown diff" className="min-w-full">
          <div className="sticky top-0 z-20 border-b border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {originalLabel}
            <span className="px-1.5 text-quaternary-foreground">→</span>
            {modifiedLabel}
          </div>
          {visibleNodes(folded, openInline, toggleInline, false, (line, key) => (
            <InlineLine key={`${key}-${line.kind}-${line.oldNo ?? "x"}-${line.newNo ?? "x"}`} line={line} />
          ))}
        </div>
      </OverlayScroll>
    );
  }

  return <SplitDiff model={model} open={openSplit} toggle={toggleSplit} originalLabel={originalLabel} modifiedLabel={modifiedLabel} />;
}

function SplitDiff({ model, open, toggle, originalLabel, modifiedLabel }: { model: MarkdownDiffModel; open: Set<number>; toggle: (id: number) => void; originalLabel: ReactNode; modifiedLabel: ReactNode }) {
  const folded = foldContext(model.rows, (row) => row.left.kind === "equal" && row.right.kind === "equal");
  const chunks: ReactNode[] = [];
  let left: ReactNode[] = [];
  let right: ReactNode[] = [];
  let segment = 0;

  const flush = () => {
    if (left.length === 0) return;
    const id = segment;
    segment += 1;
    chunks.push(
      <div key={`seg-${id}`} className="flex w-full items-start">
        <div className="w-1/2 min-w-0 overflow-x-auto [scrollbar-color:transparent_transparent] hover:[scrollbar-color:var(--nonla-scrollbar-thumb)_transparent] [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-(--nonla-scrollbar-thumb) hover:[&::-webkit-scrollbar-thumb:hover]:bg-(--nonla-scrollbar-thumb-hover)">{left}</div>
        <div className="w-1/2 min-w-0 overflow-x-auto border-l border-border [scrollbar-color:transparent_transparent] hover:[scrollbar-color:var(--nonla-scrollbar-thumb)_transparent] [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-(--nonla-scrollbar-thumb) hover:[&::-webkit-scrollbar-thumb:hover]:bg-(--nonla-scrollbar-thumb-hover)">{right}</div>
      </div>,
    );
    left = [];
    right = [];
  };

  folded.forEach((entry, index) => {
    if (entry.type === "fold" && !open.has(entry.id)) {
      flush();
      chunks.push(<FoldButton key={`fold-${entry.id}`} count={entry.count} onClick={() => toggle(entry.id)} />);
      return;
    }
    const rows = entry.type === "fold" ? entry.items : [entry.item];
    rows.forEach((row, rowIndex) => {
      const key = `${index}-${rowIndex}-${row.left.oldNo ?? "x"}-${row.right.newNo ?? "x"}`;
      left.push(
        <div key={key} className={cn("flex min-h-5 w-max min-w-full", rowBg(row.left.kind))}>
          <SideCell line={row.left} num={row.left.oldNo} />
        </div>,
      );
      right.push(
        <div key={key} className={cn("flex min-h-5 w-max min-w-full", rowBg(row.right.kind))}>
          <SideCell line={row.right} num={row.right.newNo} />
        </div>,
      );
    });
  });
  flush();

  return (
    <OverlayScroll className="h-full bg-card">
      <div role="region" aria-label="Markdown diff" className="min-w-full">
        <div className="sticky top-0 z-20 grid grid-cols-2 border-b border-border bg-card text-xs font-medium text-muted-foreground">
          <div className="px-3 py-1.5">{originalLabel}</div>
          <div className="border-l border-border px-3 py-1.5">{modifiedLabel}</div>
        </div>
        {chunks}
      </div>
    </OverlayScroll>
  );
}
