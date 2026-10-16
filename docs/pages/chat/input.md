---
path: "/chat/input"
title: "Input"
group: "Chat"
groupOrder: 2
order: 8
icon: "drafts-24"
---

# Input

Composer at the bottom of AgentPanel and AgentChatbox. Import `ChatInput` when you build the thread yourself. `toolbar` sits left of the field.

Pass `triggers`, an array of markers. Each item has a `trigger` string (`/`, `@`, or any other text), a `menu` React node, and an optional `color` as hex. A menu opens when the trigger starts a word. Call `useChatSuggest` inside `menu` to read the query and insert a chip. `ChatSuggestOption` rows take arrow keys and Enter. Backspace removes a chip like text. AgentPanel and AgentChatbox take the same `triggers` prop.

```live-react
import { useRef, useState } from "react";
import { message } from "devnonla-ui";
import { ChatInput, ChatSuggestOption, useChatSuggest } from "devnonla-ui/chat";

const COMMANDS = [
  { value: "/plan", label: "plan", detail: "Outline the work first" },
  { value: "/search", label: "search", detail: "Look through the workspace" },
  { value: "/compact", label: "compact", detail: "Summarize this thread" },
  { value: "/review", label: "review", detail: "Check the last change" },
];

const MENTIONS = [
  { value: "@src/App.tsx", label: "src/App.tsx", detail: "File" },
  { value: "@README.md", label: "README.md", detail: "File" },
  { value: "@incident", label: "incident", detail: "Skill" },
  { value: "@checkout", label: "checkout", detail: "Page" },
];

const SAMPLE = "The retry policy caps attempts at three and backs off exponentially between tries.";

function SuggestMenu({ title, items }) {
  const { query } = useChatSuggest();
  const q = query.trim().toLowerCase();
  const shown = items.filter((item) => !q || `${item.label} ${item.detail}`.toLowerCase().includes(q));
  if (shown.length === 0) return null;
  return (
    <div>
      <div className="px-2.5 pt-1 pb-1 text-xs font-medium leading-4 text-tertiary-foreground">{title}</div>
      {shown.map((item) => (
        <ChatSuggestOption key={item.value} value={item.value}>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <span className="max-w-[45%] truncate text-xs text-tertiary-foreground">{item.detail}</span>
        </ChatSuggestOption>
      ))}
    </div>
  );
}

export default function Demo() {
  const inputRef = useRef(null);
  const contexts = useRef(new Map());
  const [generating, setGenerating] = useState(false);
  const [lastContext, setLastContext] = useState("");

  const addSelection = () => {
    const picked = window.getSelection()?.toString().trim() || SAMPLE;
    const value = `@selection-${contexts.current.size + 1}`;
    contexts.current.set(value, picked);
    const lines = picked.split("\n").length;
    inputRef.current?.insertChip({ label: `notes.md:L1-L${lines}`, value, title: picked });
  };

  return (
    <div className="w-full max-w-xl pt-56">
      <p className="mb-3 text-sm text-secondary-foreground">{SAMPLE}</p>
      <button type="button" onClick={addSelection} className="mb-3 rounded-md border border-border px-2.5 py-1 text-sm hover:bg-ink-hover cursor-pointer">
        Add selection as context
      </button>
      <ChatInput
        inputRef={inputRef}
        generating={generating}
        triggers={[
          { trigger: "/", color: "#c9841a", menu: <SuggestMenu title="Commands" items={COMMANDS} /> },
          { trigger: "@", color: "#6366f1", menu: <SuggestMenu title="Mentions" items={MENTIONS} /> },
        ]}
        placeholder="Message…  / or @"
        onSend={(text) => {
          const sent = [...contexts.current].filter(([value]) => text.includes(value)).map(([, content]) => content);
          setLastContext(sent.join(" | "));
          message.success(`Sent: ${text}`);
          setGenerating(true);
          window.setTimeout(() => setGenerating(false), 1200);
        }}
        onCancel={() => setGenerating(false)}
      />
      {lastContext ? <p className="mt-3 text-xs text-tertiary-foreground">Context: {lastContext}</p> : null}
    </div>
  );
}
```

## Insert a chip from code

Pass `inputRef` to ChatInput, AgentPanel, or AgentChatbox, then call `insertChip` on the handle. The chip shows `label`. The message sends `value`, so keep the payload in your app and map it by `value`. `title` is the full text in a native tooltip on hover. `color` is the chip background as hex, default neutral gray `#71717a`. The composer focuses after insert and places the caret after the chip. The demo above uses this with the same composer as the `/` and `@` menus.

Each trigger's `menu` follows the same rule. `ChatSuggestOption` takes `value` (sent) and an optional `label` (shown in the chip). `insert(value, label)` works the same way inside a custom menu. Chips from a trigger use that trigger's `color`, default amber `#c9841a`.
