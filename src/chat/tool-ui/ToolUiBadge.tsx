export function ToolUiBadge({ show = false, label, color }: { show?: boolean; label: string; color?: string | null }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-2.5 px-4 pt-3 pb-1">
      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase select-none" style={{ background: color ?? "var(--primary)", color: "var(--primary-foreground)", letterSpacing: "0.08em" }}>
        {label}
      </span>
    </div>
  );
}
