import { memo, type ReactNode, type Ref, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../../icon/Icon";
import { cn } from "../../lib/cn";
import { glassOverlayClass, glassSurfaceClass } from "../../lib/surface";
import { ChatSuggestProvider, type ChatTrigger, chatTokenAt } from "./ChatSuggestions";
import { type ComposerCaret, type ComposerPart, emptyComposer, insertChipAt, insertCommandAt, insertTextAt, isComposerEmpty, normalizeParts, removeCommandPart, serializeComposer } from "./commandChips";

/** A chip the app adds from code, e.g. a text selection used as context. */
export type ChatChip = {
  /** Text shown inside the chip. Keep it short, e.g. `notes.md:L1-L4`. */
  label: string;
  /** Token sent in the message, e.g. `@selection-1`. No spaces. */
  value: string;
  /** Full text shown in the native tooltip on hover, e.g. the whole selection. */
  title?: string;
  /** Chip background as hex, e.g. `#6366f1`. Defaults to neutral gray `#71717a`. */
  color?: string;
};

/** Imperative handle for `ChatInput`. Pass it with `inputRef`. */
export type ChatInputHandle = {
  /** Insert a chip at the caret, or where the caret last was. Focuses the composer. */
  insertChip: (chip: ChatChip) => void;
  /** Move focus into the composer. */
  focus: () => void;
  /** Empty the composer. */
  clear: () => void;
};

export type ChatInputProps = {
  /** Imperative handle, e.g. to insert a chip from a text selection. */
  inputRef?: Ref<ChatInputHandle>;
  generating?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onSend: (text: string) => void;
  onCancel?: () => void;
  /** Clear conversation / start a new chat. */
  onClear?: () => void;
  /** Left-side toolbar (model picker, tools, …). */
  toolbar?: ReactNode;
  /** Markers that open a menu, e.g. `/` for commands and `@` for mentions. Each menu gets `useChatSuggest` for the live query. */
  triggers?: ChatTrigger[];
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
  /** When this changes (e.g. conversation id), clear + focus the input. */
  focusSignal?: string | null;
  /** Redirect bare keypresses into this input when focus is elsewhere. */
  enableTypeToFocus?: boolean;
};

function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable) return true;
  return Boolean(el.closest("input, textarea, select, [contenteditable], [role='dialog'], [role='alertdialog'], [role='listbox'], [role='menu'], .monaco-editor"));
}

function readComposer(root: HTMLElement): { parts: ComposerPart[]; caret: ComposerCaret } {
  const sel = window.getSelection();
  const drafts: ComposerPart[] = [];
  let caretIndex = 0;
  let caretOffset = 0;
  let sawCaret = false;

  const mark = (index: number, offset: number) => {
    if (sawCaret) return;
    caretIndex = index;
    caretOffset = offset;
    sawCaret = true;
  };

  const appendText = (value: string, node: Node | null) => {
    const text = value.replace(/\u200b/g, "");
    const last = drafts[drafts.length - 1];
    let index: number;
    let base: number;
    if (last?.type === "text") {
      base = last.value.length;
      last.value += text;
      index = drafts.length - 1;
    } else {
      base = 0;
      drafts.push({ type: "text", id: "tmp", value: text });
      index = drafts.length - 1;
    }
    if (node && sel?.anchorNode === node) {
      const raw = (node.textContent ?? "").slice(0, sel.anchorOffset).replace(/\u200b/g, "");
      mark(index, base + raw.length);
    }
  };

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      appendText(node.textContent ?? "", node);
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (node.dataset.command) {
      drafts.push({
        type: "command",
        id: node.dataset.seg || `cmd-${drafts.length}`,
        label: node.dataset.label || node.dataset.command,
        value: node.dataset.command,
        title: node.dataset.title || undefined,
        color: node.dataset.color || undefined,
      });
      if (sel?.anchorNode && node.contains(sel.anchorNode)) {
        drafts.push({ type: "text", id: "tmp", value: "" });
        mark(drafts.length - 1, 0);
      }
      return;
    }
    if (node.tagName === "BR") {
      appendText("\n", node);
      return;
    }
    if (node.childNodes.length === 0) {
      appendText("", sel?.anchorNode === node ? node : null);
      return;
    }
    for (const child of node.childNodes) walk(child);
  };

  for (const child of root.childNodes) walk(child);
  if (!sawCaret) {
    const last = drafts[drafts.length - 1];
    if (!last || last.type !== "text") drafts.push({ type: "text", id: "tmp", value: "" });
    const tail = drafts[drafts.length - 1];
    caretIndex = drafts.length - 1;
    caretOffset = tail?.type === "text" ? tail.value.length : 0;
  }
  const normalized = normalizeParts(drafts, { index: caretIndex, offset: caretOffset });
  return { parts: normalized.parts, caret: normalized.caret ?? { index: 0, offset: 0 } };
}

function chipBesideCaret(root: HTMLElement, side: "before" | "after"): string | null {
  const sel = window.getSelection();
  if (!sel?.isCollapsed || !sel.anchorNode || !root.contains(sel.anchorNode)) return null;
  const node = sel.anchorNode;
  const offset = sel.anchorOffset;
  if (node.nodeType === Node.TEXT_NODE) {
    const raw = (node.textContent ?? "").replace(/\u200b/g, "");
    const cut = (node.textContent ?? "").slice(0, offset).replace(/\u200b/g, "").length;
    const blocked = side === "before" ? cut > 0 : cut < raw.length;
    if (blocked) return null;
    const parent = node.parentElement;
    const sibling = side === "before" ? (parent?.dataset.seg ? parent.previousElementSibling : node.previousSibling) : parent?.dataset.seg ? parent.nextElementSibling : node.nextSibling;
    return sibling instanceof HTMLElement && sibling.dataset.command ? (sibling.dataset.seg ?? null) : null;
  }
  if (node instanceof HTMLElement) {
    const sibling = node.childNodes[side === "before" ? offset - 1 : offset];
    return sibling instanceof HTMLElement && sibling.dataset.command ? (sibling.dataset.seg ?? null) : null;
  }
  return null;
}

const DEFAULT_CHIP_COLOR = "#c9841a";
const NEUTRAL_CHIP_COLOR = "#71717a";
const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const chipClass = "mx-px inline max-w-full truncate rounded-[4px] px-1 align-middle text-xs leading-4 text-white";

function paintComposer(root: HTMLElement, parts: readonly ComposerPart[]) {
  const frag = document.createDocumentFragment();
  for (const part of parts) {
    const span = document.createElement("span");
    span.dataset.seg = part.id;
    if (part.type === "text") {
      span.textContent = part.value === "" ? "\u200b" : part.value;
    } else {
      span.dataset.command = part.value;
      span.dataset.label = part.label;
      if (part.title) {
        span.dataset.title = part.title;
        span.title = part.title;
      }
      const color = part.color && HEX_COLOR.test(part.color) ? part.color : DEFAULT_CHIP_COLOR;
      span.dataset.color = color;
      span.contentEditable = "false";
      span.className = chipClass;
      span.style.backgroundColor = color;
      span.textContent = part.label;
    }
    frag.append(span);
  }
  root.replaceChildren(frag);
}

function placeCaret(root: HTMLElement, parts: readonly ComposerPart[], caret: ComposerCaret) {
  const part = parts[caret.index];
  if (!part || part.type !== "text") return;
  const span = root.querySelector(`[data-seg="${part.id}"]`);
  const node = span?.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return;
  const point = part.value === "" ? 0 : Math.min(caret.offset, node.textContent?.length ?? 0);
  const range = document.createRange();
  range.setStart(node, point);
  range.collapse(true);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

const ComposerEditor = memo(function ComposerEditor({ editorRef }: { editorRef: { current: HTMLDivElement | null } }) {
  return <div ref={editorRef} data-chat-input contentEditable="true" suppressContentEditableWarning role="combobox" tabIndex={0} aria-expanded="false" aria-autocomplete="list" className="min-h-[22px] whitespace-pre-wrap wrap-break-word text-sm font-normal text-foreground outline-none" />;
});

export function ChatInput({ inputRef, generating = false, placeholder = "Message…", disabled = false, onSend, onCancel, onClear, toolbar, triggers = [], defaultValue = "", className, autoFocus = false, focusSignal, enableTypeToFocus = false }: ChatInputProps) {
  const initial = emptyComposer(defaultValue);
  const [parts, setParts] = useState<ComposerPart[]>(initial.parts);
  const [caret, setCaret] = useState<ComposerCaret>(initial.caret);
  const [focused, setFocused] = useState(false);
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const optionsRef = useRef<{ id: string; value: string; label?: string }[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const partsRef = useRef(parts);
  const caretRef = useRef(caret);
  const pendingCaret = useRef(false);
  const composing = useRef(false);
  const chipSeq = useRef(0);
  const listId = useId();
  const lockedRef = useRef(false);
  partsRef.current = parts;
  caretRef.current = caret;
  lockedRef.current = generating || disabled;

  const locked = generating || disabled;
  const canSend = !locked && !isComposerEmpty(parts);

  const triggerMarkers = useMemo(() => triggers.filter((item) => item.menu != null && item.menu !== false && item.trigger !== "").map((item) => item.trigger), [triggers]);

  const textPart = parts[caret.index];
  const token = !locked && focused && textPart?.type === "text" ? chatTokenAt(textPart.value, caret.offset, triggerMarkers) : null;
  const tokenKey = token ? `${caret.index}:${token.start}:${token.trigger}:${token.query}` : null;
  const activeTrigger = token ? triggers.find((item) => item.trigger === token.trigger) : undefined;
  const suggestSlot = activeTrigger?.menu ?? null;
  const menuOpen = Boolean(token && suggestSlot != null && suggestSlot !== false && tokenKey !== dismissedKey);

  const [prevTokenKey, setPrevTokenKey] = useState(tokenKey);
  if (tokenKey !== prevTokenKey) {
    setPrevTokenKey(tokenKey);
    setActiveOptionId(null);
  }

  const commit = (nextParts: ComposerPart[], nextCaret: ComposerCaret) => {
    pendingCaret.current = true;
    caretRef.current = nextCaret;
    partsRef.current = nextParts;
    setParts(nextParts);
    setCaret(nextCaret);
  };

  useLayoutEffect(() => {
    const root = editorRef.current;
    if (!root) return;
    paintComposer(root, parts);
    if (!pendingCaret.current) return;
    pendingCaret.current = false;
    root.focus();
    placeCaret(root, parts, caretRef.current);
  }, [parts]);

  useEffect(() => {
    const onSignal = focusSignal !== undefined;
    if (!autoFocus && !onSignal) return;
    if (onSignal) {
      const cleared = emptyComposer();
      commit(cleared.parts, cleared.caret);
    }
    let tries = 0;
    let timer = 0;
    const tryFocus = () => {
      const root = editorRef.current;
      if (!root || lockedRef.current) {
        if (tries++ < 20) timer = window.setTimeout(tryFocus, 40);
        return;
      }
      root.focus({ preventScroll: true });
    };
    timer = window.setTimeout(tryFocus, 0);
    return () => clearTimeout(timer);
  }, [autoFocus, focusSignal]);

  useEffect(() => {
    if (!enableTypeToFocus) return;

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing || composing.current) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;

      const root = editorRef.current;
      if (!root || locked || document.activeElement === root || root.contains(document.activeElement)) return;
      if (isEditableTarget(e.target) || isEditableTarget(document.activeElement)) return;

      e.preventDefault();
      const current = partsRef.current;
      const last = current.length - 1;
      const end = current[last];
      const at = end?.type === "text" ? { index: last, offset: end.value.length } : { index: 0, offset: 0 };
      const placed = insertTextAt(current, at, e.key);
      commit(placed.parts, placed.caret);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enableTypeToFocus, locked]);

  const syncFromDom = () => {
    const root = editorRef.current;
    if (!root || composing.current) return;
    const read = readComposer(root);
    commit(read.parts, read.caret);
  };

  const refreshCaret = () => {
    const root = editorRef.current;
    if (!root || composing.current) return;
    const read = readComposer(root);
    const same = serializeComposer(read.parts) === serializeComposer(partsRef.current) && read.parts.filter((part) => part.type === "command").length === partsRef.current.filter((part) => part.type === "command").length;
    if (!same) {
      commit(read.parts, read.caret);
      return;
    }
    caretRef.current = read.caret;
    setCaret(read.caret);
  };

  useImperativeHandle(
    inputRef,
    () => ({
      insertChip: (chip) => {
        const value = chip.value.trim();
        if (!value) return;
        const label = chip.label.trim() || value;
        const title = chip.title?.trim() || undefined;
        const color = chip.color ?? NEUTRAL_CHIP_COLOR;
        const placed = insertChipAt(partsRef.current, caretRef.current, { id: `cmd-${++chipSeq.current}`, label, value, title, color });
        commit(placed.parts, placed.caret);
      },
      focus: () => editorRef.current?.focus(),
      clear: () => {
        const cleared = emptyComposer();
        commit(cleared.parts, cleared.caret);
      },
    }),
    [],
  );

  const handleSend = () => {
    if (!canSend) return;
    onSend(serializeComposer(parts).trim());
    const cleared = emptyComposer();
    commit(cleared.parts, cleared.caret);
  };

  const pickSuggestion = (value: string, label?: string) => {
    if (!token || textPart?.type !== "text") return;
    const raw = value.trim();
    if (!raw) return;
    const placed = insertCommandAt(parts, caret, token.start, token.end, {
      id: `cmd-${++chipSeq.current}`,
      label: label?.trim() || raw,
      value: raw,
      color: activeTrigger?.color,
    });
    setDismissedKey(null);
    commit(placed.parts, placed.caret);
  };

  const registerOption = useCallback((id: string, option: { value: string; label?: string }) => {
    optionsRef.current = [...optionsRef.current.filter((item) => item.id !== id), { id, ...option }];
    setActiveOptionId((current) => (current && optionsRef.current.some((item) => item.id === current) ? current : (optionsRef.current[0]?.id ?? null)));
    return () => {
      optionsRef.current = optionsRef.current.filter((item) => item.id !== id);
      setActiveOptionId((current) => (current === id ? (optionsRef.current[0]?.id ?? null) : current));
    };
  }, []);

  const suggestValue = token
    ? {
        query: token.query,
        trigger: token.trigger,
        insert: pickSuggestion,
        close: () => setDismissedKey(tokenKey),
        activeId: activeOptionId,
        register: registerOption,
        highlight: setActiveOptionId,
      }
    : null;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.isComposing || composing.current) return;
    if (menuOpen) {
      const options = optionsRef.current;
      const currentIndex = options.findIndex((item) => item.id === activeOptionId);
      if (e.key === "ArrowDown" && options.length > 0) {
        e.preventDefault();
        setActiveOptionId(options[(currentIndex + 1) % options.length]?.id ?? null);
        return;
      }
      if (e.key === "ArrowUp" && options.length > 0) {
        e.preventDefault();
        setActiveOptionId(options[(currentIndex - 1 + options.length) % options.length]?.id ?? null);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setDismissedKey(tokenKey);
        return;
      }
      if (((e.key === "Enter" && !e.shiftKey) || e.key === "Tab") && options.length > 0) {
        e.preventDefault();
        const item = options.find((option) => option.id === activeOptionId) ?? options[0];
        if (item) pickSuggestion(item.value, item.label);
        return;
      }
    }
    const root = editorRef.current;
    const chipId = root && (e.key === "Backspace" || e.key === "Delete") ? chipBesideCaret(root, e.key === "Backspace" ? "before" : "after") : null;
    if (chipId) {
      e.preventDefault();
      const placed = removeCommandPart(partsRef.current, chipId);
      commit(placed.parts, placed.caret);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const placed = insertTextAt(partsRef.current, caretRef.current, "\n");
      commit(placed.parts, placed.caret);
    }
  };

  const activeId = menuOpen ? activeOptionId : undefined;
  const handlers = useRef({ syncFromDom, refreshCaret, handleKeyDown });
  handlers.current = { syncFromDom, refreshCaret, handleKeyDown };

  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;
    const onKeyDown = (e: KeyboardEvent) => handlers.current.handleKeyDown(e);
    const onInput = () => handlers.current.syncFromDom();
    const onCaret = () => handlers.current.refreshCaret();
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain") ?? "";
      if (!text) return;
      const placed = insertTextAt(partsRef.current, caretRef.current, text);
      commit(placed.parts, placed.caret);
    };
    const onCompositionStart = () => {
      composing.current = true;
    };
    const onCompositionEnd = () => {
      composing.current = false;
      handlers.current.syncFromDom();
    };
    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);
    root.addEventListener("keydown", onKeyDown);
    root.addEventListener("input", onInput);
    root.addEventListener("keyup", onCaret);
    root.addEventListener("mouseup", onCaret);
    root.addEventListener("paste", onPaste);
    root.addEventListener("compositionstart", onCompositionStart);
    root.addEventListener("compositionend", onCompositionEnd);
    root.addEventListener("focus", onFocus);
    root.addEventListener("blur", onBlur);
    return () => {
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("input", onInput);
      root.removeEventListener("keyup", onCaret);
      root.removeEventListener("mouseup", onCaret);
      root.removeEventListener("paste", onPaste);
      root.removeEventListener("compositionstart", onCompositionStart);
      root.removeEventListener("compositionend", onCompositionEnd);
      root.removeEventListener("focus", onFocus);
      root.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;
    root.contentEditable = locked ? "false" : "true";
    root.setAttribute("aria-expanded", menuOpen ? "true" : "false");
    if (menuOpen) root.setAttribute("aria-controls", listId);
    else root.removeAttribute("aria-controls");
    if (activeId) root.setAttribute("aria-activedescendant", `chat-suggest-${activeId}`);
    else root.removeAttribute("aria-activedescendant");
  }, [locked, menuOpen, listId, activeId]);

  return (
    <div className={cn("nonla-chat-input relative mx-4 mb-2.5", className)}>
      {menuOpen && token && suggestValue ? (
        <ChatSuggestProvider value={suggestValue}>
          <div id={listId} role="listbox" aria-label="Suggestions" data-state="open" data-side="top" onMouseDown={(e) => e.preventDefault()} className={cn(glassOverlayClass, "absolute bottom-full left-0 right-0 z-20 mb-1.5 max-h-56 overflow-y-auto p-1 empty:hidden")}>
            {suggestSlot}
          </div>
        </ChatSuggestProvider>
      ) : null}
      <div className={cn(glassSurfaceClass, "relative isolate flex shrink-0 flex-col overflow-hidden rounded-xl border-(--nonla-input) bg-muted-strong pt-1 [.light:not(.dark)_&]:bg-background [.light:not(.dark)_&]:shadow-none [.light_.nonla-ui:not(.dark)_&]:bg-background [.light_.nonla-ui:not(.dark)_&]:shadow-none", disabled && "opacity-70")}>
        <div className="relative">
          {isComposerEmpty(parts) ? <span className="pointer-events-none absolute top-1 left-2.5 text-sm text-quaternary-foreground">{placeholder}</span> : null}
          <div className="max-h-[220px] overflow-y-auto px-2.5 pt-1 pb-2.5">
            <ComposerEditor editorRef={editorRef} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 pb-2 px-2">
          {onClear ? (
            <button type="button" onClick={onClear} title="Clear chat" aria-label="Clear chat" className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent cursor-pointer hover:bg-ink-hover">
              <Icon name="eraser" size={14} />
            </button>
          ) : null}
          {toolbar}
          <div className="flex-1" />

          {generating ? (
            <button type="button" onClick={onCancel} title="Stop" className="w-6 h-6 rounded-full bg-brand text-(--nonla-text-on-solid) flex items-center justify-center shrink-0 cursor-pointer hover:bg-brand/90 active:scale-95 transition-all duration-100 border-0">
              <Icon name="stop" size={12} />
              <span className="sr-only">Stop</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSend}
              onClick={handleSend}
              title="Send (Enter)"
              className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-100 border-0", canSend ? "bg-foreground text-background cursor-pointer" : "bg-border text-muted-foreground cursor-not-allowed opacity-50")}
            >
              <Icon name="arrow-up" size={14} />
              <span className="sr-only">Send</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
