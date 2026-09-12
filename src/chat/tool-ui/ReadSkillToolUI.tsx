import { FluentIcon } from "../../icon/FluentIcon";
import { cn } from "../../lib/cn";
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
    <div className="mt-1 animate-fadeIn">
      <ToolUiBadge show={showAvatar} label={assistantLabel} color={assistantColor} />
      <details className="group/readskill px-4 pb-2" style={{ overflowAnchor: "none" }}>
        <summary className="flex cursor-pointer list-none items-center gap-2 py-0.5 text-[14px] leading-5.5 select-none [&::-webkit-details-marker]:hidden">
          <FluentIcon name={reference ? "document-text-24" : "book-24"} size={13} className="shrink-0 text-muted-foreground" />
          <span className={cn("min-w-0 truncate font-medium text-muted-foreground", running && "nonla-chat-shimmer")}>
            {verb}
            {targetLabel ? <span className="font-normal text-tertiary-foreground"> {targetLabel}</span> : null}
          </span>
          <ToolUiTrailing running={running} failed={failed} chevron chevronClassName="group-hover/readskill:opacity-100 group-open/readskill:opacity-100 group-open/readskill:rotate-90" />
        </summary>
        {body ? (
          <pre className={cn("m-0 mt-1.5 mb-1 max-h-40 overflow-y-auto rounded-lg border px-3 py-2 font-mono text-[14px] font-normal leading-[1.65] break-all whitespace-pre-wrap", failed ? "border-destructive/35 bg-destructive/6 text-destructive" : "border-(--popper-border) bg-(--nonla-elevated) text-muted-foreground")}>{body}</pre>
        ) : null}
        {!running && !reference && available.length > 0 ? (
          <div className="mt-0.5 mb-1 flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-medium tracking-wide text-quaternary-foreground uppercase">Refs</span>
            {available.map((name) => (
              <span key={name} className="inline-flex max-w-full items-center rounded-md border border-border-subtle bg-muted/40 px-1.5 py-0.5 font-mono text-[14px] leading-[1.4] text-tertiary-foreground">
                {skillName ? `${skillName} / ${name}` : name}
              </span>
            ))}
          </div>
        ) : null}
      </details>
    </div>
  );
}
