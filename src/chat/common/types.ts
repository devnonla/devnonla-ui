export type AgentMessageRole = "user" | "assistant" | "thinking" | "tool-call" | "error";

export type AgentMessage = {
  id: string;
  role: AgentMessageRole;
  content: string;
  streaming?: boolean;
  timestamp: Date;
  toolCallId?: string;
  toolName?: string;
  toolLabel?: string;
  toolInput?: unknown;
  toolOutput?: unknown;
  toolError?: boolean | string;
  meta?: {
    thinking?: string;
    thinkingDuration?: number;
  };
};

export type AgentHistoryMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
  | {
      role: "tool-call";
      content: "";
      toolCallId?: string;
      toolName?: string;
      toolInput?: unknown;
      toolOutput?: unknown;
    };

export type AgentStreamRequest = {
  messages: AgentHistoryMessage[];
  signal: AbortSignal;
};

/** POST URL, or a function that returns an SSE `Response`. */
export type AgentPanelEndpoint = string | ((req: AgentStreamRequest) => Promise<Response>);

/** Exact name, aliases, predicate, or omit/`*` for every tool. */
export type AgentToolNameMatch = string | readonly string[] | ((toolName: string) => boolean);

export type AgentToolCallEvent = {
  toolCallId?: string;
  toolName: string;
  toolLabel: string;
  input: unknown;
};

export type AgentToolResultEvent = {
  toolCallId?: string;
  toolName: string;
  output: unknown;
  /** Set when the tool ended without a real result (cancel, disconnect, timeout). */
  error?: string;
};

/** Named tool lifecycle hooks. Omit `name` (or use `"*"`) to match every tool. */
export type AgentToolHook = {
  name?: AgentToolNameMatch;
  onCall?: (event: AgentToolCallEvent) => void;
  onResult?: (event: AgentToolResultEvent) => void;
};
