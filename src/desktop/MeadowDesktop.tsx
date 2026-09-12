import type { ReactNode } from "react";
import { MeadowWallpaper } from "./MeadowWallpaper";

export function MeadowDesktop({ children, src }: { children?: ReactNode; src?: string }) {
  return (
    <div className="absolute inset-0 bg-meadow">
      <MeadowWallpaper src={src} />
      <div className="absolute inset-x-0 bottom-0 top-desktop-bar z-20">
        <nav aria-label="Desktop" className="absolute inset-0 overflow-auto px-3 pt-8 pb-3">
          <div className="flex h-full flex-col flex-wrap content-start gap-x-2 gap-y-3">{children}</div>
        </nav>
      </div>
    </div>
  );
}
