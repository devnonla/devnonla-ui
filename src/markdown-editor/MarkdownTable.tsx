import { type ReactNode, useCallback, useRef } from "react";
import { Button } from "../button/Button";
import { ButtonCopy } from "../button/ButtonCopy";
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
  "w-max min-w-full border-separate border-spacing-0 text-base [&_th]:whitespace-normal [&_td]:whitespace-normal [&_th]:wrap-normal [&_td]:wrap-normal [&_th]:border-b [&_th]:border-border-secondary [&_th]:px-4 [&_th]:py-1.5 [&_th]:text-left [&_th]:align-top [&_th]:font-medium [&_td]:border-b [&_td]:border-border-secondary [&_td]:px-4 [&_td]:py-1.5 [&_td]:align-top";

export function MarkdownTable({ children }: { children: ReactNode }) {
  const tableRef = useRef<HTMLTableElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const getText = useCallback(() => {
    const table = tableRef.current;
    return table ? tableToMarkdown(table) : "";
  }, []);

  const openFullscreen = () => {
    dialogRef.current?.showModal();
  };

  const closeFullscreen = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <div className="group relative my-(--md-table-my,16px) max-w-full">
        <div className="absolute top-1 right-1 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <ButtonCopy getText={getText} label="Copy as Markdown" />
          <Button size="small" icon={<Icon name="maximize" size={12} />} title="Fullscreen" aria-label="Fullscreen" onClick={openFullscreen} />
        </div>

        <OverlayScroll autoHeight visibility="hover" scope="table" innerClassName="overflow-x-auto">
          <table ref={tableRef} className={`${tableClass} [&_th]:max-w-[360px] [&_td]:max-w-[360px] [&_th:first-child]:pl-0 [&_th:last-child]:pr-0 [&_td:first-child]:pl-0 [&_td:last-child]:pr-0`}>
            {children}
          </table>
        </OverlayScroll>
      </div>

      <dialog
        ref={dialogRef}
        className="inset-2.5 m-0 h-auto w-auto max-h-none max-w-none overflow-hidden rounded-xl border border-foreground/25 bg-card p-0 shadow-xl backdrop:bg-black/40 open:flex open:flex-col"
        onKeyDown={(e) => {
          if (e.key !== "Escape") return;
          e.preventDefault();
          e.stopPropagation();
          closeFullscreen();
        }}
      >
        <div className="absolute top-5 right-5 z-50 flex items-center gap-1.5">
          <ButtonCopy getText={getText} label="Copy as Markdown" />
          <Button size="small" icon={<Icon name="minimize" size={12} />} title="Exit fullscreen" aria-label="Exit fullscreen" onClick={closeFullscreen} />
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-8">
          <table className={tableClass}>{children}</table>
        </div>
      </dialog>
    </>
  );
}
