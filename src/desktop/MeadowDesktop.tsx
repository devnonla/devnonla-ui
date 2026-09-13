import type { ReactNode } from "react";
import { MeadowWallpaper } from "./MeadowWallpaper";

export function MeadowDesktop({ children, src }: { children?: ReactNode; src?: string }) {
  return (
    <div className="absolute inset-0 bg-meadow">
      <MeadowWallpaper src={src} />
      <div className="nonla-desktop-layer absolute inset-x-0 bottom-0 top-desktop-bar">
        <nav aria-label="Desktop" className="absolute inset-0 overflow-auto pl-0 pr-3 pt-3 pb-3">
          <div className="flex h-full flex-col flex-wrap content-start gap-x-2 gap-y-3">{children}</div>
        </nav>
      </div>
    </div>
  );
}
