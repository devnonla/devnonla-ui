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

Full chat. The library calls `endpoint` and reads the SSE stream. Use [AgentChatbox](/chat/agent-chatbox) when the app must own send, resume, and stop.

```live-react
import { AgentPanel } from "devnonla-ui";

function endpoint() {
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const send = (data) => controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
      send({ type: "text-delta", text: "Tomorrow you have **Standup** at 09:30." });
      send({ type: "done" });
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
}

export default function Demo() {
  return (
    <div className="h-[32rem] w-full overflow-hidden">
      <AgentPanel endpoint={endpoint} title="Nova" name="Nova" description="Helps with research, drafting, and tool-using workflows." placeholder="Message Nova" />
    </div>
  );
}
```
