import { type ReactNode, useState } from "react";
import { cn, focusRing } from "../lib/cn";

export type AlertType = "success" | "info" | "warning" | "error";

export type AlertProps = {
  type?: AlertType;
  /** Primary text — `message` / `title`. */
  message?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  showIcon?: boolean;
  closable?: boolean | { onClose?: () => void };
  onClose?: () => void;
  className?: string;
  children?: ReactNode;
};

const TYPE_STYLES: Record<AlertType, string> = {
  success: "border-success-border bg-success-bg text-foreground",
  info: "border-info-border bg-info-bg text-foreground",
  warning: "border-warn-border bg-warn-bg text-foreground",
  error: "border-destructive-border bg-destructive-bg text-foreground",
};

/** Solid marks: the role fill, with the glyph cut out in that role's label color. Reads cleaner at 16px than thin outlines. */
const ICON_TONE: Record<AlertType, { shape: string; stroke: string; dot: string }> = {
  success: { shape: "fill-success-fill", stroke: "stroke-on-success", dot: "fill-on-success" },
  info: { shape: "fill-info-fill", stroke: "stroke-on-info", dot: "fill-on-info" },
  warning: { shape: "fill-warn-fill", stroke: "stroke-(--nonla-warn-mark)", dot: "fill-(--nonla-warn-mark)" },
  error: { shape: "fill-destructive-fill", stroke: "stroke-on-destructive", dot: "fill-on-destructive" },
};

function AlertIcon({ type }: { type: AlertType }) {
  const tone = ICON_TONE[type];
  return (
    <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 16 16" aria-hidden>
      {type === "warning" ? (
        // Triangle with soft corners (r 2.4), a touch inside the 16px box so it weighs the same as the discs.
        <path className={tone.shape} d="M9.18 3.69L13.62 11.51Q14.8 13.6 12.4 13.6H3.6Q1.2 13.6 2.38 11.51L6.82 3.69Q8 1.6 9.18 3.69Z" />
      ) : (
        <circle className={tone.shape} cx="8" cy="8" r="7" />
      )}
      <g className={tone.stroke} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {type === "success" ? <path d="M5.25 8.25L7.1 10L10.75 6.25" /> : null}
        {type === "error" ? <path d="M5.9 5.9L10.1 10.1M10.1 5.9L5.9 10.1" /> : null}
        {type === "warning" ? (
          <>
            <path strokeWidth="1.35" d="M8 6.2V8.9" />
            <circle className={tone.dot} stroke="none" cx="8" cy="11.15" r="0.78" />
          </>
        ) : null}
        {type === "info" ? (
          <>
            <circle className={tone.dot} stroke="none" cx="8" cy="4.9" r="0.9" />
            <path d="M8 7.3V11.1" />
          </>
        ) : null}
      </g>
    </svg>
  );
}

export function Alert({
  type = "info",
  message,
  title,
  description,
  showIcon,
  closable,
  onClose,
  className,
  children,
}: AlertProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const heading = title ?? message;
  const canClose = Boolean(closable);
  const handleClose = () => {
    setOpen(false);
    if (typeof closable === "object") closable.onClose?.();
    onClose?.();
  };

  return (
    <div role="alert" className={cn("flex gap-2.5 rounded-lg border border-solid px-3 py-2.5 text-sm", TYPE_STYLES[type], className)}>
      {showIcon ? <AlertIcon type={type} /> : null}
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        {heading != null && heading !== "" ? <div className="font-medium leading-5">{heading}</div> : null}
        {description != null && description !== "" ? <div className="leading-5 text-foreground">{description}</div> : null}
        {children}
      </div>
      {canClose ? (
        <button
          type="button"
          aria-label="Close"
          className={cn("shrink-0 -mr-1 -mt-0.5 inline-flex size-6 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground hover:text-foreground", focusRing, "focus-visible:ring-offset-0")}
          onClick={handleClose}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
