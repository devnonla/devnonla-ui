import { FluentIcon } from "../../icon/FluentIcon";
import { cn } from "../../lib/cn";
import { CodeBlock } from "../../codeblock/CodeBlock";
import { Shimmer } from "../../shimmer/Shimmer";
import { parseBgTaskRef } from "../common/bgTasks";
import { parseJsonObject, prettyJson } from "../common/utils";
import { ChatSpinner } from "../message-ui/ChatSpinner";
import { BackgroundTaskToolUI } from "./BackgroundTaskToolUI";
import { ToolUiBadge } from "./ToolUiBadge";
import { ToolUiTrailing } from "./ToolUiTrailing";
import { isToolRunning, type ToolUIProps } from "./types";

type JsInput = { code?: string };
type JsOutput = {
  ok?: boolean;
  result?: unknown;
  error?: string;
  console?: string;
};

function extractCode(input: unknown): string {
  const parsed = parseJsonObject<JsInput>(input);
  if (parsed?.code && typeof parsed.code === "string") return parsed.code;
  if (typeof input === "string") return input;
  return "";
}

function resultText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  if (typeof value === "number" || typeof value === "boolean" || value === null) return String(value);
  return prettyJson(value);
}

function SandboxOutput({
  running,
  failed,
  consoleOut,
  result,
}: {
  running: boolean;
  failed: boolean;
  consoleOut: string | null;
  result: unknown;
}) {
  if (running) {
    return (
      <div className="flex items-center gap-2 border-t border-border px-3 py-2 text-[13px] text-muted-foreground">
        <ChatSpinner />
        <Shimmer>Running…</Shimmer>
      </div>
    );
  }

  return (
    <div className={cn("max-h-40 overflow-y-auto border-t px-3 py-2 font-mono text-[13px] leading-[1.65]", failed ? "border-destructive/35 bg-destructive/6" : "border-border")}>
      {consoleOut ? <pre className="m-0 whitespace-pre-wrap break-all text-tertiary-foreground">{consoleOut}</pre> : null}
      {failed ? (
        <pre className={cn("m-0 whitespace-pre-wrap break-all text-destructive", consoleOut && "mt-1")}>{resultText(result)}</pre>
      ) : (
        <div className={cn("flex gap-1.5 whitespace-pre-wrap break-all text-foreground", consoleOut && "mt-1")}>
          <span className="shrink-0 select-none text-quaternary-foreground">{"=>"}</span>
          <span>{resultText(result)}</span>
        </div>
      )}
    </div>
  );
}

export function RunJsToolUI({ msg, assistantLabel = "Assistant", assistantColor, showAvatar = false, generating = false }: ToolUIProps) {
  if (parseBgTaskRef(msg.toolOutput)) {
    return <BackgroundTaskToolUI msg={msg} assistantLabel={assistantLabel} assistantColor={assistantColor} showAvatar={showAvatar} />;
  }

  const hasError = Boolean(msg.toolError);
  const code = extractCode(msg.toolInput);
  const output = parseJsonObject<JsOutput>(msg.toolOutput);
  const running = isToolRunning(msg, generating);
  const failed = hasError || output?.ok === false;
  const consoleOut = output?.console?.trim() || null;
  const resultBody = failed ? (output?.error ?? (typeof msg.toolError === "string" ? msg.toolError : null) ?? "Execution failed") : output && "result" in output ? output.result : undefined;
  const showOutput = running || failed || consoleOut != null || (output != null && "result" in output);
  const verb = failed ? "JS failed" : running ? "Running JS" : "Ran JS";

  return (
    <div className="mt-1 animate-fadeIn">
      <ToolUiBadge show={showAvatar} label={assistantLabel} color={assistantColor} />
      <details className="group/runjs px-4 pb-2" style={{ overflowAnchor: "none" }}>
        <summary className="flex cursor-pointer list-none items-center gap-2 py-0.5 text-[14px] leading-5.5 select-none [&::-webkit-details-marker]:hidden">
          <FluentIcon name="code-24" size={13} className="shrink-0 text-muted-foreground" />
          <Shimmer active={running} className="min-w-0 truncate font-medium text-muted-foreground">{verb}</Shimmer>
          <ToolUiTrailing running={running} failed={failed} chevron chevronClassName="group-hover/runjs:opacity-100 group-open/runjs:opacity-100 group-open/runjs:rotate-90" />
        </summary>

        {code ? (
          <CodeBlock code={code} language="javascript" title="JS" className={cn("mt-1.5 mb-1", failed && "border-destructive/35")}>
            {showOutput ? <SandboxOutput running={running} failed={failed} consoleOut={consoleOut} result={resultBody} /> : null}
          </CodeBlock>
        ) : showOutput ? (
          <div className={cn("mt-1.5 mb-1 overflow-hidden rounded-lg border", failed ? "border-destructive/35" : "border-(--popper-border)")}>
            <SandboxOutput running={running} failed={failed} consoleOut={consoleOut} result={resultBody} />
          </div>
        ) : null}
      </details>
    </div>
  );
}
