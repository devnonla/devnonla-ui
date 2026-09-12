export type ChatToolMessage = {
  id?: string;
  toolCallId?: string;
  toolName?: string;
  toolLabel?: string;
  toolInput?: unknown;
  toolOutput?: unknown;
  toolError?: boolean | string;
  timestamp?: Date | string | number;
};

export type ToolUIProps = {
  msg: ChatToolMessage;
  assistantLabel?: string;
  assistantColor?: string | null;
  showAvatar?: boolean;
  generating?: boolean;
};

export function isToolRunning(msg: ChatToolMessage, generating?: boolean) {
  return msg.toolOutput == null && !msg.toolError && Boolean(generating);
}
