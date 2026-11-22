import type { ComponentType } from "react";
import type { AgentToolNameMatch } from "../common/types";
import { matchesToolName } from "../common/utils";
import type { ToolUIProps } from "./types";

/** Exact name, aliases, or a predicate. */
export type AgentToolUIName = AgentToolNameMatch;

export type AgentToolUI = {
  name: AgentToolUIName;
  component: ComponentType<ToolUIProps>;
};

export function matchesToolUIName(name: AgentToolUIName, toolName: string): boolean {
  return matchesToolName(name, toolName);
}

/** First app `toolUis` entry whose name matches. No match falls back to `ChatToolCall`. */
export function resolveToolUI(toolName: string | null | undefined, toolUis?: readonly AgentToolUI[] | null): ComponentType<ToolUIProps> | null {
  if (!toolName || !toolUis?.length) return null;
  for (const entry of toolUis) {
    if (matchesToolUIName(entry.name, toolName)) return entry.component;
  }
  return null;
}
