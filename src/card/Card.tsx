import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

/** Hairline used by the dashboard card ring and row rules (`--nonla-hairline`). */
const HAIRLINE = "var(--nonla-hairline)";

export type CardProps = HTMLAttributes<HTMLElement> & {
  /** Section label above the surface. */
  title?: ReactNode;
  /** Note under the surface, such as a “Learn more” link. */
  caption?: ReactNode;
};

export type CardItemProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  description?: ReactNode;
  /**
   * `start` — label and control align to the top (rows with a description).
   * `center` — short rows, control vertically centered with the label.
   */
  align?: "start" | "center";
  /** Split the row in half so a field can fill the trailing column. */
  split?: boolean;
};

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

function CardRoot({ title, caption, className, children, ...rest }: CardProps) {
  return (
    <section className={cn("flex flex-col gap-[9px]", className)} {...rest}>
      {title != null && title !== "" ? <div className="px-2 text-sm leading-4 text-foreground">{title}</div> : null}
      <div className="flex flex-col self-stretch rounded-xl bg-card" style={{ boxShadow: `0 0 0 1px ${HAIRLINE}` }}>
        {children}
      </div>
      {caption != null && caption !== "" ? <div className="px-3 text-xs leading-4 text-tertiary-foreground">{caption}</div> : null}
    </section>
  );
}

function CardItem({ label, description, align = "start", split = false, className, children, ...rest }: CardItemProps) {
  const hasCopy = (label != null && label !== "") || (description != null && description !== "");
  const centered = align === "center";

  return (
    <div
      className={cn(
        "relative flex w-full gap-5 px-4 py-3",
        centered ? "items-center" : "items-start",
        "before:pointer-events-none before:absolute before:top-0 before:right-4 before:left-4 before:h-px before:bg-hairline before:content-[''] first:before:hidden",
        className,
      )}
      {...rest}
    >
      {hasCopy ? (
        <>
          <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5", centered && "justify-center")}>
            {label != null && label !== "" ? <div className="flex items-center gap-1 text-sm leading-5 text-foreground">{label}</div> : null}
            {description != null && description !== "" ? <div className="text-sm text-muted-foreground">{description}</div> : null}
          </div>
          {children != null ? (
            <div className={cn("flex min-h-6 min-w-0 justify-end gap-2 text-sm text-foreground", split ? "flex-1" : "shrink-0", centered ? "items-center self-center" : "items-start self-stretch pt-[3px]")}>{children}</div>
          ) : null}
        </>
      ) : (
        children
      )}
    </div>
  );
}

function CardFooter({ className, children, ...rest }: CardFooterProps) {
  return (
    <div className={cn("flex justify-end gap-2 py-4 pr-4", className)} {...rest}>
      {children}
    </div>
  );
}

/** Settings surface — title outside, rows inside, caption underneath. */
export const Card = Object.assign(CardRoot, { Item: CardItem, Footer: CardFooter });
export { CardFooter, CardItem };
