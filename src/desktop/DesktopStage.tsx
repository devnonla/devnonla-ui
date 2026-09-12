import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function DesktopStage({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("relative h-dvh w-screen overflow-hidden bg-meadow", className)}>{children}</div>;
}
