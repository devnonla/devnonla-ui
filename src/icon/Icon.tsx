import { cn } from "../lib/cn";
import { ICON_GLYPHS, type IconName } from "./glyphs";

export type { IconName };

export function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && value in ICON_GLYPHS;
}

/** Rendered line weight in CSS px. Measured against Claude desktop: about 1.25px at every size. */
const OPTICAL_STROKE_PX = 1.25;

/** Line weight in the 24 viewBox that renders `OPTICAL_STROKE_PX`, clamped so tiny icons stay open and large ones stay light. */
function opticalStroke(size: number): number {
  const raw = (OPTICAL_STROKE_PX * 24) / size;
  return Math.round(Math.min(2.25, Math.max(1.25, raw)) * 100) / 100;
}

export function Icon({
  name,
  size = 16,
  stroke,
  className,
}: {
  name: IconName;
  size?: number;
  /** Line weight in the 24 viewBox. Default keeps about 1.25px on screen at any `size` (1.88 at 16px, 1.25 at 24px). */
  stroke?: number;
  className?: string;
}) {
  const weight = stroke ?? opticalStroke(size);
  const glyph = ICON_GLYPHS[name].replaceAll('stroke-width="1.5"', `stroke-width="${weight}"`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision">${glyph}</svg>`;
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
