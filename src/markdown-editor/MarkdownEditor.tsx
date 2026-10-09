import { type CSSProperties, type MouseEvent, type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { Icon } from "../icon/Icon";
import { cn } from "../lib/cn";
import { Segmented } from "../segmented/Segmented";
import { appendTextBlock, cleanupDoc, joinMarkdownDoc, type MarkdownDoc, parseMarkdownDoc, readInlineEdit, splitListItem } from "./blocks";
import { diffMarkdown } from "./diff";
import { MarkdownDiff, type MarkdownDiffLayout } from "./MarkdownDiff";
import { MarkdownPreview } from "./MarkdownPreview";
import { MarkdownSource } from "./MarkdownSource";

export type MarkdownEditorMode = "preview" | "edit" | "diff";
export type { MarkdownDiffLayout };

export type MarkdownEditorProps = {
  /** Current markdown. In diff mode this is the modified version. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Earlier version. Enables the Diff view. */
  original?: string;
  mode?: MarkdownEditorMode;
  defaultMode?: MarkdownEditorMode;
  onModeChange?: (mode: MarkdownEditorMode) => void;
  /** Monaco-style layout. Side by side is the default. */
  diffLayout?: MarkdownDiffLayout;
  defaultDiffLayout?: MarkdownDiffLayout;
  onDiffLayoutChange?: (layout: MarkdownDiffLayout) => void;
  readOnly?: boolean;
  placeholder?: string;
  title?: ReactNode;
  originalLabel?: ReactNode;
  modifiedLabel?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

type EditSession = {
  index: number;
  doc: MarkdownDoc;
  /** Restored on blur when an appended paragraph is still empty. */
  revert?: string;
  caret?: "start" | "end";
};

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void): [T, (next: T) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : uncontrolled;
  const set = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [current, set];
}

/**
 * Markdown editor in the style of Cursor's document editor.
 *
 * Preview renders the document. Click a heading, list item, or paragraph to edit that text in place.
 * Mermaid fences render as diagrams and stay view only.
 * Edit is the full-file text buffer. Diff compares `original` and `value` like Monaco.
 * `readOnly` locks editing and hides the mode switcher.
 * A finished document with no editor chrome uses `MarkdownViewer`.
 */
export function MarkdownEditor({
  value: valueProp,
  defaultValue = "",
  onChange,
  original,
  mode: modeProp,
  defaultMode = "preview",
  onModeChange,
  diffLayout: layoutProp,
  defaultDiffLayout = "side-by-side",
  onDiffLayoutChange,
  readOnly = false,
  placeholder = "Write markdown…",
  title,
  originalLabel = "Original",
  modifiedLabel = "Modified",
  className,
  style,
}: MarkdownEditorProps) {
  const [value, setValue] = useControllable(valueProp, defaultValue, onChange);
  const [mode, setMode] = useControllable(modeProp, defaultMode, onModeChange);
  const [layout, setLayout] = useControllable(layoutProp, defaultDiffLayout, onDiffLayoutChange);
  const [session, setSession] = useState<EditSession | null>(null);

  const sessionRef = useRef<EditSession | null>(session);
  sessionRef.current = session;
  const valueRef = useRef(value);
  const seenProp = useRef(value);
  const switching = useRef(false);

  let live = session;
  if (value !== seenProp.current) {
    seenProp.current = value;
    const current = sessionRef.current;
    const same = current ? joinMarkdownDoc(current.doc) === value : false;
    if (current && !same) {
      live = null;
      sessionRef.current = null;
      setSession(null);
    }
    valueRef.current = value;
  }

  const emit = useCallback(
    (next: string) => {
      if (next === valueRef.current) return;
      valueRef.current = next;
      setValue(next);
    },
    [setValue],
  );

  const currentDoc = (): MarkdownDoc => {
    const current = sessionRef.current;
    if (!current) return parseMarkdownDoc(valueRef.current);
    const block = current.doc.blocks[current.index];
    if (current.revert !== undefined && block?.kind === "text" && block.body.trim() === "") return parseMarkdownDoc(current.revert);
    return current.doc;
  };

  const startEdit = (index: number): boolean => {
    if (readOnly || mode !== "preview") return false;
    const doc = currentDoc();
    const block = doc.blocks[index];
    if (!block || block.kind === "mermaid") return false;
    const next: EditSession = { index, doc };
    sessionRef.current = next;
    setSession(next);
    const joined = joinMarkdownDoc(doc);
    if (joined !== valueRef.current) emit(joined);
    return true;
  };

  const updateBody = (body: string) => {
    const current = sessionRef.current;
    if (!current) return;
    const blocks = current.doc.blocks.map((block, index) => (index === current.index ? { ...block, body } : block));
    const next: EditSession = { ...current, doc: { ...current.doc, blocks } };
    sessionRef.current = next;
    setSession(next);
    emit(joinMarkdownDoc(next.doc));
  };

  const commit = () => {
    const current = sessionRef.current;
    if (!current) return;
    const block = current.doc.blocks[current.index];
    sessionRef.current = null;
    setSession(null);
    if (current.revert !== undefined && block?.kind === "text" && block.body.trim() === "") {
      emit(current.revert);
      return;
    }
    const next = joinMarkdownDoc(cleanupDoc(current.doc));
    if (next !== valueRef.current) emit(next);
  };

  const enterList = (before: string, after: string) => {
    const current = sessionRef.current;
    if (!current) return;
    const block = current.doc.blocks[current.index];
    if (!block) return;
    const view = readInlineEdit(block.body);
    if (view.kind !== "list") return;
    switching.current = true;
    if (before.trim() === "" && after.trim() === "") {
      const blocks = current.doc.blocks.slice();
      blocks[current.index] = { ...block, body: "" };
      const next: EditSession = { ...current, doc: { ...current.doc, blocks }, caret: "start" };
      sessionRef.current = next;
      setSession(next);
      emit(joinMarkdownDoc(next.doc));
      return;
    }
    const split = splitListItem(current.doc, current.index, before, after);
    if (!split) {
      switching.current = false;
      return;
    }
    const next: EditSession = { index: split.index, doc: split.doc, revert: current.revert, caret: "start" };
    sessionRef.current = next;
    setSession(next);
    emit(joinMarkdownDoc(split.doc));
  };

  const onBlurBlock = () => {
    if (switching.current) {
      switching.current = false;
      return;
    }
    commit();
  };

  const onEditMouseDown = (index: number, event: MouseEvent) => {
    const current = sessionRef.current;
    if (!current || current.index === index) return;
    if (event.target instanceof Element && event.target.closest("a, button, textarea, input")) return;
    const block = current.doc.blocks[index];
    if (!block || block.kind === "mermaid") return;
    event.preventDefault();
    if (startEdit(index)) switching.current = true;
  };

  const append = () => {
    if (readOnly) return;
    const current = sessionRef.current;
    if (current) {
      const block = current.doc.blocks[current.index];
      if (block?.kind === "text" && block.body.trim() === "" && current.index === current.doc.blocks.length - 1) return;
    }
    const base = currentDoc();
    const doc = appendTextBlock(base);
    const next: EditSession = { index: doc.blocks.length - 1, doc, revert: joinMarkdownDoc(base) };
    sessionRef.current = next;
    setSession(next);
    emit(joinMarkdownDoc(doc));
  };

  const changeMode = (next: MarkdownEditorMode) => {
    if (next === "diff" && original === undefined) return;
    commit();
    setMode(next);
  };

  const doc = live?.doc ?? parseMarkdownDoc(valueRef.current);
  const model = useMemo(() => (mode === "diff" && original !== undefined ? diffMarkdown(original, value) : null), [mode, original, value]);
  const showModes = !readOnly;
  const showHeader = Boolean(title) || showModes || model !== null;

  return (
    <div role="region" className={cn("nonla-markdown-editor flex h-full min-h-96 flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground", className)} style={style} aria-label={typeof title === "string" ? title : "Markdown editor"}>
      {showHeader ? (
        <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-border px-2">
          <div className="min-w-0 truncate px-1 text-sm font-medium">{title}</div>
          <div className="flex shrink-0 items-center gap-2">
            {model ? (
              <span className="font-mono text-xs">
                {model.added === 0 && model.removed === 0 ? (
                  <span className="text-muted-foreground">No changes</span>
                ) : (
                  <>
                    <span className="text-success">+{model.added}</span> <span className="text-destructive">−{model.removed}</span>
                  </>
                )}
              </span>
            ) : null}
            {mode === "diff" && original !== undefined ? (
              <Segmented
                size="small"
                value={layout}
                onChange={setLayout}
                options={[
                  { label: "Inline", value: "inline" },
                  { label: "Split", value: "side-by-side" },
                ]}
              />
            ) : null}
            {showModes ? (
              <Segmented
                size="small"
                value={mode}
                onChange={changeMode}
                options={[
                  { label: "Preview", value: "preview", icon: <Icon name="eye" size={14} /> },
                  { label: "Edit", value: "edit", icon: <Icon name="pen" size={14} /> },
                  { label: "Diff", value: "diff", icon: <Icon name="transfer" size={14} />, disabled: original === undefined },
                ]}
              />
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="min-h-0 flex-1">
        {mode === "edit" ? <MarkdownSource value={value} onChange={emit} readOnly={readOnly} placeholder={placeholder} /> : null}
        {mode === "preview" ? (
          <MarkdownPreview
            doc={doc}
            editingIndex={live?.index ?? null}
            readOnly={readOnly}
            placeholder={placeholder}
            onStartEdit={startEdit}
            onEditMouseDown={onEditMouseDown}
            onChangeBody={updateBody}
            onBlurBlock={onBlurBlock}
            onEnterList={enterList}
            caret={live?.caret}
            onAppend={append}
          />
        ) : null}
        {mode === "diff" && model ? <MarkdownDiff model={model} layout={layout} originalLabel={originalLabel} modifiedLabel={modifiedLabel} /> : null}
        {mode === "diff" && !model ? <p className="px-4 py-6 text-sm text-muted-foreground">Pass original to compare two versions.</p> : null}
      </div>
    </div>
  );
}
