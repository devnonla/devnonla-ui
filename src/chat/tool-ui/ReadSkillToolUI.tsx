import { Icon } from "../../icon/Icon";
import { cn } from "../../lib/cn";
import { Shimmer } from "../../shimmer/Shimmer";
import { chatRowClass, chatToolLineClass } from "../chatRhythm";
import { parseJsonObject } from "../common/utils";
import { ToolUiBadge } from "./ToolUiBadge";
import { ToolUiTrailing } from "./ToolUiTrailing";
import { isToolRunning, type ToolUIProps } from "./types";

type ReadSkillInput = { name?: string; reference?: string };
type SkillRef = { name?: string; title?: string };
type ReadSkillOutput = {
  ok?: boolean;
  error?: string;
  skill?: string;
  reference?: string;
  title?: string;
  description?: string;
  content?: string;
  references?: SkillRef[];
  available_references?: SkillRef[];
};

function refNames(list?: SkillRef[]): string[] {
  if (!Array.isArray(list)) return [];
  return list.map((r) => (typeof r.name === "string" ? r.name.trim() : "")).filter(Boolean);
}

export function ReadSkillToolUI({ msg, assistantLabel = "Assistant", assistantColor, showAvatar = false, generating = false }: ToolUIProps) {
  const hasError = Boolean(msg.toolError);
  const input = parseJsonObject<ReadSkillInput>(msg.toolInput) ?? {};
  const output = parseJsonObject<ReadSkillOutput>(msg.toolOutput);
  const failed = hasError || output?.ok === false;
  const running = isToolRunning(msg, generating);

  const skillName = (output?.skill || input.name || "").trim();
  const reference = (output?.reference || input.reference || "").trim();
  const available = refNames(output?.references ?? output?.available_references);
  const content = output?.content?.trim() || "";
  const body = failed ? (output?.error ?? (typeof msg.toolError === "string" ? msg.toolError : null) ?? "Failed to read skill") : content;

  const verb = (() => {
    if (failed) return "Failed to read skill";
    if (running) return reference ? "Reading ref" : "Reading skill";
    return reference ? "Read skill ref" : "Read skill";
  })();

  const targetLabel = (() => {
    if (!skillName && !reference) return null;
    if (reference) return skillName ? `${skillName} / ${reference}` : reference;
    return skillName || null;
  })();

  return (
    <div className={`${chatRowClass} animate-fadeIn`}>
      <ToolUiBadge show={showAvatar} label={assistantLabel} color={assistantColor} />
      <details className="group/readskill px-4" style={{ overflowAnchor: "none" }}>
        <summary className={cn(chatToolLineClass, "cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden")}>
          <Icon name={reference ? "document" : "book"} size={13} className="shrink-0 text-muted-foreground" />
          <Shimmer active={running} className="min-w-0 truncate font-medium text-muted-foreground">
            {verb}
            {targetLabel ? <span className="text-tertiary-foreground"> {targetLabel}</span> : null}
          </Shimmer>
          <ToolUiTrailing failed={failed} chevron chevronClassName="group-hover/readskill:opacity-100 group-open/readskill:opacity-100 group-open/readskill:rotate-90" />
        </summary>
        {body ? (
          <pre className={cn("m-0 mt-1.5 mb-1 max-h-40 overflow-y-auto rounded-lg border px-3 py-2 font-mono text-sm font-normal leading-[1.65] break-all whitespace-pre-wrap", failed ? "border-destructive/35 bg-destructive/6 text-destructive" : "border-border bg-card text-muted-foreground")}>{body}</pre>
        ) : null}
        {!running && !reference && available.length > 0 ? (
          <div className="mt-0.5 mb-1 flex flex-wrap items-center gap-1">
            <span className="text-sm font-medium tracking-wide text-quaternary-foreground uppercase">Refs</span>
            {available.map((name) => (
              <span key={name} className="inline-flex max-w-full items-center rounded-md border border-border-secondary bg-muted/40 px-1.5 py-0.5 font-mono text-sm leading-[1.4] text-tertiary-foreground">
                {skillName ? `${skillName} / ${name}` : name}
              </span>
            ))}
          </div>
        ) : null}
      </details>
    </div>
  );
}
