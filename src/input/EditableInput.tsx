import { Pencil } from "lucide-react";
import { type CSSProperties, cloneElement, isValidElement, type KeyboardEvent, type ReactElement, type ReactNode, type Ref, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePopupContainer } from "../app/context";
import { Button } from "../button/Button";
import { cn } from "../lib/cn";
import { type CanonicalSize, type ControlSize, controlHeightVar, controlRadiusVar, getSizeTokens, useControlSize } from "../lib/sizes";
import { message } from "../message/message";

const POPUP_PAD: Record<CanonicalSize, number> = { small: 12, default: 16, large: 20 };
const FIELD_INSET: Record<CanonicalSize, string> = { small: "-4px", default: "-6px", large: "-8px" };
const MULTILINE_MIN: Record<CanonicalSize, number> = { small: 56, default: 72, large: 96 };
const GLASS_BORDER = 1;

const fieldClass = (saving: boolean) => cn("relative z-1 m-0 w-full border-0 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none", saving && "opacity-60");

type Lock = {
  top: number;
  left: number;
  width: number;
  height: number;
  padTop: number;
  padBottom: number;
  font: string;
  letterSpacing: string;
  color: string;
};

function glyphEl(el: HTMLElement): HTMLElement {
  let node = el;
  while (node.childElementCount === 1 && node.firstElementChild instanceof HTMLElement) {
    node = node.firstElementChild;
  }
  return node;
}

function containingOffset(container: HTMLElement) {
  const cs = getComputedStyle(container);
  const fixedContaining = cs.transform !== "none" || cs.perspective !== "none" || cs.filter !== "none" || cs.backdropFilter !== "none" || cs.willChange.includes("transform");
  if (!fixedContaining) return { top: 0, left: 0 };
  const r = container.getBoundingClientRect();
  return { top: r.top, left: r.left };
}

function readLock(textEl: HTMLElement, rowEl: HTMLElement, minWidth: number | undefined): Lock {
  const glyph = glyphEl(textEl);
  const g = glyph.getBoundingClientRect();
  const row = rowEl.getBoundingClientRect();
  const cs = getComputedStyle(glyph);
  const width = Math.max(g.width, row.right - g.left, minWidth ?? 0);
  return {
    top: row.top,
    left: g.left,
    width,
    height: row.height,
    padTop: g.top - row.top,
    padBottom: row.bottom - g.bottom,
    font: cs.font,
    letterSpacing: cs.letterSpacing,
    color: cs.color,
  };
}

function EditorPopover({
  textRef,
  rowRef,
  inputRef,
  size,
  multiline,
  minWidth,
  saving,
  saveDisabled,
  selectOnFocus,
  onSave,
  onCancel,
  children,
}: {
  textRef: Ref<HTMLDivElement>;
  rowRef: Ref<HTMLDivElement>;
  inputRef: { current: HTMLInputElement | HTMLTextAreaElement | null };
  size: CanonicalSize;
  multiline: boolean;
  minWidth?: number;
  saving: boolean;
  saveDisabled?: boolean;
  selectOnFocus?: boolean;
  onSave: () => void;
  onCancel: () => void;
  children: ReactElement<{ className?: string; style?: CSSProperties; ref?: Ref<HTMLInputElement | HTMLTextAreaElement> }>;
}) {
  const getContainer = usePopupContainer();
  const [lock, setLock] = useState<Lock | null>(null);
  const [correction, setCorrection] = useState({ x: 0, y: 0 });
  const attempts = useRef(0);

  useLayoutEffect(() => {
    const text = typeof textRef === "object" && textRef ? textRef.current : null;
    const row = typeof rowRef === "object" && rowRef ? rowRef.current : null;
    if (!text || !row) return;
    const sync = () => setLock((prev) => {
      const next = readLock(text, row, minWidth);
      if (
        prev &&
        Math.abs(prev.top - next.top) < 0.25 &&
        Math.abs(prev.left - next.left) < 0.25 &&
        Math.abs(prev.width - next.width) < 0.25 &&
        Math.abs(prev.height - next.height) < 0.25 &&
        Math.abs(prev.padTop - next.padTop) < 0.25 &&
        Math.abs(prev.padBottom - next.padBottom) < 0.25 &&
        prev.font === next.font &&
        prev.letterSpacing === next.letterSpacing &&
        prev.color === next.color
      ) {
        return prev;
      }
      return next;
    });
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(text);
    ro.observe(row);
    window.addEventListener("scroll", sync, true);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", sync, true);
      window.removeEventListener("resize", sync);
    };
  }, [textRef, rowRef, minWidth]);

  useLayoutEffect(() => {
    attempts.current = 0;
  }, [lock?.top, lock?.left, lock?.padTop]);

  useLayoutEffect(() => {
    const text = typeof textRef === "object" && textRef ? textRef.current : null;
    const input = inputRef.current;
    if (!lock || !text || !input) return;
    const g = glyphEl(text).getBoundingClientRect();
    const box = input.getBoundingClientRect();
    const cs = getComputedStyle(input);
    const dx = g.left - (box.left + parseFloat(cs.paddingLeft));
    const dy = g.top - (box.top + parseFloat(cs.paddingTop));
    if (Math.abs(dx) < 0.25 && Math.abs(dy) < 0.25) {
      attempts.current = 0;
      return;
    }
    if (attempts.current >= 3) return;
    attempts.current += 1;
    setCorrection((current) => ({ x: current.x + dx, y: current.y + dy }));
  }, [lock, textRef, inputRef, correction]);

  useEffect(() => {
    if (!lock) return;
    const timer = setTimeout(() => {
      const el = inputRef.current;
      el?.focus();
      if (selectOnFocus && el instanceof HTMLInputElement) el.select();
    }, 0);
    return () => clearTimeout(timer);
  }, [lock != null, selectOnFocus, inputRef]);

  if (!lock || !isValidElement(children)) return null;

  const pad = POPUP_PAD[size];
  const container = getContainer();
  const origin = containingOffset(container);
  const field = cloneElement(children, {
    ref: inputRef,
    style: {
      ...children.props.style,
      boxSizing: "border-box",
      width: "100%",
      height: multiline ? undefined : lock.height,
      minHeight: multiline ? Math.max(MULTILINE_MIN[size], lock.height) : undefined,
      margin: 0,
      border: 0,
      paddingTop: lock.padTop,
      paddingRight: 0,
      paddingBottom: multiline ? 8 : lock.padBottom,
      paddingLeft: 0,
      font: lock.font,
      letterSpacing: lock.letterSpacing,
      color: lock.color,
    },
  });

  return createPortal(
    <div
      className="nonla-popup-layer nonla-glass outline-none"
      style={{
        position: "fixed",
        zIndex: "var(--nonla-z-popup, 1050)",
        borderRadius: 10,
        top: lock.top - origin.top - pad - GLASS_BORDER + correction.y,
        left: lock.left - origin.left - pad - GLASS_BORDER + correction.x,
        width: lock.width + (pad + GLASS_BORDER) * 2,
        padding: pad,
      }}
    >
      <div className="relative">
        <span aria-hidden className="pointer-events-none absolute top-0 bottom-0" style={{ left: FIELD_INSET[size], right: FIELD_INSET[size], borderRadius: controlRadiusVar(size), background: "color-mix(in srgb, var(--foreground) 6%, transparent)" }} />
        {field}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button type="primary" size="small" loading={saving} disabled={saveDisabled} onClick={onSave}>
          Save
        </Button>
        <Button type="text" size="small" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>,
    container,
  );
}

function EditButton({ label, size, onClick }: { label: string; size: CanonicalSize; onClick: () => void }) {
  const tok = getSizeTokens(size);
  const box = tok.icon + 8;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover/edit:opacity-100 focus-visible:opacity-100"
      style={{ width: box, height: box }}
    >
      <Pencil size={tok.icon} />
    </button>
  );
}

export type EditableInputProps = {
  display: ReactNode;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  initialValue: string;
  placeholder?: string;
  type?: "text" | "password" | "textarea";
  editLabel?: string;
  minWidth?: number;
  size?: ControlSize;
  /** Datatable cells may be cleared. KV/secrets stay required. */
  allowEmpty?: boolean;
  onSave: (value: string) => Promise<void>;
};

const KEY_RE = /^[A-Z][A-Z0-9_]*$/;

export type EditableKeyProps = {
  value: string;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (key: string) => Promise<void>;
  placeholder?: string;
  editLabel?: string;
  size?: ControlSize;
};

function EditableKey({ value, editing, onStartEdit, onCancelEdit, onSave, placeholder = "VARIABLE_NAME", editLabel = "Edit key", size }: EditableKeyProps) {
  const resolved = useControlSize(size);
  const tok = getSizeTokens(resolved);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;
    setDraft(value);
  }, [editing, value]);

  const handleCancel = () => {
    setDraft(value);
    onCancelEdit();
  };

  const handleSave = async () => {
    const next = draft.trim().toUpperCase();
    if (!next) {
      message.error("Key is required");
      return;
    }
    if (!KEY_RE.test(next)) {
      message.error("Key must match [A-Z][A-Z0-9_]* (e.g. API_TOKEN)");
      return;
    }
    if (next === value) {
      onCancelEdit();
      return;
    }
    setSaving(true);
    try {
      await onSave(next);
      onCancelEdit();
    } catch {
      // Caller shows the error; keep the draft open.
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div ref={rowRef} className="flex w-full min-w-0 items-center" style={{ minHeight: controlHeightVar(resolved) }}>
      <div className="group/edit inline-flex max-w-full items-center gap-1">
        <div ref={textRef} className={cn("min-w-0", editing && "invisible")} style={{ fontSize: tok.fontSize, lineHeight: `${tok.lineHeight}px`, minHeight: tok.lineHeight }}>
          <code className="select-text font-mono font-semibold tracking-wide text-foreground">{value}</code>
        </div>
        {editing ? null : <EditButton label={editLabel} size={resolved} onClick={onStartEdit} />}
      </div>
      {editing ? (
        <EditorPopover textRef={textRef} rowRef={rowRef} inputRef={inputRef} size={resolved} multiline={false} saving={saving} selectOnFocus onSave={() => void handleSave()} onCancel={handleCancel}>
          <input type="text" value={draft} onChange={(e) => setDraft(e.target.value.toUpperCase())} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={saving} className={fieldClass(saving)} />
        </EditorPopover>
      ) : null}
    </div>
  );
}

function EditableInputRoot({ display, editing, onStartEdit, onCancelEdit, initialValue, placeholder, type = "text", editLabel = "Edit value", minWidth, size, allowEmpty = false, onSave }: EditableInputProps) {
  const resolved = useControlSize(size);
  const tok = getSizeTokens(resolved);
  const [draft, setDraft] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const multiline = type === "textarea";

  useEffect(() => {
    if (!editing) return;
    setDraft(initialValue);
  }, [editing, initialValue]);

  const handleCancel = () => {
    setDraft(initialValue);
    onCancelEdit();
  };

  const handleSave = async () => {
    if (!allowEmpty && !draft) {
      message.error("Value is required");
      return;
    }
    if (draft === initialValue) {
      onCancelEdit();
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
      onCancelEdit();
    } catch {
      // Caller shows the error; keep the draft open.
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
      return;
    }
    if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSave();
    }
  };

  const field = multiline ? (
    <textarea value={draft} rows={3} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={saving} className={fieldClass(saving)} />
  ) : (
    <input type={type} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={saving} className={fieldClass(saving)} />
  );

  return (
    <div ref={rowRef} className="group/edit flex w-full min-w-0 items-center" style={{ minHeight: controlHeightVar(resolved) }}>
      <div ref={textRef} className={cn("min-w-0 truncate", editing && "invisible")} style={{ fontSize: tok.fontSize, lineHeight: `${tok.lineHeight}px`, minHeight: tok.lineHeight }}>
        {display}
      </div>
      {editing ? null : <EditButton label={editLabel} size={resolved} onClick={onStartEdit} />}
      {editing ? (
        <EditorPopover textRef={textRef} rowRef={rowRef} inputRef={inputRef} size={resolved} multiline={multiline} minWidth={minWidth} saving={saving} saveDisabled={!allowEmpty && !draft} onSave={() => void handleSave()} onCancel={handleCancel}>
          {field}
        </EditorPopover>
      ) : null}
    </div>
  );
}

export const EditableInput = Object.assign(EditableInputRoot, { Key: EditableKey });
