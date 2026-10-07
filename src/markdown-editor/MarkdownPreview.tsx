import { type MouseEvent, useLayoutEffect, useRef } from "react";
import { cn } from "../lib/cn";
import { OverlayScroll } from "../scroll/OverlayScroll";
import { type MarkdownDoc, readInlineEdit, writeInlineEdit } from "./blocks";
import { BlockBody, headingClass, ListItem, markdownVariantStyle, spaceBefore } from "./MarkdownViewer";

function BlockEditor({ value, mono, className, caret = "end", onChange, onBlur, onEnter }: { value: string; mono?: boolean; className?: string; caret?: "start" | "end"; onChange: (value: string) => void; onBlur: () => void; onEnter?: (before: string, after: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const pos = caret === "start" ? 0 : el.value.length;
    el.setSelectionRange(pos, pos);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      data-md-editor="block"
      value={value}
      rows={1}
      spellCheck={!mono}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.currentTarget.blur();
          return;
        }
        if (event.key === "Enter" && onEnter && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault();
          const el = event.currentTarget;
          onEnter(value.slice(0, el.selectionStart), value.slice(el.selectionEnd));
          return;
        }
        if (event.key !== "Tab") return;
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
        });
      }}
      className={cn(
        "block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-(length:--md-body-size,16px) leading-(--md-body-leading,24px) text-(--md-ink) shadow-none outline-none ring-0 placeholder:text-placeholder focus:outline-none focus:ring-0",
        mono && "font-mono text-[13px] leading-5",
        className,
      )}
      aria-label="Edit markdown"
    />
  );
}

function interactiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest("a, button, textarea, input");
}

export type MarkdownPreviewProps = {
  doc: MarkdownDoc;
  editingIndex: number | null;
  readOnly?: boolean;
  placeholder?: string;
  onStartEdit: (index: number) => boolean;
  onEditMouseDown: (index: number, event: MouseEvent) => void;
  onChangeBody: (body: string) => void;
  onBlurBlock: () => void;
  onEnterList: (before: string, after: string) => void;
  /** Where the caret goes when an edit starts. */
  caret?: "start" | "end";
  onAppend: () => void;
};

export function MarkdownPreview({ doc, editingIndex, readOnly, placeholder = "Write markdown…", onStartEdit, onEditMouseDown, onChangeBody, onBlurBlock, onEnterList, caret = "end", onAppend }: MarkdownPreviewProps) {
  return (
    <OverlayScroll className="h-full bg-card">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-8 py-6" style={markdownVariantStyle("docs")}>
        {doc.blocks.map((block, index) => {
          const editing = editingIndex === index;
          const locked = block.kind === "mermaid" || readOnly;
          const view = block.kind === "text" ? readInlineEdit(block.body) : null;
          const editor =
            view?.kind === "heading" ? (
              <BlockEditor value={view.text} className={headingClass(view.level)} caret={caret} onChange={(text) => onChangeBody(writeInlineEdit(block.body, text))} onBlur={onBlurBlock} />
            ) : view?.kind === "list" ? (
              <ListItem view={view}>
                <BlockEditor value={view.text} caret={caret} onEnter={onEnterList} onChange={(text) => onChangeBody(writeInlineEdit(block.body, text))} onBlur={onBlurBlock} />
              </ListItem>
            ) : (
              <BlockEditor value={block.body} mono={block.kind === "code"} caret={caret} onChange={onChangeBody} onBlur={onBlurBlock} />
            );
          const gap = spaceBefore(block, doc.blocks[index - 1]);
          if (locked) {
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: block position is the edit identity
                key={`${index}:${block.kind}`}
                data-md-block={block.kind}
                className={cn("outline-none", gap)}
              >
                <BlockBody block={block} />
              </div>
            );
          }
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: block position is the edit identity
              key={`${index}:${block.kind}`}
              role="button"
              data-md-block={block.kind}
              tabIndex={0}
              className={cn("cursor-text outline-none", gap)}
              onMouseDown={(event) => onEditMouseDown(index, event)}
              onClick={(event) => {
                if (editing || interactiveTarget(event.target)) return;
                const selection = window.getSelection();
                if (selection && selection.toString().length > 0) return;
                onStartEdit(index);
              }}
              onKeyDown={(event) => {
                if (editing || event.key !== "Enter") return;
                event.preventDefault();
                onStartEdit(index);
              }}
            >
              {editing ? editor : <BlockBody block={block} />}
            </div>
          );
        })}
        {readOnly ? (
          doc.blocks.length === 0 ? <p className="m-0 text-sm text-placeholder">{placeholder}</p> : null
        ) : (
          <button type="button" className="mt-3 min-h-16 text-left text-sm text-placeholder" onClick={onAppend} aria-label="Add paragraph">
            {doc.blocks.length === 0 ? placeholder : ""}
          </button>
        )}
      </div>
    </OverlayScroll>
  );
}
