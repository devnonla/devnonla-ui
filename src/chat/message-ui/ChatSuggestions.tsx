import { createContext, type ReactNode, useContext, useEffect, useId, useRef } from "react";
import { menuItemClass } from "../../dropdown/menuClasses";
import { cn } from "../../lib/cn";
/** A marker that opens a suggestion menu, e.g. `/`, `@`, or `#`. */
export type ChatTrigger = {
  /** Text that opens the menu when it starts a word. No spaces. */
  trigger: string;
  /** Menu shown while the trigger is open. Use `useChatSuggest` inside for the live query. `null` or `false` disables this trigger. */
  menu: ReactNode;
  /** Chip background as hex, e.g. `#6366f1`. Defaults to amber `#c9841a`. */
  color?: string;
};

export type ChatToken = {
  trigger: string;
  query: string;
  start: number;
  end: number;
};

/** What a custom menu can read while it is open. */
export type ChatSuggest = {
  query: string;
  trigger: string;
  /**
   * Replace the active token with a chip. `value` is stored and sent, e.g. `/plan` or `@file`.
   * `label` is what the chip shows. Omit it to show `value`.
   */
  insert: (value: string, label?: string) => void;
  close: () => void;
};

type SuggestOption = { value: string; label?: string };

type ChatSuggestContextValue = ChatSuggest & {
  activeId: string | null;
  register: (id: string, option: SuggestOption) => () => void;
  highlight: (id: string) => void;
};

const ChatSuggestContext = createContext<ChatSuggestContextValue | null>(null);

export function useChatSuggest(): ChatSuggest {
  const value = useContext(ChatSuggestContext);
  if (!value) throw new Error("useChatSuggest must be used inside ChatInput triggers");
  return value;
}

/** Token at the caret when a word starts with one of `triggers`. Longest trigger wins. */
export function chatTokenAt(text: string, caret: number, triggers: readonly string[]): ChatToken | null {
  if (caret < 0 || caret > text.length) return null;
  let start = caret;
  while (start > 0 && !/\s/.test(text[start - 1] ?? "")) start -= 1;
  let end = caret;
  while (end < text.length && !/\s/.test(text[end] ?? "")) end += 1;
  if (start >= end) return null;
  const word = text.slice(start, end);
  let match: string | null = null;
  for (const trigger of triggers) {
    if (trigger && word.startsWith(trigger) && (match === null || trigger.length > match.length)) match = trigger;
  }
  if (match === null) return null;
  return { trigger: match, query: word.slice(match.length), start, end };
}

export function ChatSuggestProvider({ value, children }: { value: ChatSuggestContextValue; children: ReactNode }) {
  return <ChatSuggestContext.Provider value={value}>{children}</ChatSuggestContext.Provider>;
}

/**
 * One row in a custom menu. Arrow keys and Enter use these rows.
 * `value` is sent. `label` is shown in the chip; omit it to show `value`.
 */
export function ChatSuggestOption({ value, label, children }: { value: string; label?: string; children: ReactNode }) {
  const suggest = useContext(ChatSuggestContext);
  const id = useId();
  const ref = useRef<HTMLButtonElement>(null);
  if (!suggest) throw new Error("ChatSuggestOption must be used inside ChatInput triggers");
  const { insert, activeId, register, highlight } = suggest;
  const active = activeId === id;

  useEffect(() => register(id, { value, label }), [id, register, value, label]);

  useEffect(() => {
    if (!active) return;
    ref.current?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <button
      ref={ref}
      id={`chat-suggest-${id}`}
      type="button"
      role="option"
      aria-selected={active}
      data-highlighted={active ? "" : undefined}
      onMouseEnter={() => highlight(id)}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => insert(value, label)}
      className={cn(menuItemClass, "w-full cursor-pointer text-left")}
    >
      {children}
    </button>
  );
}
