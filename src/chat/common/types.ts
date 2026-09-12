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

export type AgentToolAction =
  | { type: "tool-call"; toolName: string; toolLabel: string; input: unknown }
  | { type: "tool-result"; toolName: string; output: unknown };
