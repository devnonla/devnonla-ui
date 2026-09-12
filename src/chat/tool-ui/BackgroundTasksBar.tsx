import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FluentIcon } from "../../icon/FluentIcon";
import { cn } from "../../lib/cn";
import { Modal } from "../../modal/Modal";
import { Popconfirm } from "../../popconfirm/Popconfirm";
import type { ChatBgTask } from "../common/bgTasks";
import { formatBgElapsed } from "../common/bgTasks";
import { formatToolName } from "../common/utils";
import { ChatSpinner } from "../message-ui/ChatSpinner";

function TaskLogsModal({
  task,
  open,
  onClose,
}: {
  task: ChatBgTask | null;
  open: boolean;
  onClose: () => void;
}) {
  const logs = (task?.console ?? "").trim();
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const el = preRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <Modal open={open} onCancel={onClose} footer={null} title={task ? formatToolName(task.toolName) : "Logs"} width={560}>
      <pre ref={preRef} className="m-0 max-h-[50vh] overflow-auto rounded-md border border-border-subtle bg-muted px-3 py-2 font-mono text-[14px] leading-relaxed whitespace-pre-wrap break-all text-foreground">
        {logs || "Waiting for output…"}
      </pre>
    </Modal>
  );
}

function TaskRow({
  task,
  now,
  cancelling,
  onCancel,
  onLogs,
}: {
  task: ChatBgTask;
  now: number;
  cancelling: boolean;
  onCancel: () => void;
  onLogs: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1">
      <ChatSpinner className="size-2.5" />
      <div className="min-w-0 flex-1 truncate text-[14px] text-foreground">{formatToolName(task.toolName)}</div>
      <span className="shrink-0 text-[14px] tabular-nums text-muted-foreground">{formatBgElapsed(task.startedAt, now)}</span>
      <button type="button" onClick={onLogs} title="Logs" aria-label={`Logs ${formatToolName(task.toolName)}`} className="inline-flex size-5 shrink-0 items-center justify-center cursor-pointer rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
        <FluentIcon name="document-text-24" size={12} />
      </button>
      <Popconfirm title={`Stop ${formatToolName(task.toolName)}?`} okText="Stop" okType="danger" onConfirm={onCancel} getPopupContainer={() => document.body}>
        <button type="button" disabled={cancelling} title="Stop" aria-label={`Stop ${formatToolName(task.toolName)}`} className="inline-flex h-5 shrink-0 items-center rounded px-1.5 text-[10px] cursor-pointer text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive disabled:opacity-40">
          Stop
        </button>
      </Popconfirm>
    </div>
  );
}

export type BackgroundTasksBarProps = {
  children: ReactNode;
  tasks?: ChatBgTask[];
  cancellingIds?: ReadonlySet<string>;
  onCancel?: (taskId: string) => void | Promise<void>;
};

export function BackgroundTasksBar({ children, tasks = [], cancellingIds, onCancel }: BackgroundTasksBarProps) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [logsTaskId, setLogsTaskId] = useState<string | null>(null);
  const logsTask = logsTaskId ? (tasks.find((t) => t.taskId === logsTaskId) ?? null) : null;

  useEffect(() => {
    if (logsTaskId && !tasks.some((t) => t.taskId === logsTaskId)) {
      setLogsTaskId(null);
    }
  }, [tasks, logsTaskId]);

  useEffect(() => {
    if (tasks.length === 0) {
      setOpen(false);
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [tasks.length]);

  const listInnerRef = useRef<HTMLDivElement>(null);
  const [listH, setListH] = useState(0);

  useLayoutEffect(() => {
    const el = listInnerRef.current;
    if (!el) {
      setListH(0);
      return;
    }
    const update = () => setListH(el.scrollHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tasks.length, open]);

  const label = tasks.length === 1 ? "1 background task" : `${tasks.length} background tasks`;
  const reserve = tasks.length > 0 ? 28 + (open ? listH : 0) : 0;

  return (
    <>
      <div className="pointer-events-none shrink-0 overflow-hidden transition-[height] duration-200 ease-out" style={{ height: reserve }} aria-hidden />
      <div className="relative">
        {children}

        {tasks.length > 0 ? (
          <div className="absolute right-5 bottom-[calc(100%)] left-5 z-20 overflow-hidden rounded-t-lg border-x border-t border-border">
            <div className={cn("flex h-7.5 items-center gap-1 px-1", open && "border-b border-border-subtle")}>
              <button type="button" onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 font-medium items-center gap-1 rounded-md px-1.5 py-1 text-[14px] text-muted-foreground/90 transition-colors hover:text-foreground" aria-expanded={open} aria-label={label}>
                {open ? <FluentIcon name="arrow-square-down-24" size={12} /> : <FluentIcon name="arrow-square-down-24" size={12} className="-rotate-90" />}
                <span className="truncate">{label}</span>
              </button>
            </div>

            <div className={cn("overflow-hidden transition-[max-height] duration-200 ease-out", open ? "max-h-55" : "max-h-0")}>
              <div ref={listInnerRef} className="max-h-55 overflow-y-auto py-0.5">
                {tasks.map((task) => (
                  <TaskRow
                    key={task.taskId}
                    task={task}
                    now={now}
                    cancelling={cancellingIds?.has(task.taskId) ?? false}
                    onCancel={() => {
                      void onCancel?.(task.taskId);
                    }}
                    onLogs={() => setLogsTaskId(task.taskId)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <TaskLogsModal task={logsTask} open={Boolean(logsTask)} onClose={() => setLogsTaskId(null)} />
    </>
  );
}
