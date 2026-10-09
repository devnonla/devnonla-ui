import { cn } from "../lib/cn";
import { ICON_GLYPHS, type IconName } from "./glyphs";

export type { IconName };

export function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in ICON_GLYPHS;
}

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">${ICON_GLYPHS[name]}</svg>`;
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 select-none text-current pointer-events-none [&_svg]:size-full", className)}
      style={{ width: size, height: size }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: glyph markup is a fixed set shipped with the library
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
