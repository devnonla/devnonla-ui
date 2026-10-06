---
path: "/chat/agent"
title: "Agent message"
group: "Chat"
groupOrder: 2
order: 7
icon: "bot-24"
---

# Agent message

Assistant reply uses MarkdownViewer, so headings, lists, tables, and code stay in sync with the editor preview.

```live-react
import { ChatAgentMessage, ChatError, ChatMarkdown } from "devnonla-ui";

const AGENT_MARKDOWN = "## Incident recap\n\nLatency on `checkout` jumped after the **14:00 deploy**. Root cause is the new retry budget in `PaymentClient`, not the Redis timeout.\n\n> If p95 stays above 800ms after rollback, page on-call.\n\n### What changed\n\n1. Raised retries from 1 to 4\n2. Added a circuit breaker that never opened\n3. Left the old fallback path in place\n\n| Check | Before | After |\n| --- | --- | --- |\n| p50 | 120ms | 340ms |\n| p95 | 280ms | 1.4s |\n| Error rate | 0.2% | 1.8% |\n";

export default function Demo() {
  return (
    <>
      <ChatAgentMessage>
        <ChatMarkdown content={AGENT_MARKDOWN} />
      </ChatAgentMessage>
      <ChatAgentMessage thinking="Need to call get_metrics, then summarize by product area." thinkingDuration={3}>
        <ChatMarkdown content="p95 is **1.4s** after the retry change. Rollback `PaymentClient` first." />
      </ChatAgentMessage>
      <ChatError>Model rate limit. Retry in a moment.</ChatError>
    </>
  );
}
```
