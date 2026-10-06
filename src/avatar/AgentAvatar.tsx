import { createContext, type ReactNode, useContext, useId } from "react";
import { cn } from "../lib/cn";

/** `still` holds the pose. `idle` looks around. Defaults to `still`. */
export type AgentAvatarMotion = "still" | "idle";

/** Fixed facing. The head turns that way and the eyes follow. */
export type AgentAvatarLook = "forward" | "left" | "right" | "up" | "down" | "up-left" | "up-right" | "down-left" | "down-right";

export const AGENT_AVATAR_PARTS = {
  shape: ["circle", "square", "triangle", "diamond", "hex", "gem", "pill", "arch", "cloud", "blob", "drop", "shield"],
  color: ["#6E56F0", "#1C1C1C", "#F0B429", "#3DCFC0", "#F47820", "#3B82F6", "#F2549B", "#A56B3C"],
} as const;

type Part<K extends keyof typeof AGENT_AVATAR_PARTS> = (typeof AGENT_AVATAR_PARTS)[K][number];

/** A character is one shape plus the two eyes. */
export type AgentAvatarConfig = {
  shape: Part<"shape">;
  color: string;
};

export type AgentAvatarProps = {
  /** Shape and color. Omitted parts use circle and `#6E56F0`. */
  config?: Partial<AgentAvatarConfig>;
  /** Square size in px. Defaults to 64. */
  size?: number;
  motion?: AgentAvatarMotion;
  /** Which way the face is turned. Defaults to straight ahead. */
  look?: AgentAvatarLook;
  className?: string;
  /** Accessible name. Defaults to "Agent". */
  label?: string;
};

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const DEFAULT_CONFIG: AgentAvatarConfig = {
  shape: AGENT_AVATAR_PARTS.shape[0],
  color: AGENT_AVATAR_PARTS.color[0],
};

function resolveConfig(config?: Partial<AgentAvatarConfig>): AgentAvatarConfig {
  return {
    shape: config?.shape ?? DEFAULT_CONFIG.shape,
    color: config?.color ?? DEFAULT_CONFIG.color,
  };
}

function stagger(seed: string) {
  return (hash(seed) % 8) * 0.2;
}

const EYE = "#111";
const EYE_ON_DARK = "#fff";

function eyeInk(color: string) {
  const hex = color.replace("#", "");
  if (hex.length < 6) return EYE;
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luma < 0.28 ? EYE_ON_DARK : EYE;
}

/** Head shift, then how much further the eyes travel, in viewBox units. */
const LOOK: Record<AgentAvatarLook, { head: [number, number]; eyes: [number, number] }> = {
  forward: { head: [0, 0], eyes: [0, 0] },
  left: { head: [-3.2, 0.6], eyes: [-6.4, 0.4] },
  right: { head: [3.2, 0.6], eyes: [6.4, 0.4] },
  up: { head: [0, -2.6], eyes: [0, -4.4] },
  down: { head: [0, 2.8], eyes: [0, 4.6] },
  "up-left": { head: [-2.3, -1.9], eyes: [-4.5, -3.1] },
  "up-right": { head: [2.3, -1.9], eyes: [4.5, -3.1] },
  "down-left": { head: [-2.3, 2], eyes: [-4.5, 3.3] },
  "down-right": { head: [2.3, 2], eyes: [4.5, 3.3] },
};

function mixHex(color: string, toward: "#fff" | "#000", amount: number) {
  const hex = color.replace("#", "");
  const channel = (start: number) => Number.parseInt(hex.slice(start, start + 2), 16);
  const target = toward === "#fff" ? 255 : 0;
  const mix = (value: number) => Math.round(value + (target - value) * amount)
    .toString(16)
    .padStart(2, "0");
  return `#${mix(channel(0))}${mix(channel(2))}${mix(channel(4))}`;
}

const PaintContext = createContext("#111");
const ShadowContext = createContext<string | undefined>(undefined);
const InkContext = createContext(EYE);

function Eyes({ cx, cy, w = 5.2, h = 12 }: { cx: number; cy: number; w?: number; h?: number }) {
  const gap = w * 1.5;
  const top = cy - h / 2;
  const fill = useContext(InkContext);
  return (
    <g className="nonla-avatar-gaze">
      <g className="nonla-avatar-eyes">
        <rect x={cx - gap / 2 - w} y={top} width={w} height={h} rx={w / 2} fill={fill} />
        <rect x={cx + gap / 2} y={top} width={w} height={h} rx={w / 2} fill={fill} />
      </g>
    </g>
  );
}

function Shape({ shape, color }: AgentAvatarConfig) {
  const paint = useContext(PaintContext);
  const shadow = useContext(ShadowContext);
  const soft = { fill: paint, stroke: paint, strokeLinejoin: "round" as const };
  const face = (mark: ReactNode, eyes: ReactNode, shiftY = 0) => (
    <g transform={shiftY ? `translate(0 ${shiftY})` : undefined}>
      <g filter={shadow}>{mark}</g>
      {eyes}
    </g>
  );
  const body: Record<AgentAvatarConfig["shape"], ReactNode> = {
    circle: face(<circle cx="32" cy="32" r="22" fill={paint} />, <Eyes cx={32} cy={30} />),
    square: face(<rect x="9" y="9" width="46" height="46" rx="16" fill={paint} />, <Eyes cx={32} cy={30} />),
    triangle: face(<path d="M32 16 L50 50 H14 Z" strokeWidth="14" {...soft} />, <Eyes cx={32} cy={38} />, -1),
    diamond: face(<path d="M32 10 L54 32 L32 54 L10 32 Z" strokeWidth="16" {...soft} />, <Eyes cx={32} cy={30} />),
    hex: face(<path d="M32 12 L49 22 L49 42 L32 52 L15 42 L15 22 Z" strokeWidth="8" {...soft} />, <Eyes cx={32} cy={30} />),
    gem: face(<path d="M22 12 H42 L52 22 V42 L42 52 H22 L12 42 V22 Z" strokeWidth="8" {...soft} />, <Eyes cx={32} cy={30} />),
    pill: face(<rect x="6" y="18" width="52" height="28" rx="14" fill={paint} />, <Eyes cx={32} cy={30} />),
    arch: face(<path d="M14 50V32C14 18 50 18 50 32V50C50 56 14 56 14 50Z" fill={paint} />, <Eyes cx={32} cy={36} />, -6),
    cloud: face(
      <g fill={paint}>
        <circle cx="20" cy="38" r="12" />
        <circle cx="44" cy="38" r="12" />
        <circle cx="32" cy="28" r="14" />
        <rect x="16" y="34" width="32" height="14" />
      </g>,
      <Eyes cx={32} cy={36} />,
    ),
    blob: face(<ellipse cx="32" cy="34" rx="24" ry="18" fill={paint} />, <Eyes cx={32} cy={32} />, -2),
    drop: face(
      <path d="M27 23C19 30 15 37 15 46C15 55 22.5 60 32 60C41.5 60 49 55 49 46C49 37 45 30 37 23Q32 16 27 23Z" strokeWidth="5" {...soft} />,
      <Eyes cx={32} cy={42} />,
      -8,
    ),
    shield: face(
      <path d="M18 18H46C52 18 54 24 54 32V36C54 48 46 56 32 58C18 56 10 48 10 36V32C10 24 12 18 18 18Z" fill={paint} />,
      <Eyes cx={32} cy={34} />,
      -6,
    ),
  };
  return <InkContext.Provider value={eyeInk(color)}>{body[shape]}</InkContext.Provider>;
}

export function AgentAvatar({ config, size = 64, motion = "still", look = "forward", className, label = "Agent" }: AgentAvatarProps) {
  const resolved = resolveConfig(config);
  const delay = stagger(`${resolved.shape}${resolved.color}`);
  const facing = LOOK[look];
  const [hx, hy] = facing.head;
  const [ex, ey] = facing.eyes;
  const uid = useId().replace(/:/g, "");
  const light = `nonla-av-${uid}`;
  const shadow = `nonla-av-s-${uid}`;

  return (
    <span
      role="img"
      aria-label={label}
      data-motion={motion}
      data-look={look}
      className={cn("nonla-avatar", className)}
      style={{
        width: size,
        height: size,
        ["--nonla-avatar-delay" as string]: `${delay}s`,
        ["--nonla-avatar-hx" as string]: `${(hx / 64) * 100}%`,
        ["--nonla-avatar-hy" as string]: `${(hy / 64) * 100}%`,
        ["--nonla-avatar-ex" as string]: `${(ex / 64) * 100}%`,
        ["--nonla-avatar-ey" as string]: `${(ey / 64) * 100}%`,
      }}
    >
      <span className="nonla-avatar-bob" aria-hidden>
        <svg viewBox="0 0 64 64" width="100%" height="100%">
          <defs>
            <linearGradient id={light} gradientUnits="userSpaceOnUse" x1="32" y1="4" x2="32" y2="60">
              <stop offset="0" stopColor={mixHex(resolved.color, "#fff", 0.16)} />
              <stop offset="1" stopColor={resolved.color} />
            </linearGradient>
            <filter id={shadow} x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="0.8" stdDeviation="0.6" floodColor="#000" floodOpacity="0.18" />
            </filter>
          </defs>
          <PaintContext.Provider value={`url(#${light})`}>
            <ShadowContext.Provider value={`url(#${shadow})`}>
              <Shape {...resolved} />
            </ShadowContext.Provider>
          </PaintContext.Provider>
        </svg>
      </span>
    </span>
  );
}
