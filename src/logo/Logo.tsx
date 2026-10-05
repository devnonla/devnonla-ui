import "@fontsource-variable/plus-jakarta-sans/wght.css";
import type { CSSProperties } from "react";
import { cn } from "../lib/cn";

/** `icon` is the mark. `text` is the wordmark. `full` is both. */
export type LogoVariant = "icon" | "text" | "full";

/** `pixel` is the grid. `jakarta` is Plus Jakarta Sans. */
export type LogoFace = "pixel" | "jakarta";

export type LogoProps = {
  variant?: LogoVariant;
  /** Wordmark face. Ignored when `variant` is `icon`. Defaults to `pixel`. */
  face?: LogoFace;
  /** Icon height in px. Width follows each asset's aspect ratio. Defaults to 32. */
  size?: number;
  /** Icon and wordmark fill. Eyes and the smile stay. Omit to keep the mascot palette and the current text color. */
  color?: string;
  className?: string;
  style?: CSSProperties;
};

const WORDMARK = "Nonla Agents";

/** viewBox `100 40 1336 960`. */
const MARK_W = 1336;
const MARK_H = 960;

/** Pixel grid wordmark. 11 rows; cap letters use 7, so the box is taller than the caps. */
const WORD_W = 1340;
const WORD_H = 220;
const WORD_CELLS: ReadonlyArray<readonly [number, number]> = [
  [2.4, 2.4],
  [82.4, 2.4],
  [2.4, 22.4],
  [22.4, 22.4],
  [82.4, 22.4],
  [2.4, 42.4],
  [22.4, 42.4],
  [82.4, 42.4],
  [2.4, 62.4],
  [42.4, 62.4],
  [82.4, 62.4],
  [2.4, 82.4],
  [62.4, 82.4],
  [82.4, 82.4],
  [2.4, 102.4],
  [62.4, 102.4],
  [82.4, 102.4],
  [2.4, 122.4],
  [82.4, 122.4],
  [142.4, 42.4],
  [162.4, 42.4],
  [182.4, 42.4],
  [122.4, 62.4],
  [202.4, 62.4],
  [122.4, 82.4],
  [202.4, 82.4],
  [122.4, 102.4],
  [202.4, 102.4],
  [142.4, 122.4],
  [162.4, 122.4],
  [182.4, 122.4],
  [242.4, 42.4],
  [262.4, 42.4],
  [282.4, 42.4],
  [302.4, 42.4],
  [242.4, 62.4],
  [322.4, 62.4],
  [242.4, 82.4],
  [322.4, 82.4],
  [242.4, 102.4],
  [322.4, 102.4],
  [242.4, 122.4],
  [322.4, 122.4],
  [362.4, 2.4],
  [382.4, 2.4],
  [382.4, 22.4],
  [382.4, 42.4],
  [382.4, 62.4],
  [382.4, 82.4],
  [382.4, 102.4],
  [382.4, 122.4],
  [402.4, 122.4],
  [462.4, 42.4],
  [482.4, 42.4],
  [502.4, 42.4],
  [522.4, 62.4],
  [462.4, 82.4],
  [482.4, 82.4],
  [502.4, 82.4],
  [522.4, 82.4],
  [442.4, 102.4],
  [522.4, 102.4],
  [462.4, 122.4],
  [482.4, 122.4],
  [502.4, 122.4],
  [522.4, 122.4],
  [662.4, 2.4],
  [642.4, 22.4],
  [682.4, 22.4],
  [622.4, 42.4],
  [702.4, 42.4],
  [622.4, 62.4],
  [702.4, 62.4],
  [622.4, 82.4],
  [642.4, 82.4],
  [662.4, 82.4],
  [682.4, 82.4],
  [702.4, 82.4],
  [622.4, 102.4],
  [702.4, 102.4],
  [622.4, 122.4],
  [702.4, 122.4],
  [762.4, 42.4],
  [782.4, 42.4],
  [802.4, 42.4],
  [822.4, 42.4],
  [742.4, 62.4],
  [822.4, 62.4],
  [742.4, 82.4],
  [822.4, 82.4],
  [742.4, 102.4],
  [822.4, 102.4],
  [762.4, 122.4],
  [782.4, 122.4],
  [802.4, 122.4],
  [822.4, 122.4],
  [822.4, 142.4],
  [762.4, 162.4],
  [782.4, 162.4],
  [802.4, 162.4],
  [882.4, 42.4],
  [902.4, 42.4],
  [922.4, 42.4],
  [862.4, 62.4],
  [942.4, 62.4],
  [862.4, 82.4],
  [882.4, 82.4],
  [902.4, 82.4],
  [922.4, 82.4],
  [942.4, 82.4],
  [862.4, 102.4],
  [882.4, 122.4],
  [902.4, 122.4],
  [922.4, 122.4],
  [942.4, 122.4],
  [982.4, 42.4],
  [1002.4, 42.4],
  [1022.4, 42.4],
  [1042.4, 42.4],
  [982.4, 62.4],
  [1062.4, 62.4],
  [982.4, 82.4],
  [1062.4, 82.4],
  [982.4, 102.4],
  [1062.4, 102.4],
  [982.4, 122.4],
  [1062.4, 122.4],
  [1122.4, 22.4],
  [1102.4, 42.4],
  [1122.4, 42.4],
  [1142.4, 42.4],
  [1122.4, 62.4],
  [1122.4, 82.4],
  [1122.4, 102.4],
  [1142.4, 122.4],
  [1162.4, 122.4],
  [1222.4, 42.4],
  [1242.4, 42.4],
  [1262.4, 42.4],
  [1282.4, 42.4],
  [1202.4, 62.4],
  [1222.4, 82.4],
  [1242.4, 82.4],
  [1262.4, 82.4],
  [1282.4, 102.4],
  [1202.4, 122.4],
  [1222.4, 122.4],
  [1242.4, 122.4],
  [1262.4, 122.4],
];

/** One paint color, split so the brim stays darker and the face stays lighter than the hat. */
function markTones(color?: string) {
  if (!color) return { brim: "#dd7627", face: "#ffb45c", hat: "#ffa333" };
  return {
    brim: `color-mix(in srgb, ${color} 70%, black)`,
    face: `color-mix(in srgb, ${color} 75%, white)`,
    hat: color,
  };
}

/** Eyes and the smile stay ink and white. */
function LogoMark({ height, color }: { height: number; color?: string }) {
  const tone = markTones(color);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="100 40 1336 960" width={Math.round(height * (MARK_W / MARK_H))} height={height} aria-hidden className="shrink-0">
      <ellipse fill={tone.brim} cx="767" cy="640" rx="666" ry="190" />
      <circle fill={tone.face} cx="768" cy="602" r="371.6" />
      <path fill="none" stroke={tone.hat} strokeWidth="6" d="M112 640 A655 108 0 0 1 1422 640" />
      <path fill="none" stroke={tone.brim} strokeWidth="20" d="M112 640 A655 106 0 0 1 1422 640" />
      <path
        fill={tone.hat}
        d="M768 68 C752 68 640 145 439 300 C338 377 250 449 194 500 C172 519 150 540 134 560 C122 576 109 591 103 600 C99 613 100 628 101 640 A666 108 0 0 1 1433 640 C1434 628 1435 613 1431 600 C1425 591 1412 576 1400 560 C1384 540 1362 519 1340 500 C1284 449 1196 377 1095 300 C894 145 782 68 768 68Z"
      />
      <g fill="none" stroke={tone.brim} strokeWidth="6" strokeLinecap="round" opacity="0.55">
        <path d="M750 96 C625 260 455 421 282 563" />
        <path d="M758 96 C700 241 644 377 588 507" />
        <path d="M778 96 C836 241 892 377 948 507" />
        <path d="M786 96 C911 260 1081 421 1254 563" />
      </g>
      <ellipse fill="#121212" cx="607.5" cy="705" rx="44.5" ry="68" />
      <ellipse fill="#121212" cx="921.5" cy="705" rx="44.5" ry="68" />
      <ellipse fill="#ffffff" cx="618" cy="678" rx="13" ry="19" />
      <ellipse fill="#ffffff" cx="932" cy="678" rx="13" ry="19" />
      <path fill="none" stroke="#121212" strokeWidth="24" strokeLinecap="round" d="M696 802 C733 846 801 846 837 802" />
    </svg>
  );
}


/** Cap height is half the icon. Caps are 7 of the 11 viewBox rows. */
function wordmarkHeight(iconH: number) {
  return Math.round(iconH * (1 / 2) * (11 / 7));
}

/** Plus Jakarta Sans caps are 0.7em, so this em size makes them half the icon. */
function jakartaSize(iconH: number) {
  return (iconH / 2) / 0.7;
}

function LogoJakarta({ iconH, color }: { iconH: number; color?: string }) {
  return (
    <span
      aria-hidden
      className="shrink-0 font-bold leading-none tracking-[-0.02em]"
      style={{ fontFamily: '"Plus Jakarta Sans Variable", sans-serif', fontSize: jakartaSize(iconH), color }}
    >
      {WORDMARK}
    </span>
  );
}

function LogoWordmark({ height, color }: { height: number; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${WORD_W} ${WORD_H}`}
      width={Math.round(height * (WORD_W / WORD_H))}
      height={height}
      aria-hidden
      className="shrink-0"
      shapeRendering="crispEdges"
    >
      <g transform="translate(20 20)" fill={color ?? "currentColor"}>
        {WORD_CELLS.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={15.2} height={15.2} />
        ))}
      </g>
    </svg>
  );
}

export function Logo({ variant = "full", size = 32, face = "pixel", color, className, style }: LogoProps) {
  const iconH = size;
  const mark = <LogoMark height={iconH} color={color} />;
  const word = face === "jakarta" ? <LogoJakarta iconH={iconH} color={color} /> : <LogoWordmark height={wordmarkHeight(iconH)} color={color} />;
  const root = cn("inline-flex items-center text-foreground", variant === "full" && "gap-2", className);

  return (
    <span role="img" aria-label={WORDMARK} className={root} style={style}>
      {variant === "text" ? null : mark}
      {variant === "icon" ? null : word}
    </span>
  );
}
