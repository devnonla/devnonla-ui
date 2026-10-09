import { OverlayScroll, ThemeSwitcher } from "@nonla-agents/ui";
import { Link, Outlet, useLocation } from "react-router-dom";
import { isFlushDoc } from "../catalog";
import { GITHUB_REPO } from "../nav";
import { DocsSidebar } from "./DocsSidebar";

export function DocsLayout() {
  const { pathname } = useLocation();
  const flush = isFlushDoc(pathname);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <Link to="/introduction" className="text-sm font-semibold text-foreground no-underline">
          NonlaUI
        </Link>
        <div className="flex items-center gap-1">
          <ThemeSwitcher />
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-7 items-center rounded-md px-2.5 text-sm font-medium text-foreground/85 no-underline hover:bg-ink-hover hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-sidebar">
          <DocsSidebar />
        </aside>
        {flush ? (
          <div className="min-w-0 flex-1 overflow-hidden">
            <Outlet />
          </div>
        ) : (
          <OverlayScroll className="min-w-0 flex-1">
            <Outlet />
          </OverlayScroll>
        )}
      </div>
    </div>
  );
}
