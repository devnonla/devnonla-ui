import type { ReactNode } from "react";
import { AgentAvatar } from "../../avatar/AgentAvatar";
import { Button } from "../../button/Button";
import { cn } from "../../lib/cn";

export type ChatWelcomeProps = {
  name: string;
  description?: string | null;
  /** Avatar node (image / initials). */
  avatar?: ReactNode;
  starters?: string[];
  onStarter?: (text: string) => void;
  disabled?: boolean;
  className?: string;
};

const DEFAULT_STARTERS = ["What can you help me with?", "Brainstorm a few ideas with me", "Walk me through how you work"] as const;

function DefaultAvatar({ name }: { name: string }) {
  return <AgentAvatar size={72} label={name} />;
}

export function ChatWelcome({ name, description, avatar, starters = [...DEFAULT_STARTERS], onStarter, disabled, className }: ChatWelcomeProps) {
  const desc = description?.trim() || null;

  return (
    <div className={cn("nonla-chat-welcome flex flex-col items-center justify-center min-h-full w-full px-6 py-10 text-center", className)}>
      <div className="mb-5">{avatar ?? <DefaultAvatar name={name} />}</div>

      <h2 className="m-0 text-[22px] font-semibold tracking-tight text-foreground leading-snug">Hi, I&apos;m {name}</h2>

      {desc ? <p className="mt-2 mb-0 max-w-90 text-[13px] leading-relaxed text-tertiary-foreground line-clamp-2">{desc}</p> : <p className="mt-2 mb-0 max-w-[320px] text-[13px] leading-relaxed text-tertiary-foreground">Send a message to start working together.</p>}

      {starters.length > 0 && onStarter ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-130">
          {starters.map((text) => (
            <Button key={text} type="default" disabled={disabled} onClick={() => onStarter(text)}>
              {text}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
