export type ChatBgTaskStatus = "running" | "completed" | "failed" | "cancelled" | "expired";

export type ChatBgTask = {
  taskId: string;
  toolId?: string;
  toolName: string;
  conversationId?: string | null;
  status: ChatBgTaskStatus;
  startedAt: number;
  finishedAt?: number;
  error?: string;
  console?: string;
  result?: unknown;
};

export function parseBgTaskRef(output: unknown): { taskId: string; toolName?: string } | null {
  if (output == null) return null;
  let parsed: unknown = output;
  if (typeof output === "string") {
    try {
      parsed = JSON.parse(output);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  const rec = parsed as Record<string, unknown>;
  if (rec.status !== "running" || typeof rec.taskId !== "string" || !rec.taskId) return null;
  return { taskId: rec.taskId, toolName: typeof rec.toolName === "string" ? rec.toolName : undefined };
}

export function formatBgElapsed(startedAt: number, now: number, finishedAt?: number): string {
  const end = finishedAt && finishedAt > startedAt ? finishedAt : now;
  const sec = Math.max(0, Math.floor((end - startedAt) / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  if (min < 60) return rem ? `${min}m ${rem}s` : `${min}m`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}
