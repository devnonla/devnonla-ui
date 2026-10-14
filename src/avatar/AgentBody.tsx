import { useEffect, useId, useState } from "react";
import { cn } from "../lib/cn";
import {
  AGENT_AVATAR_PARTS,
  type AgentAvatarConfig,
  type AgentAvatarEyeColor,
  type AgentAvatarLook,
  AvatarShape,
  avatarStagger,
  LOOK,
  mixHex,
  PaintContext,
  ShadowContext,
  useIdleLook,
} from "./AgentAvatar";

/**
 * `still` holds the pose. `idle` blinks and glances. `walk` steps the legs and swings the arms in the `look` direction.
 * `run` is the same gait, faster, with a bigger swing and deeper knee and elbow bend.
 * `talk` nods a little and gestures; pass `say` for a speech bubble above the head.
 */
export type AgentBodyMotion = "still" | "idle" | "walk" | "run" | "talk";

/** Pause after a page finishes before the next one. */
const PAGE_HOLD_MS = 1100;

/** Split on sentence ends / newlines, keeping the punctuation on the chunk. */
function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?…\n]+(?:[.!?…]+|\n+)?/g);
  if (!parts) return text.trim() ? [text.trim()] : [];
  return parts.map((part) => part.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/** Break a long run into word pages that fit `maxChars`. Oversized words are hard-sliced. */
function chunkWords(text: string, maxChars: number): string[] {
  const words = text.split(" ").filter(Boolean);
  const pages: string[] = [];
  let buf = "";

  const push = () => {
    if (buf) pages.push(buf);
    buf = "";
  };

  for (const word of words) {
    if (word.length > maxChars) {
      push();
      for (let i = 0; i < word.length; i += maxChars) {
        pages.push(word.slice(i, i + maxChars));
      }
      continue;
    }
    if (!buf) {
      buf = word;
    } else if (buf.length + 1 + word.length <= maxChars) {
      buf = `${buf} ${word}`;
    } else {
      push();
      buf = word;
    }
  }
  push();
  return pages;
}

/**
 * Paginate like an RPG dialogue box: prefer whole sentences, then pack short ones
 * together, and word-wrap anything longer than `maxChars`.
 */
function paginateSay(text: string, maxChars: number): string[] {
  const pages: string[] = [];
  let buf = "";

  const flush = () => {
    if (buf) pages.push(buf);
    buf = "";
  };

  for (const sentence of splitSentences(text)) {
    if (sentence.length > maxChars) {
      flush();
      pages.push(...chunkWords(sentence, maxChars));
      continue;
    }
    if (!buf) {
      buf = sentence;
    } else if (buf.length + 1 + sentence.length <= maxChars) {
      buf = `${buf} ${sentence}`;
    } else {
      flush();
      buf = sentence;
    }
  }
  flush();
  return pages.length ? pages : [text];
}

/**
 * Types the current page, then advances. Long `say` is cut into short pages first.
 * Returns a blinking "more" cue while waiting on a non-final page.
 */
function useDialogue(text: string | undefined, maxChars: number, msPerChar = 32) {
  const pages = text ? paginateSay(text, maxChars) : [];
  const [page, setPage] = useState(0);
  const [shown, setShown] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [text, maxChars]);

  const current = pages[page];
  const hasMore = page < pages.length - 1;

  useEffect(() => {
    if (!current) {
      setShown("");
      setTyping(false);
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let interval = 0;
    let hold = 0;

    const advanceLater = () => {
      if (!hasMore) return;
      hold = window.setTimeout(() => setPage((p) => p + 1), PAGE_HOLD_MS);
    };

    if (media.matches) {
      setShown(current);
      setTyping(false);
      advanceLater();
      return () => window.clearTimeout(hold);
    }

    setShown("");
    setTyping(true);
    let i = 0;
    interval = window.setInterval(() => {
      i += 1;
      setShown(current.slice(0, i));
      if (i >= current.length) {
        window.clearInterval(interval);
        setTyping(false);
        advanceLater();
      }
    }, msPerChar);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(hold);
    };
  }, [current, hasMore, msPerChar]);

  return { shown, typing, hasMore: hasMore && !typing };
}

/** Same 13 head shapes and palette as `AgentAvatar`. */
export const AGENT_BODY_PARTS = AGENT_AVATAR_PARTS;

type BodyShape = (typeof AGENT_BODY_PARTS.shape)[number] | "round";

export type AgentBodyConfig = {
  shape: BodyShape;
  color: string;
  eyeColor?: AgentAvatarEyeColor;
};

/** Facing / walking direction. `up` is away from the viewer (seen from behind). */
export type AgentBodyLook = AgentAvatarLook | "up";

export type AgentBodyProps = {
  /** Head shape and character color. Omitted parts use `nonla` and `#F47820`. */
  config?: Partial<AgentBodyConfig>;
  /** Width in px. Height follows the standing viewBox. Defaults to 80. */
  size?: number;
  motion?: AgentBodyMotion;
  /** Facing / walking direction. Defaults to `forward`. */
  look?: AgentBodyLook;
  /**
   * Spoken line. Shows an RPG speech bubble that types out above the head.
   * Long text is split into short pages (by sentence, then by length) and advanced automatically.
   */
  say?: string;
  className?: string;
  /** Accessible name. Defaults to "Agent". */
  label?: string;
};

const DEFAULT_BODY_CONFIG: AgentAvatarConfig = {
  shape: "nonla",
  color: "#F47820",
};

function resolveBodyConfig(config?: Partial<AgentBodyConfig>): AgentAvatarConfig {
  const rawShape = config?.shape ?? DEFAULT_BODY_CONFIG.shape;
  const shape = rawShape === "round" ? "circle" : rawShape;
  return {
    shape,
    color: config?.color ?? DEFAULT_BODY_CONFIG.color,
    eyeColor: config?.eyeColor,
  };
}

const VIEW_W = 80;
const VIEW_H = 108;
const ASPECT = VIEW_H / VIEW_W;

/**
 * Cylinder torso: straight sides, same width top to bottom, softly rounded ends.
 * Spans x=28.5..51.5, y=46..76. The shoulders (y=53) and hips (y=72) sit inside it.
 * Sized a bit fuller than the head so the standing figure does not read as bobbleheaded.
 */
const TORSO = { x: 28.5, y: 46, width: 23, height: 30, rx: 7.5 } as const;

/**
 * Short neck between the head and the torso. Narrow and mostly tucked under the chin
 * so it does not read as a column sitting behind the head.
 */
const NECK = { x: 36.5, y: 39.5, width: 7, height: 10, rx: 2.2 } as const;

/** Shoulder joints at rest (far arm x=25.5, near arm x=54.5) and the torso center. */
const ARM_FAR_X = 25.5;
const ARM_NEAR_X = 54.5;
const ARM_CENTER = 40;
/**
 * Side walk turns the torso a little toward the viewer: the near shoulder slips back and the far
 * shoulder forward by this much, so the shoulders are close but not stacked.
 */
const ARM_TURN = 2.5;
/** Hip joints at rest (far leg x=35, near leg x=45). In a side walk they turn like the shoulders. */
const LEG_FAR_X = 35;
const LEG_NEAR_X = 45;
const LEG_TURN = ARM_TURN;

/**
 * Where each head ends, in the 64-unit head box, measured near the neck column
 * and after the shape's own vertical shift. Heads differ a lot (a pill ends at 46, a gem at 56),
 * so each one is nudged vertically until its underside lands on the same line above the neck.
 */
const HEAD_BOTTOM: Record<AgentAvatarConfig["shape"], number> = {
  circle: 53.5,
  square: 55,
  triangle: 56,
  diamond: 51.7,
  hex: 54,
  gem: 56,
  pill: 46,
  arch: 48.3,
  cloud: 48,
  blob: 49.7,
  drop: 54.4,
  shield: 51.4,
  /** Face circle bottom (~52.4); a lower value left the chin hanging over the neck. */
  nonla: 52.6,
};

/** Where the head underside should land (y in the body viewBox). Extra overlap hides the neck top. */
const HEAD_JOIN_Y = NECK.y + 4.5;
/** Head box is 64×64; keep it under ~0.7 so the torso reads larger than the face. */
const HEAD_SCALE = 0.68;
const HEAD_X = Number(((VIEW_W - 64 * HEAD_SCALE) / 2).toFixed(2));

function walkAxis(look: AgentBodyLook): "left" | "right" | "up" | "down" {
  if (look === "left" || look === "up-left" || look === "down-left") return "left";
  if (look === "right" || look === "up-right" || look === "down-right") return "right";
  if (look === "up") return "up";
  return "down";
}

/**
 * Full standing character: `AgentAvatar` head on a neck and rounded torso, with two arms and two legs.
 * Each limb is drawn straight and rotates around a joint that sits inside the torso,
 * so nothing detaches when it walks.
 */
export function AgentBody({
  config,
  size = 80,
  motion = "still",
  look = "forward",
  say,
  className,
  label = "Agent",
}: AgentBodyProps) {
  const resolved = resolveBodyConfig(config);
  const delay = avatarStagger(`${resolved.shape}${resolved.color}`);
  /** `look="up"` is the view from behind: no eyes, so there is nothing to glance with. */
  const fromBehind = look === "up";
  /** Walking down is walking at the viewer: the face looks straight ahead, not down. */
  const home: AgentAvatarLook = look === "down" || look === "up" ? "forward" : look;
  const shown = useIdleLook(motion === "idle" && !fromBehind, home, delay);
  const [ex, ey] = LOOK[shown];
  const dir = walkAxis(shown);
  const headDrop = Number((HEAD_JOIN_Y - HEAD_BOTTOM[resolved.shape] * HEAD_SCALE).toFixed(2));
  /** `run` reuses the walk cycle: same `data-motion="walk"` rules, with the gait sizes raised through `data-gait`. */
  const walking = motion === "walk" || motion === "run";
  const sideWalk = walking && (dir === "left" || dir === "right");
  const turn = dir === "right" ? 1 : -1;
  const farArmX = ARM_CENTER + turn * ARM_TURN - ARM_FAR_X;
  const nearArmX = ARM_CENTER - turn * ARM_TURN - ARM_NEAR_X;
  const farLegX = ARM_CENTER + turn * LEG_TURN - LEG_FAR_X;
  const nearLegX = ARM_CENTER - turn * LEG_TURN - LEG_NEAR_X;
  const line = say?.trim() || undefined;
  const bubbleMax = Math.round(Math.min(200, Math.max(112, size * 2.35)));
  /** ~2–3 mono lines in the bubble. Scales a little with character size. */
  const pageChars = Math.round(Math.min(52, Math.max(36, size * 0.48)));
  const { shown: typed, typing, hasMore } = useDialogue(line, pageChars);
  const uid = useId().replace(/:/g, "");
  const headLight = `nonla-bh-${uid}`;
  const torsoLight = `nonla-bt-${uid}`;
  const neckLight = `nonla-bn-${uid}`;
  const shadow = `nonla-bs-${uid}`;

  /** Limbs stay a step lighter than the torso so the body mass reads clearly. */
  const nearStroke = mixHex(resolved.color, "#fff", 0.14);
  const farStroke = mixHex(resolved.color, "#fff", 0.02);
  const strokeProps = {
    fill: "none" as const,
    strokeWidth: 5.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <span
      role="img"
      aria-label={line ? `${label}. ${line}` : label}
      data-motion={motion === "run" ? "walk" : motion}
      data-gait={motion === "run" ? "run" : undefined}
      data-look={shown}
      data-dir={dir}
      data-back={fromBehind ? "" : undefined}
      data-say={line ? "" : undefined}
      className={cn("nonla-body", className)}
      style={{
        width: size,
        height: size * ASPECT,
        ["--nonla-avatar-delay" as string]: `${delay}s`,
        ["--nonla-avatar-ex" as string]: `${(ex / 64) * 100}%`,
        ["--nonla-avatar-ey" as string]: `${(ey / 64) * 100}%`,
        ["--nonla-body-bubble-size" as string]: `${Math.max(11, Math.round(size * 0.145))}px`,
        ["--nonla-body-bubble-max" as string]: `${bubbleMax}px`,
      }}
    >
      {line ? (
        <span
          className="nonla-body-bubble"
          data-typing={typing ? "" : undefined}
          data-more={hasMore ? "" : undefined}
          aria-hidden
        >
          <span className="nonla-body-bubble-text">
            {typed}
            {typing ? <span className="nonla-body-bubble-caret" /> : null}
          </span>
          {hasMore ? <span className="nonla-body-bubble-more" /> : null}
        </span>
      ) : null}
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" height="100%" aria-hidden>
        <defs>
          <linearGradient id={headLight} gradientUnits="userSpaceOnUse" x1="32" y1="4" x2="32" y2="60">
            <stop offset="0" stopColor={mixHex(resolved.color, "#fff", 0.16)} />
            <stop offset="1" stopColor={resolved.color} />
          </linearGradient>
          {/* Torso a step darker than head/limbs so the body mass separates from the sticks. */}
          <linearGradient id={torsoLight} gradientUnits="userSpaceOnUse" x1={TORSO.x} y1="0" x2={TORSO.x + TORSO.width} y2="0">
            <stop offset="0" stopColor={mixHex(resolved.color, "#000", 0.1)} />
            <stop offset="0.32" stopColor={mixHex(resolved.color, "#000", 0.04)} />
            <stop offset="0.75" stopColor={mixHex(resolved.color, "#000", 0.14)} />
            <stop offset="1" stopColor={mixHex(resolved.color, "#000", 0.22)} />
          </linearGradient>
          {/* Neck sits between head and torso — closer to the brighter limb tone. */}
          <linearGradient id={neckLight} gradientUnits="userSpaceOnUse" x1={NECK.x} y1="0" x2={NECK.x + NECK.width} y2="0">
            <stop offset="0" stopColor={mixHex(resolved.color, "#fff", 0.08)} />
            <stop offset="0.5" stopColor={mixHex(resolved.color, "#fff", 0.04)} />
            <stop offset="1" stopColor={mixHex(resolved.color, "#000", 0.06)} />
          </linearGradient>
          <filter id={shadow} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="0.9" stdDeviation="0.6" floodColor="#000" floodOpacity="0.18" />
          </filter>
        </defs>

        <g filter={`url(#${shadow})`}>
          {/*
            Limbs are drawn straight down from their joints. The rest splay and the walk cycle are
            CSS rotations around that joint. Legs and arms start inside the torso, which is painted
            over the joints, so the joint is always covered.
            Hip y=72 -> knee y=85 -> foot y=98. Shoulder y=53 -> elbow y=61.5 -> hand y=70.
          */}

          {/* Legs first: the torso covers the hips */}
          {/* In a side walk the hips sit at the torso center, turned a hair like the shoulders. */}
          <g transform={sideWalk ? `translate(${farLegX} 0)` : undefined}>
            <g className="nonla-stick-leg nonla-stick-leg-b" stroke={farStroke} {...strokeProps}>
              {/* One stick at rest; walk swaps to thigh + shin so the knee can fold. */}
              <line className="nonla-stick-leg-bone" x1="35" y1="72" x2="35" y2="98" />
              <line className="nonla-stick-thigh" x1="35" y1="72" x2="35" y2="85" />
              <g className="nonla-stick-shin">
                <line x1="35" y1="85" x2="35" y2="98" />
              </g>
            </g>
          </g>
          <g transform={sideWalk ? `translate(${nearLegX} 0)` : undefined}>
            <g className="nonla-stick-leg nonla-stick-leg-f" stroke={nearStroke} {...strokeProps}>
              <line className="nonla-stick-leg-bone" x1="45" y1="72" x2="45" y2="98" />
              <line className="nonla-stick-thigh" x1="45" y1="72" x2="45" y2="85" />
              <g className="nonla-stick-shin">
                <line x1="45" y1="85" x2="45" y2="98" />
              </g>
            </g>
          </g>

          {/*
            Left arm sits behind the torso edge. In a side walk (left or right) both shoulders move
            to the middle of the torso, a hair apart as if the torso is turned a little toward the
            viewer. The far arm stays behind the torso and the near arm in front.
          */}
          <g transform={sideWalk ? `translate(${farArmX} 0)` : undefined}>
            <g className="nonla-stick-arm nonla-stick-arm-b" stroke={farStroke} {...strokeProps}>
              <line x1="25.5" y1="53" x2="25.5" y2="61.5" />
              <g className="nonla-stick-forearm">
                <line x1="25.5" y1="61.5" x2="25.5" y2="70" />
              </g>
            </g>
          </g>

          {/* Neck, then the cylinder torso over its lower end */}
          <rect className="nonla-body-neck" {...NECK} fill={`url(#${neckLight})`} />
          <rect className="nonla-body-torso" {...TORSO} fill={`url(#${torsoLight})`} />

          {/* Right arm hangs in front of the torso edge */}
          <g transform={sideWalk ? `translate(${nearArmX} 0)` : undefined}>
            <g className="nonla-stick-arm nonla-stick-arm-f" stroke={nearStroke} {...strokeProps}>
              <line x1="54.5" y1="53" x2="54.5" y2="61.5" />
              <g className="nonla-stick-forearm">
                <line x1="54.5" y1="61.5" x2="54.5" y2="70" />
              </g>
            </g>
          </g>

          {/* AgentAvatar head on top */}
          <g className="nonla-body-head">
            <g transform={`translate(${HEAD_X} ${headDrop}) scale(${HEAD_SCALE})`}>
              <PaintContext.Provider value={`url(#${headLight})`}>
                {/* No shadow of its own: the group already has one, and a second one under the head dirties the neck. */}
                <ShadowContext.Provider value={undefined}>
                  <AvatarShape {...resolved} />
                </ShadowContext.Provider>
              </PaintContext.Provider>
            </g>
          </g>
        </g>
      </svg>
    </span>
  );
}
