import type { ReactNode } from "react";
import { DesktopStage } from "./DesktopStage";
import { MeadowWallpaper } from "./MeadowWallpaper";

export function MeadowShell({ children }: { children: ReactNode }) {
  return (
    <DesktopStage>
      <MeadowWallpaper />
      <div className="relative z-10 flex h-full items-center justify-center overflow-y-auto p-6">{children}</div>
    </DesktopStage>
  );
}
