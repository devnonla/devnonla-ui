import { useEffect, useRef, useState } from "react";
import { SolarIcon } from "../../icon/SolarIcon";
import { cn } from "../../lib/cn";

const MAX_HEIGHT = 150;

export type ChatUserMessageProps = {
  content: string;
  className?: string;
};

export function ChatUserMessage({ content, className }: ChatUserMessageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setIsOverflow(el.scrollHeight > MAX_HEIGHT);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [content]);

  const collapsed = isOverflow && !isExpanded;

  return (
    <div
      className={cn(
        "nonla-chat-user relative isolate mx-4 mt-6 mb-3 overflow-hidden rounded-xl border border-solid border-(--nonla-input) bg-muted-strong px-3 py-1.5",
        "[.light:not(.dark)_&]:bg-sidebar [.light_.nonla-ui:not(.dark)_&]:bg-sidebar",
        className,
      )}
    >
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden text-[15px] leading-6 text-foreground whitespace-pre-wrap wrap-break-word",
          collapsed && "mask-[linear-gradient(to_bottom,#000_calc(100%-1.75rem),transparent)]",
        )}
        style={{ maxHeight: collapsed ? MAX_HEIGHT : undefined }}
      >
        {content}
      </div>
      {isOverflow ? (
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse message" : "Expand message"}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((v) => !v);
          }}
          className="flex w-full cursor-pointer items-center justify-center border-0 bg-transparent pt-1 text-muted-foreground hover:text-foreground"
        >
          <SolarIcon name="alt-arrow-down-linear" size={12} className={cn("transition-transform duration-200", isExpanded && "rotate-180")} />
        </button>
      ) : null}
    </div>
  );
}
