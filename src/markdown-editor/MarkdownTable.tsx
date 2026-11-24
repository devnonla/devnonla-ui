import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { OverlayScroll } from "../scroll/OverlayScroll";

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n+/g, "").trim();
}

function tableToMarkdown(table: HTMLTableElement): string {
  const rows = Array.from(table.querySelectorAll("tr"));
  const data = rows.map((tr) => Array.from(tr.querySelectorAll("th, td")).map((cell) => escapeCell(cell.textContent ?? "")));
  if (data.length === 0) return "";

  const colCount = Math.max(...data.map((row) => row.length));
  const pad = (row: string[]) => Array.from({ length: colCount }, (_, i) => row[i] ?? "");

  const header = pad(data[0]!);
  const separator = header.map(() => "---");
  const body = data.slice(1).map(pad);

  return [`| ${header.join(" | ")} |`, `| ${separator.join(" | ")} |`, ...body.map((row) => `| ${row.join(" | ")} |`)].join("\n");
}

const tableClass =
  "w-max min-w-full border-separate border-spacing-0 text-sm [&_th]:whitespace-normal [&_td]:whitespace-normal [&_th]:wrap-normal [&_td]:wrap-normal [&_th]:border-b [&_th]:border-border-secondary [&_th]:px-4 [&_th]:py-1.5 [&_th]:text-left [&_th]:align-top [&_th]:font-medium [&_td]:border-b [&_td]:border-border-secondary/60 [&_tr:last-child_td]:border-b-0 [&_td]:px-4 [&_td]:py-1.5 [&_td]:align-top";

export function MarkdownTable({ children }: { children: ReactNode }) {
  const tableRef = useRef<HTMLTableElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const getText = useCallback(() => {
    const table = tableRef.current;
    return table ? tableToMarkdown(table) : "";
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copyMarkdown = async () => {
    const value = getText();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      /* ignore */
    }
  };

  const openFullscreen = () => {
    dialogRef.current?.showModal();
  };

  const closeFullscreen = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <div className="group relative my-(--md-table-my,16px) max-w-full">
        {/* Actions sit on a page-colored strip the height of the header row, faded on the left, so header text under them is hidden cleanly instead of peeking between the buttons. */}
        <div className="absolute top-0 right-0 z-10 flex items-center gap-1 bg-linear-to-r from-transparent to-background to-[16px] py-1 pr-1 pl-4 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Button size="small" className="bg-background" icon={<Icon name={copied ? "check" : "copy"} size={12} />} title={copied ? "Copied" : "Copy as Markdown"} aria-label={copied ? "Copied" : "Copy as Markdown"} onClick={copyMarkdown} />
          <Button size="small" className="bg-background" icon={<Icon name="maximize" size={12} />} title="Fullscreen" aria-label="Fullscreen" onClick={openFullscreen} />
        </div>

        {/* Bottom padding only while the horizontal thumb shows, so it never covers the last row. */}
        <OverlayScroll autoHeight visibility="hover" scope="table" innerClassName="overflow-x-auto group-data-overflow-x/table:pb-2">
          {/* The last header cell reserves room for the actions, so a table that fits never has its header covered. */}
          <table ref={tableRef} className={`${tableClass} [&_th:first-child]:pl-0 [&_td:first-child]:pl-0 [&_th:last-child]:pr-18 [&_th]:max-w-[360px] [&_td]:max-w-[360px]`}>
            {children}
          </table>
        </OverlayScroll>
      </div>

      <dialog
        ref={dialogRef}
        className="inset-2.5 m-0 h-auto w-auto max-h-none max-w-none overflow-hidden rounded-xl border border-border bg-card p-0 shadow-(--nonla-shadow) backdrop:bg-black/40 open:flex open:flex-col"
        onKeyDown={(e) => {
          if (e.key !== "Escape") return;
          e.preventDefault();
          e.stopPropagation();
          closeFullscreen();
        }}
      >
        <div className="absolute top-5 right-5 z-10 flex items-center gap-1">
          <Button size="small" className="bg-background" icon={<Icon name={copied ? "check" : "copy"} size={12} />} title={copied ? "Copied" : "Copy as Markdown"} aria-label={copied ? "Copied" : "Copy as Markdown"} onClick={copyMarkdown} />
          <Button size="small" className="bg-background" icon={<Icon name="minimize" size={12} />} title="Exit fullscreen" aria-label="Exit fullscreen" onClick={closeFullscreen} />
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-8">
          <table className={tableClass}>{children}</table>
        </div>
      </dialog>
    </>
  );
}
