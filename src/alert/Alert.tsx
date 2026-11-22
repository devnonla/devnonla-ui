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
  info: "border-link-border bg-link-bg text-foreground",
  warning: "border-warn-border bg-warn-bg text-foreground",
  error: "border-destructive-border bg-destructive-bg text-foreground",
};

const ICON_COLOR: Record<AlertType, string> = {
  success: "text-success",
  info: "text-link",
  warning: "text-warn",
  error: "text-destructive",
};

function AlertIcon({ type }: { type: AlertType }) {
  const cls = cn("size-4 shrink-0 mt-0.5", ICON_COLOR[type]);
  if (type === "success") {
    return (
      <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4.8 8.2L6.9 10.2L11.2 5.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "warning") {
    return (
      <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 2.2L14.2 13.2H1.8L8 2.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 6.2V9.2M8 11V11.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7.2V11.2M8 4.8V5.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
