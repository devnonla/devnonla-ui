import { type MouseEvent, useLayoutEffect, useRef } from "react";
import { cn } from "../lib/cn";
import { markdownParagraphClass } from "../lib/markdownScale";
import { OverlayScroll } from "../scroll/OverlayScroll";
import { type MarkdownDoc, readInlineEdit, writeInlineEdit } from "./blocks";
import { BlockBody, headingClass, isCustomFence, ListItem, type MarkdownComponents, markdownScaleStyle, RichText, spaceBefore } from "./MarkdownViewer";

function BlockEditor({
  value,
  mono,
  className,
  caret = "end",
  autoSize = true,
  onChange,
  onBlur,
  onEnter,
}: {
  value: string;
  mono?: boolean;
  className?: string;
  caret?: "start" | "end";
  /** When false, height comes from the layout sizer behind the field (list overlay). */
  autoSize?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onEnter?: (before: string, after: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const pos = caret === "start" ? 0 : el.value.length;
    el.setSelectionRange(pos, pos);
  }, []);

  useLayoutEffect(() => {
    if (!autoSize) return;
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, autoSize]);

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
        "block w-full resize-none overflow-hidden border-0 bg-transparent font-[inherit] text-foreground shadow-none outline-none ring-0 placeholder:text-quaternary-foreground focus:outline-none focus:ring-0",
        // Match rendered paragraph rhythm so the block does not jump when editing starts.
        mono ? "p-0 font-mono text-(length:--md-code-size,var(--nonla-mono-text-size)) leading-(--md-code-leading,calc(var(--nonla-mono-text-size)*1.6))" : markdownParagraphClass,
        !autoSize && "h-full",
        className,
      )}
      aria-label="Edit markdown"
    />
  );
}

function interactiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest("a, button, textarea, input");
}

/** Soft pad behind the active block. Pseudo-element keeps layout from shifting. */
const editingSurfaceClass =
  "relative z-0 before:pointer-events-none before:absolute before:-inset-x-2 before:-inset-y-0.5 before:-z-10 before:rounded-md before:bg-ink-hover before:content-['']";

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
  /** Fence language → component. Same map as `MarkdownViewer`. */
  components?: MarkdownComponents;
};

export function MarkdownPreview({ doc, editingIndex, readOnly, placeholder = "Write markdown…", onStartEdit, onEditMouseDown, onChangeBody, onBlurBlock, onEnterList, caret = "end", onAppend, components }: MarkdownPreviewProps) {
  return (
    <OverlayScroll className="h-full bg-card">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-8 py-6" style={markdownScaleStyle}>
        {doc.blocks.map((block, index) => {
          const editing = editingIndex === index;
          const locked = block.kind === "mermaid" || (block.kind === "code" && isCustomFence(block.body, components)) || readOnly;
          const view = block.kind === "text" ? readInlineEdit(block.body) : null;
          const gap = spaceBefore(block, doc.blocks[index - 1]);
          if (locked) {
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: block position is the edit identity
                key={`${index}:${block.kind}`}
                data-md-block={block.kind}
                className={cn("outline-none", gap)}
              >
                <BlockBody block={block} components={components} />
              </div>
            );
          }
          // List keeps the rendered row as a sizer so the bullet and neighbors do not shift on edit.
          if (view?.kind === "list") {
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: block position is the edit identity
                key={`${index}:${block.kind}`}
                role="button"
                data-md-block={block.kind}
                tabIndex={0}
                className={cn("cursor-text outline-none", gap, editing && editingSurfaceClass)}
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
                <ListItem view={view}>
                  <div className="relative">
                    <div className={cn(editing && "invisible")} aria-hidden={editing || undefined}>
                      <RichText source={view.text} />
                    </div>
                    {editing ? (
                      <BlockEditor
                        value={view.text}
                        autoSize={false}
                        className="absolute inset-0"
                        caret={caret}
                        onEnter={onEnterList}
                        onChange={(text) => onChangeBody(writeInlineEdit(block.body, text))}
                        onBlur={onBlurBlock}
                      />
                    ) : null}
                  </div>
                </ListItem>
              </div>
            );
          }
          const editor =
            view?.kind === "heading" ? (
              <BlockEditor value={view.text} className={headingClass(view.level)} caret={caret} onChange={(text) => onChangeBody(writeInlineEdit(block.body, text))} onBlur={onBlurBlock} />
            ) : (
              <BlockEditor value={block.body} mono={block.kind === "code"} caret={caret} onChange={onChangeBody} onBlur={onBlurBlock} />
            );
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: block position is the edit identity
              key={`${index}:${block.kind}`}
              role="button"
              data-md-block={block.kind}
              tabIndex={0}
              className={cn("cursor-text outline-none", gap, editing && editingSurfaceClass)}
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
              {editing ? editor : <BlockBody block={block} components={components} />}
            </div>
          );
        })}
        {readOnly ? (
          doc.blocks.length === 0 ? <p className="m-0 text-sm text-quaternary-foreground">{placeholder}</p> : null
        ) : (
          <button type="button" className="mt-3 min-h-16 text-left text-sm text-quaternary-foreground" onClick={onAppend} aria-label="Add paragraph">
            {doc.blocks.length === 0 ? placeholder : ""}
          </button>
        )}
      </div>
    </OverlayScroll>
  );
}
