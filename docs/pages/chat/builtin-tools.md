---
path: "/chat/builtin-tools"
title: "Builtin tools"
group: "Chat"
groupOrder: 2
order: 10
icon: "code-24"
className: "bg-background"
---

# Builtin tools

Specialized cards for Nonla built-ins. AgentPanel and AgentChatbox check your `toolUis` first, then these, then [ChatToolCall](/chat/tool). Each card below is running, finished, then failed.

```live-react
import { BackgroundTaskToolUI, CallAgentToolUI, GetCurrentTimeToolUI, ReadSkillToolUI, RunJsToolUI, WebFetchToolUI } from "devnonla-ui";

const assistant = { assistantLabel: "Nova", showAvatar: false };

function msg(partial) {
  return { id: "demo", timestamp: Date.now() - 12_000, ...partial };
}

function Group({ children }) {
  return <div className="flex w-full min-w-0 flex-col border-t border-border-secondary py-2 first:border-t-0">{children}</div>;
}

export default function Demo() {
  return (
    <div className="flex w-full min-w-0 flex-col">
      <Group>
        <WebFetchToolUI {...assistant} generating msg={msg({ toolName: "web_fetch", toolInput: { url: "https://example.com/checkout" } })} />
        <WebFetchToolUI
          {...assistant}
          msg={msg({
            toolName: "web_fetch",
            toolInput: { url: "https://example.com/checkout" },
            toolOutput: { ok: true, url: "https://example.com/checkout", text: "Checkout — p95 1.4s after the 14:00 deploy." },
          })}
        />
        <WebFetchToolUI {...assistant} msg={msg({ toolName: "web_fetch", toolInput: { url: "https://example.com/checkout" }, toolError: "Timed out after 30s" })} />
      </Group>

      <Group>
        <GetCurrentTimeToolUI {...assistant} generating msg={msg({ toolName: "get_current_time", toolInput: { timezone: "Asia/Ho_Chi_Minh" } })} />
        <GetCurrentTimeToolUI
          {...assistant}
          msg={msg({
            toolName: "get_current_time",
            toolInput: { timezone: "Asia/Ho_Chi_Minh" },
            toolOutput: { time: "17:05:12", timezone: "Asia/Ho_Chi_Minh", iso: "2026-09-11T10:05:12.000Z" },
          })}
        />
        <GetCurrentTimeToolUI {...assistant} msg={msg({ toolName: "get_current_time", toolInput: { timezone: "Asia/Ho_Chi_Minh" }, toolError: "Unknown timezone" })} />
      </Group>

      <Group>
        <ReadSkillToolUI {...assistant} generating msg={msg({ toolName: "read_skill", toolInput: { name: "incident" } })} />
        <ReadSkillToolUI
          {...assistant}
          msg={msg({
            toolName: "read_skill",
            toolInput: { name: "incident" },
            toolOutput: {
              ok: true,
              skill: "incident",
              title: "Incident",
              content: "Page on-call when p95 stays above 800ms.",
              references: [{ name: "rollback" }, { name: "metrics" }],
            },
          })}
        />
        <ReadSkillToolUI {...assistant} msg={msg({ toolName: "read_skill", toolInput: { name: "incident" }, toolOutput: { ok: false, skill: "incident", error: "Skill not found" } })} />
      </Group>

      <Group>
        <RunJsToolUI {...assistant} generating msg={msg({ toolName: "run_js", toolInput: { code: "const p95 = 1400;\np95 > 800" } })} />
        <RunJsToolUI
          {...assistant}
          msg={msg({
            toolName: "run_js",
            toolInput: { code: "const p95 = 1400;\np95 > 800" },
            toolOutput: { ok: true, result: true, console: "p95 1400ms" },
          })}
        />
        <RunJsToolUI
          {...assistant}
          msg={msg({
            toolName: "run_js",
            toolInput: { code: "p95 > 800" },
            toolOutput: { ok: false, error: "ReferenceError: p95 is not defined" },
          })}
        />
      </Group>

      <Group>
        <CallAgentToolUI {...assistant} msg={msg({ toolName: "call_agent", toolLabel: "Call Nova", toolInput: { message: "Summarize the checkout regression." } })} />
        <CallAgentToolUI
          {...assistant}
          msg={msg({
            toolName: "call_agent",
            toolLabel: "Call Nova",
            toolInput: { message: "Summarize the checkout regression." },
            toolOutput: { success: true, response: "Rollback `PaymentClient` first. p95 is **1.4s**.", agent_id: "nova" },
          })}
        />
        <CallAgentToolUI
          {...assistant}
          msg={msg({
            toolName: "call_agent",
            toolLabel: "Call Nova",
            toolInput: { message: "Summarize the checkout regression." },
            toolOutput: { success: false, error: "Nova is unavailable", agent_id: "nova" },
          })}
        />
      </Group>

      <Group>
        <BackgroundTaskToolUI
          {...assistant}
          msg={msg({
            toolName: "sync_logs",
            toolLabel: "Sync logs",
            toolOutput: { status: "running", taskId: "task_logs", toolName: "sync_logs" },
          })}
        />
      </Group>
    </div>
  );
}
```
