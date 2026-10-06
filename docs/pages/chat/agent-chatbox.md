---
path: "/chat/agent-chatbox"
title: "AgentChatbox"
group: "Chat"
groupOrder: 2
order: 3
icon: "chat-24"
wide: true
---

# AgentChatbox

The app owns `send` / resume. The library owns the chat surface.

```live-react
import { AgentChatbox } from "devnonla-ui";

function reply(text) {
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const send = (data) => controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
      send({ type: "text-delta", text: `Noted: ${text}` });
      send({ type: "done" });
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
}

export default function Demo() {
  return (
    <div className="h-[32rem] w-full overflow-hidden rounded-lg border border-border">
      <AgentChatbox
        send={({ text }) => reply(text)}
        title="Nova"
        name="Nova"
        description="AgentChatbox — app owns send; library owns the chat surface."
        placeholder="Message Nova"
      />
    </div>
  );
}
```
