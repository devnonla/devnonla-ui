import { useState } from "react";
import { cn } from "../lib/cn";
import { OverlayScroll } from "../scroll/OverlayScroll";

const LINE = 20;
const PAD = 8;

export type MarkdownSourceProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
};

/** Full-file text editor with a line gutter, in the style of a light Monaco buffer. */
export function MarkdownSource({ value, onChange, readOnly, placeholder = "Write markdown…" }: MarkdownSourceProps) {
  const [cursor, setCursor] = useState(0);
  const lines = value.split("\n");
  const active = value.slice(0, cursor).split("\n").length - 1;
  const longest = lines.reduce((max, line) => Math.max(max, line.length), 0);

  const remember = (el: HTMLTextAreaElement) => setCursor(el.selectionStart);

  return (
    <OverlayScroll className="h-full bg-card" innerClassName="overflow-x-auto">
      <div className="relative flex min-h-full" style={{ width: `max(100%, calc(3.5rem + ${longest + 2}ch))` }}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bg-ink-hover" style={{ top: PAD + active * LINE, height: LINE }} />
        <div className="sticky left-0 z-20 w-12 shrink-0 select-none pt-2 text-right font-mono text-[12px] leading-5 text-quaternary-foreground">
          {lines.map((_, index) => (
            // Line number is the row identity.
            // biome-ignore lint/suspicious/noArrayIndexKey: gutter row is the line number
            <div key={index} className={cn("h-5 pr-3", index === active && "text-muted-foreground")}>
              {index + 1}
            </div>
          ))}
        </div>
        <textarea
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          wrap="off"
          aria-label="Markdown source"
          onChange={(event) => {
            onChange(event.target.value);
            remember(event.currentTarget);
          }}
          onClick={(event) => remember(event.currentTarget)}
          onKeyUp={(event) => remember(event.currentTarget)}
          onSelect={(event) => remember(event.currentTarget)}
          onKeyDown={(event) => {
            if (readOnly || event.key !== "Tab") return;
            event.preventDefault();
            const el = event.currentTarget;
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const next = `${value.slice(0, start)}  ${value.slice(end)}`;
            onChange(next);
            const pos = start + 2;
            requestAnimationFrame(() => {
              el.selectionStart = pos;
              el.selectionEnd = pos;
              setCursor(pos);
            });
          }}
          className="relative z-10 block w-full resize-none overflow-hidden bg-transparent py-2 pr-4 font-mono text-[13px] leading-5 text-foreground outline-none placeholder:text-placeholder"
          style={{ height: Math.max(lines.length, 1) * LINE + PAD * 2 }}
        />
      </div>
    </OverlayScroll>
  );
}
