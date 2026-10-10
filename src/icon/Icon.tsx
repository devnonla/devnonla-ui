import { cn } from "../lib/cn";
import { ICON_GLYPHS, type IconName } from "./glyphs";

export type { IconName };

export function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in ICON_GLYPHS;
}

export function Icon({
  name,
  size = 16,
  stroke = 1.5,
  className,
}: {
  name: IconName;
  size?: number;
  /** Line weight in the 24 viewBox. `1.5` is the regular weight. Higher draws a bolder line. */
  stroke?: number;
  className?: string;
}) {
  const glyph = ICON_GLYPHS[name].replaceAll('stroke-width="1.5"', `stroke-width="${stroke}"`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke-width="${stroke}" shape-rendering="geometricPrecision">${glyph}</svg>`;
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center leading-none select-none text-current pointer-events-none", className)}
      style={{ width: size, height: size }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: glyph markup is a fixed set shipped with the library
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
