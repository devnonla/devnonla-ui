import type { ComponentType } from "react";
import type { AgentToolNameMatch } from "../common/types";
import { isCallAgentToolName, matchesToolName } from "../common/utils";
import { CallAgentToolUI } from "./CallAgentToolUI";
import { GetCurrentTimeToolUI } from "./GetCurrentTimeToolUI";
import { ReadSkillToolUI } from "./ReadSkillToolUI";
import { RunJsToolUI } from "./RunJsToolUI";
import type { ToolUIProps } from "./types";
import { WebFetchToolUI } from "./WebFetchToolUI";

/** Exact name, aliases, or a predicate (e.g. `call_agent__*`). */
export type AgentToolUIName = AgentToolNameMatch;

export type AgentToolUI = {
  name: AgentToolUIName;
  component: ComponentType<ToolUIProps>;
};

export function matchesToolUIName(name: AgentToolUIName, toolName: string): boolean {
  return matchesToolName(name, toolName);
}

export const builtinToolUis: AgentToolUI[] = [
  { name: isCallAgentToolName, component: CallAgentToolUI },
  { name: ["web_fetch", "fetch_url", "browser"], component: WebFetchToolUI },
  { name: "get_current_time", component: GetCurrentTimeToolUI },
  { name: "read_skill", component: ReadSkillToolUI },
  { name: "run_js", component: RunJsToolUI },
];

/** App `toolUis` win on the same name; builtins are the fallback. */
export function resolveToolUI(toolName: string | null | undefined, extras?: readonly AgentToolUI[] | null): ComponentType<ToolUIProps> | null {
  if (!toolName) return null;
  const lists = extras?.length ? [extras, builtinToolUis] : [builtinToolUis];
  for (const list of lists) {
    for (const entry of list) {
      if (matchesToolUIName(entry.name, toolName)) return entry.component;
    }
  }
  return null;
}
