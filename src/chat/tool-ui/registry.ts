import type { ComponentType } from "react";
import { isCallAgentToolName } from "../common/utils";
import { CallAgentToolUI } from "./CallAgentToolUI";
import { GetCurrentTimeToolUI } from "./GetCurrentTimeToolUI";
import { ReadSkillToolUI } from "./ReadSkillToolUI";
import { RunJsToolUI } from "./RunJsToolUI";
import type { ToolUIProps } from "./types";
import { WebFetchToolUI } from "./WebFetchToolUI";

type ToolUIEntry = {
  match: (toolName: string) => boolean;
  component: ComponentType<ToolUIProps>;
};

const TOOL_UIS: ToolUIEntry[] = [
  { match: isCallAgentToolName, component: CallAgentToolUI },
  { match: (n) => n === "web_fetch" || n === "fetch_url" || n === "browser", component: WebFetchToolUI },
  { match: (n) => n === "get_current_time", component: GetCurrentTimeToolUI },
  { match: (n) => n === "read_skill", component: ReadSkillToolUI },
  { match: (n) => n === "run_js", component: RunJsToolUI },
];

export function resolveToolUI(toolName: string | null | undefined): ComponentType<ToolUIProps> | null {
  if (!toolName) return null;
  for (const entry of TOOL_UIS) {
    if (entry.match(toolName)) return entry.component;
  }
  return null;
}
