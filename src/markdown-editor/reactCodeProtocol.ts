import type { NonlaColorMode } from "../theme";

/** Message tag shared by the sandbox host (`ReactCodeSandbox`) and the runner page. */
export const REACT_CODE_SOURCE = "nonla-react-code";

export type HostMessage =
  | { source: typeof REACT_CODE_SOURCE; type: "run"; code: string; mode: NonlaColorMode }
  | { source: typeof REACT_CODE_SOURCE; type: "mode"; mode: NonlaColorMode };

export type RunnerMessage =
  | { source: typeof REACT_CODE_SOURCE; type: "ready" }
  | { source: typeof REACT_CODE_SOURCE; type: "rendered" }
  | { source: typeof REACT_CODE_SOURCE; type: "resize"; height: number }
  | { source: typeof REACT_CODE_SOURCE; type: "error"; message: string };

/** A runner message without the shared tag. */
export type RunnerPayload = RunnerMessage extends infer M ? (M extends RunnerMessage ? Omit<M, "source"> : never) : never;

/** Anything from the iframe is untrusted, so check the shape before using it. */
export function readRunnerMessage(data: unknown): RunnerMessage | null {
  if (typeof data !== "object" || data === null) return null;
  const msg = data as Record<string, unknown>;
  if (msg.source !== REACT_CODE_SOURCE) return null;
  if (msg.type === "ready" || msg.type === "rendered") return { source: REACT_CODE_SOURCE, type: msg.type };
  if (msg.type === "resize" && typeof msg.height === "number" && Number.isFinite(msg.height)) {
    return { source: REACT_CODE_SOURCE, type: "resize", height: msg.height };
  }
  if (msg.type === "error" && typeof msg.message === "string") {
    return { source: REACT_CODE_SOURCE, type: "error", message: msg.message.slice(0, 300) };
  }
  return null;
}

function readMode(value: unknown): NonlaColorMode | null {
  return value === "light" || value === "dark" ? value : null;
}

export function readHostMessage(data: unknown): HostMessage | null {
  if (typeof data !== "object" || data === null) return null;
  const msg = data as Record<string, unknown>;
  if (msg.source !== REACT_CODE_SOURCE) return null;
  const mode = readMode(msg.mode);
  if (!mode) return null;
  if (msg.type === "mode") return { source: REACT_CODE_SOURCE, type: "mode", mode };
  if (msg.type === "run" && typeof msg.code === "string") return { source: REACT_CODE_SOURCE, type: "run", code: msg.code, mode };
  return null;
}
