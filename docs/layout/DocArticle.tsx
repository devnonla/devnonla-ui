import { Button, cn } from "@nonla-agents/ui";
import { type ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { docNeighbors } from "../nav";

export function DocArticle({
  title,
  flush,
  wide,
  className,
  children,
}: {
  title: string;
  flush?: boolean;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} · NonlaUI`;
  }, [title]);

  if (flush) {
    return <div className={cn("h-full min-h-0", className)}>{children}</div>;
  }

  return (
    <article className={cn("mx-auto px-6 py-10 md:px-10", wide ? "max-w-6xl" : "max-w-3xl", className)}>
      {children}
      <DocPager />
    </article>
  );
}

function PagerButton({
  to,
  align,
  kicker,
  label,
}: {
  to: string;
  align: "start" | "end";
  kicker: string;
  label: string;
}) {
  const navigate = useNavigate();
  return (
    <Button
      type="default"
      href={to}
      className={cn("h-auto min-w-0 flex-1 whitespace-normal py-3", align === "start" ? "justify-start text-left" : "justify-end text-right")}
      style={{ height: "auto" }}
      classNames={{ content: cn("w-full min-w-0 flex-col gap-1", align === "start" ? "items-start" : "items-end") }}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
    >
      <span className="text-[11px] uppercase tracking-wider text-quaternary-foreground">{kicker}</span>
      <span className="max-w-full truncate font-medium">{label}</span>
    </Button>
  );
}

function DocPager() {
  const { pathname } = useLocation();
  const { prev, next } = docNeighbors(pathname);
  if (!prev && !next) return null;

  return (
    <nav aria-label="Page" className="mt-12 flex items-stretch gap-3 border-t border-border pt-6">
      {prev ? <PagerButton to={prev.path} align="start" kicker="Previous" label={prev.label} /> : <span className="flex-1" />}
      {next ? <PagerButton to={next.path} align="end" kicker="Next" label={next.label} /> : null}
    </nav>
  );
}
