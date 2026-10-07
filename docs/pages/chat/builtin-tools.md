---
path: "/chat/builtin-tools"
title: "Builtin tools"
group: "Chat"
groupOrder: 2
order: 10
icon: "code-24"
className: "bg-chat"
---

# Builtin tools

Specialized cards for Nonla built-ins. AgentPanel and AgentChatbox check your `toolUis` first, then these, then [ChatToolCall](/chat/tool).

```live-react
import { GetCurrentTimeToolUI, WebFetchToolUI } from "devnonla-ui";

const assistant = { assistantLabel: "Nova", showAvatar: false };

function msg(partial) {
  return { id: "demo", timestamp: Date.now() - 12_000, ...partial };
}

export default function Demo() {
  return (
    <>
      <WebFetchToolUI
        {...assistant}
        msg={msg({
          toolName: "web_fetch",
          toolInput: { url: "https://example.com/checkout" },
          toolOutput: { ok: true, url: "https://example.com/checkout", text: "Checkout — p95 1.4s after the 14:00 deploy." },
        })}
      />
      <GetCurrentTimeToolUI
        {...assistant}
        msg={msg({
          toolName: "get_current_time",
          toolInput: { timezone: "Asia/Ho_Chi_Minh" },
          toolOutput: { time: "17:05:12", timezone: "Asia/Ho_Chi_Minh", iso: "2026-09-11T10:05:12.000Z" },
        })}
      />
    </>
  );
}
```
