import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "../../icon/Icon";
import { cn } from "../../lib/cn";
import { Shimmer } from "../../shimmer/Shimmer";
import { chatToolLineClass } from "../chatRhythm";

export type ChatThinkingProps = {
  thinking: string;
  /** Final duration in seconds (shown when not streaming). */
  duration?: number;
  streaming?: boolean;
  className?: string;
};

/** Collapsed by default; expand to read (and stream) reasoning. */
export function ChatThinking({ thinking, duration = 0, streaming = false, className }: ChatThinkingProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!streaming) return;
    setElapsedSec(0);
    const started = Date.now();
    const id = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [streaming]);

  useLayoutEffect(() => {
    if (!streaming) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thinking, streaming]);

  if (!thinking.trim()) return null;

  const liveElapsed = Math.max(elapsedSec, duration);
  const shownDuration = Math.max(1, duration);
  const label = streaming ? (liveElapsed >= 3 ? `Thinking ${liveElapsed}s` : "Thinking") : `Thought ${shownDuration}s`;

  return (
    <details
      className={cn("nonla-chat-thinking px-4 group/thinking", className)}
      style={{ overflowAnchor: "none" }}
      onToggle={(e) => {
        if (!streaming || !e.currentTarget.open) return;
        const el = bodyRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      }}
    >
      <summary className={cn(chatToolLineClass, "cursor-pointer list-none font-medium select-none [&::-webkit-details-marker]:hidden")}>
        <Shimmer active={streaming} className="text-muted-foreground">{label}</Shimmer>
        <Icon name="arrow-right" size={12} className="shrink-0 opacity-0 text-muted-foreground transition-[opacity,transform] duration-150 group-hover/thinking:opacity-100 group-open/thinking:opacity-100 group-open/thinking:rotate-90" />
      </summary>

      <div ref={bodyRef} className="pt-2 max-h-40 min-w-0 overflow-y-auto overflow-x-hidden mb-2 text-sm">
        <p className="m-0 text-sm text-tertiary-foreground whitespace-pre-wrap wrap-break-word">{thinking}</p>
      </div>
    </details>
  );
}
