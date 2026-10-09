---
path: "/chat/agent-panel"
title: "AgentPanel"
group: "Chat"
groupOrder: 2
order: 2
icon: "chat-24"
wide: true
---

# AgentPanel

Full chat. The library calls `endpoint` and reads the SSE stream. Use [AgentChatbox](/chat/agent-chatbox) when the app must own send, resume, and stop. Reply text is `text-md`. Tables stay `text-base`.

The thread below is seeded so every chat surface is already on screen: user bubble, thinking, agent markdown, error, the generic tool card, each builtin tool, a background task, and the task bar above the composer. Some tools run back to back. Elsewhere a short reply sits between them.

```live-react
import { AgentPanel, BackgroundTasksBar } from "devnonla-ui";

const AGENT_MARKDOWN = "## Incident recap\n\nLatency on `checkout` jumped after the **14:00 deploy**. Root cause is the new retry budget in `PaymentClient`, not the Redis timeout.\n\n> If p95 stays above 800ms after rollback, page on-call.\n\n### What changed\n\n1. Raised retries from 1 to 4\n2. Added a circuit breaker that never opened\n3. Left the old fallback path in place\n\n| Check | Before | After |\n| --- | --- | --- |\n| p50 | 120ms | 340ms |\n| p95 | 280ms | 1.4s |\n| Error rate | 0.2% | 1.8% |\n";

function msg(id, partial) {
  return { id, content: "", timestamp: new Date(Date.now() - 60_000), ...partial };
}

const initialMessages = [
  msg("user", { role: "user", content: "What changed in checkout after the 14:00 deploy?" }),
  msg("intro", {
    role: "assistant",
    content: "I'll pull the page, the clock, and the incident notes together.",
    meta: { thinking: "Need checkout metrics, the skill notes, and a quick script before the recap.", thinkingDuration: 4 },
  }),
  msg("fetch", {
    role: "tool-call",
    toolName: "web_fetch",
    toolInput: { url: "https://example.com/checkout" },
    toolOutput: { ok: true, url: "https://example.com/checkout", text: "Checkout — p95 1.4s after the 14:00 deploy." },
  }),
  msg("time", {
    role: "tool-call",
    toolName: "get_current_time",
    toolInput: { timezone: "Asia/Ho_Chi_Minh" },
    toolOutput: { time: "17:05:12", timezone: "Asia/Ho_Chi_Minh", iso: "2026-09-11T10:05:12.000Z" },
  }),
  msg("skill", {
    role: "tool-call",
    toolName: "read_skill",
    toolInput: { name: "incident" },
    toolOutput: {
      ok: true,
      skill: "incident",
      title: "Incident",
      content: "Page on-call when p95 stays above 800ms.",
      references: [{ name: "rollback" }, { name: "metrics" }],
    },
  }),
  msg("between-js", {
    role: "assistant",
    content: "The page already shows **p95 1.4s**. Checking that against the 800ms line.",
  }),
  msg("js", {
    role: "tool-call",
    toolName: "run_js",
    toolInput: { code: "const p95 = 1400;\np95 > 800" },
    toolOutput: { ok: true, result: true, console: "p95 1400ms" },
  }),
  msg("between-agent", {
    role: "assistant",
    content: "It crosses the line. Asking Nova before I open the client.",
  }),
  msg("agent", {
    role: "tool-call",
    toolName: "call_agent",
    toolLabel: "Call Nova",
    toolInput: { message: "Summarize the checkout regression." },
    toolOutput: { success: true, response: "Rollback `PaymentClient` first. p95 is **1.4s**.", agent_id: "nova" },
  }),
  msg("between-files", {
    role: "assistant",
    content: "Nova agrees on `PaymentClient`. Reading the file, then the live page.",
  }),
  msg("file", {
    role: "tool-call",
    toolName: "read_file",
    toolLabel: "Read file",
    toolInput: { path: "src/web/App.tsx" },
    toolOutput: { lines: 120, preview: "export default function App() { … }" },
  }),
  msg("nav", {
    role: "tool-call",
    toolName: "browser_navigate",
    toolInput: { url: "https://example.com" },
    toolError: "Timed out after 30s",
  }),
  msg("bg", {
    role: "tool-call",
    toolName: "sync_logs",
    toolLabel: "Sync logs",
    toolOutput: { status: "running", taskId: "task_logs", toolName: "sync_logs" },
  }),
  msg("error", { role: "error", content: "Model rate limit. Retry in a moment." }),
  msg("assistant", { role: "assistant", content: AGENT_MARKDOWN }),
];

function endpoint() {
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const send = (data) => controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
      send({ type: "TEXT_MESSAGE_CHUNK", messageId: "m1", role: "assistant", delta: "Tomorrow you have **Standup** at 09:30." });
      send({ type: "RUN_FINISHED", threadId: "demo", runId: "1" });
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
}

const bgTasks = [
  {
    taskId: "task_logs",
    toolName: "sync_logs",
    status: "running",
    startedAt: Date.now() - 45_000,
    console: "tailing checkout logs…\n",
  },
];

export default function Demo() {
  return (
    <div className="h-[40rem] w-full overflow-hidden">
      <AgentPanel
        endpoint={endpoint}
        initialMessages={initialMessages}
        title="Nova"
        name="Nova"
        description="Helps with research, drafting, and tool-using workflows."
        placeholder="Message Nova"
        accessory={
          <div className="mx-auto w-full max-w-200">
            <BackgroundTasksBar tasks={bgTasks}>
              <span />
            </BackgroundTasksBar>
          </div>
        }
      />
    </div>
  );
}
```

## API

`endpoint` is the only required prop. A string is POSTed `{ messages }`. A function receives `{ messages, signal }` and returns the SSE `Response`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `endpoint` | Stream URL, or a function that returns an SSE `Response`. | `string` \| `(req) => Promise<Response>` | — |
| `title` | Panel title. Welcome uses this when `name` is omitted. | `string` | `"Assistant"` |
| `name` | Welcome name. | `string` | `title` |
| `description` | Welcome description. | `string` | — |
| `avatar` | Welcome face. | `ReactNode` | — |
| `starters` | Welcome prompts. A click sends that text. | `string[]` | — |
| `placeholder` | Composer placeholder. | `string` | `"Message…"` |
| `initialMessages` | Thread already on screen. | `AgentMessage[]` | — |
| `extraBody` | Extra JSON merged into the POST body. String `endpoint` only. | `object` \| `() => object` | — |
| `headers` | Extra request headers. String `endpoint` only. | `Record<string, string>` | — |
| `fetcher` | `fetch` implementation. | `typeof fetch` | `fetch` |
| `toolbar` | Node left of the composer. | `ReactNode` | — |
| `accessory` | Node above the composer. The demo puts `BackgroundTasksBar` here. | `ReactNode` | — |
| `emptyState` | Replaces the welcome screen when the thread is empty. | `ReactNode` | — |
| `toolUis` | Custom tool cards. Checked before builtins. | `AgentToolUI[]` | — |
| `toolHooks` | `onCall` / `onResult` for matching tool names. | `AgentToolHook[]` | — |
| `scrollbar` | Overlay scrollbar. | `"hover"` \| `"always"` | `"hover"` |
| `onGeneratingChange` | Fires when a turn starts or ends. | `(generating: boolean) => void` | — |
| `className` | Class on the panel root. | `string` | — |
