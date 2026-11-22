import { Fragment, type ReactNode } from "react";
import { Icon } from "../icon/Icon";
import { cn } from "../lib/cn";

export type BreadcrumbItem = {
  title: ReactNode;
  /** Renders a link. */
  href?: string;
  /** Click handler, for client-side routing. */
  onClick?: () => void;
  /** Glyph before the title. */
  icon?: ReactNode;
};

export type BreadcrumbProps = {
  /** Path from the root to the current page. The last item is the current page. */
  items: BreadcrumbItem[];
  /** Between items. Defaults to a small chevron. */
  separator?: ReactNode;
  className?: string;
};

/** Page path for a top bar (measured on Cloudflare): muted 14px ancestors, the current page in 500 weight. */
export function Breadcrumb({ items, separator, className }: BreadcrumbProps) {
  const sep = separator ?? <Icon name="arrow-right" size={14} className="text-quaternary-foreground" />;
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="m-0 flex min-w-0 list-none items-center gap-1.5 p-0 text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          const content = (
            <>
              {item.icon ? <span className="inline-flex shrink-0 items-center [&_svg]:size-4">{item.icon}</span> : null}
              <span className="truncate">{item.title}</span>
            </>
          );
          const base = "inline-flex min-w-0 items-center gap-1.5";
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: a path is ordered and short
            <Fragment key={i}>
              <li className={cn("min-w-0", last ? "shrink-0" : "shrink")}>
                {last ? (
                  <span aria-current="page" className={cn(base, "font-medium text-foreground")}>
                    {content}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    onClick={
                      item.onClick
                        ? (e) => {
                            e.preventDefault();
                            item.onClick?.();
                          }
                        : undefined
                    }
                    className={cn(base, "rounded-sm text-muted-foreground no-underline transition-colors hover:text-foreground")}
                  >
                    {content}
                  </a>
                ) : item.onClick ? (
                  <button type="button" onClick={item.onClick} className={cn(base, "cursor-pointer rounded-sm border-0 bg-transparent p-0 font-[inherit] text-muted-foreground transition-colors hover:text-foreground")}>
                    {content}
                  </button>
                ) : (
                  <span className={cn(base, "text-muted-foreground")}>{content}</span>
                )}
              </li>
              {last ? null : (
                <li aria-hidden className="inline-flex shrink-0 items-center">
                  {sep}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
