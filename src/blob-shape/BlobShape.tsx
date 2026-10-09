import { type CSSProperties, type ReactNode, useId } from "react";
import { cn } from "../lib/cn";

/**
 * `blob`, `blob-alt`, `ring`, `orb`, `square`, `star`, `circle`, `cursor` are background decorations.
 * `horizontal`, `fade`, `dashed`, `double`, `ornament`, `zigzag`, `wave`, `waves`, `mountain`, `vertical` are thin line dividers.
 */
export type BlobShapeVariant =
  | "blob"
  | "blob-alt"
  | "ring"
  | "orb"
  | "square"
  | "star"
  | "circle"
  | "cursor"
  | "horizontal"
  | "fade"
  | "dashed"
  | "double"
  | "ornament"
  | "zigzag"
  | "wave"
  | "waves"
  | "mountain"
  | "vertical";

type DividerVariant = Extract<BlobShapeVariant, "horizontal" | "fade" | "dashed" | "double" | "ornament" | "zigzag" | "wave" | "waves" | "mountain" | "vertical">;

/** How a closed shape is painted. Dividers are lines, so they ignore it. */
export type BlobShapeAppearance = "solid" | "outline" | "sticker";

export type BlobShapeProps = {
  variant?: BlobShapeVariant;
  /** Fill color, or stroke for `outline` and dividers. Any CSS color works, including `var(--nonla-*)`. Defaults to brand. */
  color?: string;
  /** Width in px or any CSS length. Decorations default to 320. Dividers default to `100%`, and `vertical` defaults to `1`. */
  width?: number | string;
  /** Explicit height. Usually omit it so the aspect ratio holds. */
  height?: number | string;
  /** Opacity from 0 to 1. */
  opacity?: number;
  /** Gaussian blur in px. Softens edges for glow-style backgrounds. */
  blur?: number;
  /** Mirror horizontally. */
  flipX?: boolean;
  /** Mirror vertically. Use it to put a divider on the top edge of a section. */
  flipY?: boolean;
  /** `solid` fills the shape. `outline` strokes its edge. `sticker` adds a white border and a drop shadow. Dividers ignore it. */
  appearance?: BlobShapeAppearance;
  className?: string;
  style?: CSSProperties;
};

const DIVIDER_VARIANTS: ReadonlySet<BlobShapeVariant> = new Set<BlobShapeVariant>([
  "horizontal",
  "fade",
  "dashed",
  "double",
  "ornament",
  "zigzag",
  "wave",
  "waves",
  "mountain",
  "vertical",
]);

/** Box and default size for each divider. Lines keep their stroke in screen pixels, so they stay thin when stretched. */
const DIVIDER_BOX: Record<DividerVariant, { viewBox: string; width: number | string; height?: number | string }> = {
  horizontal: { viewBox: "0 0 1440 1", width: "100%", height: 1 },
  fade: { viewBox: "0 0 1440 1", width: "100%", height: 1 },
  dashed: { viewBox: "0 0 1440 1", width: "100%", height: 1 },
  double: { viewBox: "0 0 1440 5", width: "100%", height: 5 },
  ornament: { viewBox: "0 0 1440 12", width: "100%", height: 12 },
  zigzag: { viewBox: "0 0 1440 8", width: "100%", height: 8 },
  wave: { viewBox: "0 0 1440 40", width: "100%" },
  waves: { viewBox: "0 0 1440 40", width: "100%" },
  mountain: { viewBox: "0 0 1440 40", width: "100%" },
  vertical: { viewBox: "0 0 1 1440", width: 1, height: "100%" },
};

/** Stroke width in screen pixels. */
const LINE_STROKE = 1;
const WAVE_STROKE = 2;

/** One smooth wave: four bumps across the 1440 box, centered on y = 20. */
const WAVE_PATH = "M0,20 C120,0 240,0 360,20 C480,40 600,40 720,20 C840,0 960,0 1080,20 C1200,40 1320,40 1440,20";

/** Front and back ridges of a mountain range, drawn as open lines in the 40-unit box. */
const MOUNTAIN_FRONT = "M0,36 L240,10 L400,26 L600,2 L820,28 L980,8 L1200,30 L1440,18";
const MOUNTAIN_BACK = "M0,26 L160,12 L300,24 L470,6 L640,22 L820,10 L1000,24 L1200,8 L1440,20";

/** Diamond ornament at the center of the `ornament` divider. */
const ORNAMENT_DIAMOND = "M720,1 L726,6 L720,11 L714,6 Z";

const BLOB_PATH =
  "M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.5,81.4,29,73.1,41.1C64.8,53.2,53.8,62.9,41.2,70.3C28.6,77.7,14.3,82.8,-0.5,83.7C-15.3,84.6,-30.6,81.3,-43.4,74.2C-56.2,67.1,-66.5,56,-74.8,43.2C-83.1,30.4,-89.4,15.2,-89.4,0C-89.4,-15.2,-83.1,-30.4,-74.3,-42.9C-65.5,-55.4,-54.2,-65.2,-41.4,-72.6C-28.6,-80,-14.3,-85,0.9,-86.3C16.1,-87.6,30.6,-83.6,44.7,-76.4Z";

const BLOB_ALT_PATH = "M-6,-88C48,-92,90,-40,84,8C78,54,36,90,-12,84C-58,78,-90,40,-84,-6C-78,-52,-52,-86,-6,-88Z";

/**
 * Windows-style arrow pointer: vertical left edge, 45-degree right edge, horizontal wing, slanted tail.
 * Sharp corners, drawn on an 11 x 18 grid, scaled 8x and centered in the -100..100 box.
 */
const CURSOR_PATH = "M0,0 L0,16 L4.2,12.2 L6.9,18 L8.6,17.2 L5.9,11.2 L11,11.2 Z";
const CURSOR_SCALE = 8;
const CURSOR_TRANSFORM = "translate(-44 -72) scale(8)";
/** Sticker stroke width in viewBox units. */
const STICKER_STROKE = 8;

const STAR_PATH = "M0.0,-90.0 L23.5,-32.4 L85.6,-27.8 L38.0,12.4 L52.9,72.8 L0.0,40.0 L-52.9,72.8 L-38.0,12.4 L-85.6,-27.8 L-23.5,-32.4 Z";

const f2 = (n: number) => n.toFixed(2);

/** Open smooth line through sampled points, using Catmull-Rom curves converted to cubic Béziers. */
function smoothLine(points: [number, number][]): string {
  let d = `M${f2(points[0][0])},${f2(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${f2(c1x)},${f2(c1y)} ${f2(c2x)},${f2(c2y)} ${f2(p2[0])},${f2(p2[1])}`;
  }
  return d;
}

/** Sine wave across the 1440 box, centered on `base`: one crest every 360 units. */
function sineWave(base: number, amp: number, phase: number): string {
  const points: [number, number][] = [];
  for (let x = 0; x <= 1440; x += 90) {
    points.push([x, base + amp * Math.sin((2 * Math.PI * x) / 360 + phase)]);
  }
  return smoothLine(points);
}

/** Zigzag across the 8-unit box: alternating top and bottom points every 24 units. */
function zigzagPath(): string {
  let d = "M0,7";
  for (let x = 24, i = 0; x <= 1440; x += 24, i++) {
    d += ` L${x},${i % 2 === 0 ? 1 : 7}`;
  }
  return d;
}
const ZIGZAG_PATH = zigzagPath();

/** Three sine waves, out of phase, at decreasing opacity. */
const WAVES_LAYERS: { d: string; opacity: number }[] = [
  { d: sineWave(20, 10, 0), opacity: 1 },
  { d: sineWave(20, 10, 0.9), opacity: 0.55 },
  { d: sineWave(20, 10, 1.8), opacity: 0.25 },
];

/** Edge width of an `outline` shape, in viewBox units. Same as the `ring` stroke. */
const OUTLINE_STROKE = 3;

/** Radius of the disc used for `circle` and `orb` outline and sticker forms. */
const DISC_RADIUS = 88;

type ClosedVariant = Extract<BlobShapeVariant, "blob" | "blob-alt" | "ring" | "orb" | "square" | "star" | "circle" | "cursor">;

const CLOSED_VARIANTS: ReadonlySet<BlobShapeVariant> = new Set<BlobShapeVariant>(["blob", "blob-alt", "ring", "orb", "square", "star", "circle", "cursor"]);

function isClosedVariant(variant: BlobShapeVariant): variant is ClosedVariant {
  return CLOSED_VARIANTS.has(variant);
}

/** Fill and stroke for a closed shape. `strokeWidth` is in viewBox units. */
type Paint = { fill: string; stroke: string; strokeWidth: number };

const solidPaint = (color: string): Paint => ({ fill: color, stroke: "none", strokeWidth: 0 });
const outlinePaint = (color: string): Paint => ({ fill: "none", stroke: color, strokeWidth: OUTLINE_STROKE });

/** Draws one closed shape with the given paint. Used for the shape itself and for its sticker border. */
function closedShape(variant: ClosedVariant, paint: Paint): ReactNode {
  const paintStyle: CSSProperties = { fill: paint.fill, stroke: paint.stroke };
  switch (variant) {
    case "blob":
      return <path d={BLOB_PATH} style={paintStyle} strokeWidth={paint.strokeWidth} />;
    case "blob-alt":
      return <path d={BLOB_ALT_PATH} style={paintStyle} strokeWidth={paint.strokeWidth} />;
    case "ring":
      return <path d={BLOB_PATH} style={paintStyle} strokeWidth={paint.strokeWidth} />;
    case "square":
      return <rect x={-80} y={-80} width={160} height={160} rx={24} style={paintStyle} strokeWidth={paint.strokeWidth} />;
    case "star":
      return <path d={STAR_PATH} style={paintStyle} strokeWidth={paint.strokeWidth} />;
    case "circle":
    case "orb":
      return <circle cx={0} cy={0} r={DISC_RADIUS} style={paintStyle} strokeWidth={paint.strokeWidth} />;
    case "cursor":
      // The transform scales the stroke too, so the stroke width is divided by the scale here.
      return <path d={CURSOR_PATH} transform={CURSOR_TRANSFORM} style={paintStyle} strokeWidth={paint.strokeWidth / CURSOR_SCALE} />;
  }
}

/**
 * Decorative SVG shapes for landing pages.
 * Decorations sit in a `-100 -100 200 200` box. Dividers are thin lines that span the full width or height.
 * Position it with `className` (e.g. `absolute -z-10`). The shape ignores pointer events.
 */
export function BlobShape({ variant = "blob", color = "var(--nonla-brand)", width, height, opacity, blur, flipX, flipY, appearance = "solid", className, style }: BlobShapeProps) {
  const rawId = useId();
  const idKey = rawId.replace(/:/g, "");
  const gradientId = `nonla-blob-${idKey}`;
  const fadeId = `nonla-fade-${idKey}`;
  const divider = DIVIDER_VARIANTS.has(variant);
  const box = divider ? DIVIDER_BOX[variant as DividerVariant] : undefined;
  const fill: CSSProperties = { fill: color };
  const stroke: CSSProperties = { stroke: color };
  const line: CSSProperties = { ...stroke, fill: "none" };

  const transform = [flipX && "scaleX(-1)", flipY && "scaleY(-1)"].filter(Boolean).join(" ");

  // Ring is an outline by nature. The orb glow is a gradient, so only its solid form uses it.
  const paint = appearance === "outline" || variant === "ring" ? outlinePaint(color) : solidPaint(color);
  let shape: ReactNode = null;
  if (variant === "orb" && appearance === "solid") {
    shape = (
      <>
        <defs>
          <radialGradient id={gradientId}>
            <stop offset="0%" stopOpacity={1} style={{ stopColor: color }} />
            <stop offset="100%" stopOpacity={0} style={{ stopColor: color }} />
          </radialGradient>
        </defs>
        <circle cx={0} cy={0} r={100} fill={`url(#${gradientId})`} />
      </>
    );
  } else if (isClosedVariant(variant)) {
    shape = closedShape(variant, paint);
  }

  switch (variant) {
    case "horizontal":
      shape = <line x1={0} y1={0.5} x2={1440} y2={0.5} strokeWidth={LINE_STROKE} vectorEffect="non-scaling-stroke" style={line} />;
      break;
    case "fade":
      shape = (
        <>
          <defs>
            <linearGradient id={fadeId} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={1440} y2={0}>
              <stop offset="0" stopOpacity={0} style={{ stopColor: color }} />
              <stop offset="0.5" stopOpacity={1} style={{ stopColor: color }} />
              <stop offset="1" stopOpacity={0} style={{ stopColor: color }} />
            </linearGradient>
          </defs>
          <line x1={0} y1={0.5} x2={1440} y2={0.5} strokeWidth={LINE_STROKE} vectorEffect="non-scaling-stroke" stroke={`url(#${fadeId})`} fill="none" />
        </>
      );
      break;
    case "dashed":
      shape = <line x1={0} y1={0.5} x2={1440} y2={0.5} strokeWidth={LINE_STROKE} strokeDasharray="6 4" vectorEffect="non-scaling-stroke" style={line} />;
      break;
    case "double":
      shape = (
        <>
          <line x1={0} y1={0.5} x2={1440} y2={0.5} strokeWidth={LINE_STROKE} vectorEffect="non-scaling-stroke" style={line} />
          <line x1={0} y1={4.5} x2={1440} y2={4.5} strokeWidth={LINE_STROKE} vectorEffect="non-scaling-stroke" style={line} />
        </>
      );
      break;
    case "ornament":
      shape = (
        <>
          <line x1={0} y1={6} x2={1440} y2={6} strokeWidth={LINE_STROKE} vectorEffect="non-scaling-stroke" style={line} />
          <path d={ORNAMENT_DIAMOND} style={fill} />
        </>
      );
      break;
    case "zigzag":
      shape = <path d={ZIGZAG_PATH} strokeWidth={LINE_STROKE} strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={line} />;
      break;
    case "wave":
      shape = <path d={WAVE_PATH} strokeWidth={WAVE_STROKE} strokeLinecap="round" vectorEffect="non-scaling-stroke" style={line} />;
      break;
    case "waves":
      shape = WAVES_LAYERS.map((layer) => (
        <path key={layer.d} d={layer.d} strokeWidth={LINE_STROKE} strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ ...line, opacity: layer.opacity }} />
      ));
      break;
    case "mountain":
      shape = (
        <>
          <path d={MOUNTAIN_BACK} strokeWidth={LINE_STROKE} strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ ...line, opacity: 0.4 }} />
          <path d={MOUNTAIN_FRONT} strokeWidth={WAVE_STROKE} strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={line} />
        </>
      );
      break;
    case "vertical":
      shape = <line x1={0.5} y1={0} x2={0.5} y2={1440} strokeWidth={LINE_STROKE} vectorEffect="non-scaling-stroke" style={line} />;
      break;
  }

  // Sticker: a white border under the shape, so only the outer edge shows, plus a soft drop shadow.
  // Dividers have no sticker form.
  if (appearance === "sticker" && isClosedVariant(variant)) {
    const stickerId = `nonla-sticker-${idKey}`;
    const border: Paint = { fill: "#ffffff", stroke: "#ffffff", strokeWidth: paint.strokeWidth + STICKER_STROKE };
    shape = (
      <>
        <defs>
          <filter id={stickerId} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx={0} dy={2} stdDeviation={2} floodColor="#000000" floodOpacity={0.2} />
          </filter>
        </defs>
        <g filter={`url(#${stickerId})`}>{closedShape(variant, border)}</g>
        {shape}
      </>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={box?.viewBox ?? "-100 -100 200 200"}
      preserveAspectRatio={divider ? "none" : undefined}
      width={width ?? box?.width ?? 320}
      height={height ?? box?.height}
      aria-hidden
      focusable="false"
      className={cn("pointer-events-none block shrink-0", className)}
      style={{
        opacity,
        filter: blur ? `blur(${blur}px)` : undefined,
        transform: transform || undefined,
        ...style,
      }}
    >
      {shape}
    </svg>
  );
}
