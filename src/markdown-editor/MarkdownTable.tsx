import { type ReactNode, useCallback, useRef } from "react";
import { ButtonCopy } from "../button/ButtonCopy";

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

export function MarkdownTable({ children }: { children: ReactNode }) {
  const tableRef = useRef<HTMLTableElement>(null);

  const getText = useCallback(() => {
    const table = tableRef.current;
    return table ? tableToMarkdown(table) : "";
  }, []);

  return (
    <div className="relative my-(--md-table-my,16px) max-w-full overflow-hidden rounded-xl border border-border bg-card group">
      <ButtonCopy getText={getText} label="Copy as Markdown" className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100" />

      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className="w-max min-w-full border-separate border-spacing-0 text-(length:--md-table-size,15px) [&_th]:max-w-[360px] [&_td]:max-w-[360px] [&_th]:whitespace-normal [&_td]:whitespace-normal [&_th]:wrap-normal [&_td]:wrap-normal [&_th]:bg-muted [&_th]:font-semibold [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:align-top [&_th]:border-r [&_th]:border-b [&_th]:border-border [&_th:last-child]:border-r-0 [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:align-top [&_td]:bg-card [&_td]:border-r [&_td]:border-b [&_td]:border-border [&_td:last-child]:border-r-0 [&_tbody_tr:last-child_td]:border-b-0"
        >
          {children}
        </table>
      </div>
    </div>
  );
}
