import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: ReactNode;
  /** Muted line under the title. */
  description?: ReactNode;
  /** Beside the title: a docs link, a status tag. */
  meta?: ReactNode;
  /** Right side: page actions (buttons, a date range). */
  extra?: ReactNode;
  /** Full-width hairline under the header. Default `true`. */
  bordered?: boolean;
};

/** Page title row — title, meta, description, and actions on the right, over a hairline. */
export function PageHeader({ title, description, meta, extra, bordered = true, className, children, ...rest }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 pb-5", bordered && "border-b border-solid border-border", className)} {...rest}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="m-0 text-lg leading-7 font-semibold text-foreground">{title}</h1>
            {meta}
          </div>
          {description != null && description !== "" ? <p className="m-0 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {extra != null ? <div className="flex shrink-0 items-center gap-2">{extra}</div> : null}
      </div>
      {children}
    </header>
  );
}
