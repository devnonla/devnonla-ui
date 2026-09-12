import type { AgentToolNameMatch } from "./types";

/** snake_case / camelCase → Title Case (e.g. edit_code → Edit Code). */
export function formatToolName(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function prettyJson(raw: unknown): string {
  if (typeof raw === "string") {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }
  try {
    return JSON.stringify(raw, null, 2);
  } catch {
    return String(raw);
  }
}

export function hasMeaningfulInput(input: unknown): boolean {
  if (input == null) return false;
  if (typeof input === "string") {
    const trimmed = input.trim();
    return trimmed.length > 0 && trimmed !== "{}" && trimmed !== "[]";
  }
  if (Array.isArray(input)) return input.length > 0;
  if (typeof input === "object") return Object.keys(input as object).length > 0;
  return true;
}

export function parseJsonObject<T extends object>(raw: unknown): T | null {
  if (raw == null) return null;
  if (typeof raw === "object") return raw as T;
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as T;
  } catch {
    /* ignore */
  }
  return null;
}

const CALL_AGENT_PREFIX = "call_agent__";

/** True for legacy `call_agent` and per-target `call_agent__<uuid>` tools. */
export function isCallAgentToolName(name: string | null | undefined): boolean {
  if (!name) return false;
  return name === "call_agent" || name.startsWith(CALL_AGENT_PREFIX);
}

/** Reconstruct target agent UUID from `call_agent__<uuid_with_underscores>`. */
export function parseCallAgentToolTargetId(toolName: string): string | null {
  if (!toolName.startsWith(CALL_AGENT_PREFIX)) return null;
  const parts = toolName.slice(CALL_AGENT_PREFIX.length).split("_");
  if (parts.length !== 5) return null;
  return parts.join("-");
}

export function timestampMs(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Date.now();
}

export function matchesToolName(match: AgentToolNameMatch, toolName: string): boolean {
  if (typeof match === "function") return match(toolName);
  if (typeof match === "string") return match === toolName;
  return match.includes(toolName);
}

export function matchesToolHook(match: AgentToolNameMatch | undefined, toolName: string): boolean {
  if (match == null || match === "*") return true;
  return matchesToolName(match, toolName);
}
