---
path: "/chat/agent-body"
title: "Agent body"
group: "Chat"
groupOrder: 2
order: 12
icon: "bot-24"
---

# Agent body

Full standing character: an `AgentAvatar` head (including `nonla`) on a neck and a cylinder torso, with two arms and two legs that walk.

## 2D Walk (WASD / Arrow keys)

Click inside the stage and press **WASD** or **Arrow keys** (`↑` `↓` `←` `→`), hold the on-screen D-pad, or click anywhere on the floor to walk there.

```live-react
import { useEffect, useRef, useState } from "react";
import { AGENT_BODY_PARTS, AgentBody } from "devnonla-ui";

const STAGE_W = 520;
const STAGE_H = 260;
const CHAR_SIZE = 76;
// Pixels per second. Matched to the stride so the feet do not skate on the floor.
const SPEED = 84;
// Walking toward or away from the viewer covers less floor on screen (depth is foreshortened),
// so vertical speed is lower, matched to the foot travel of the front / back walk.
const SPEED_Y = 70;
// A run has a longer stride and a shorter step time, so it covers more floor in each direction.
const RUN_SPEED = 160;
const RUN_SPEED_Y = 115;

// Grass floor: a game tile map. Tiles are TILE px square, two close greens in a checker, with a few tufts.
const TILE = 32;
const GRASS_A = "#7db868";
const GRASS_B = "#77b362";
// Flowers: [x, y, petal, center] over the whole stage.
const FLOWERS = [
  [88, 74, "#fff4c2", "#f2b632"],
  [400, 62, "#ffd7e4", "#e8567f"],
  [150, 218, "#fff4c2", "#f2b632"],
  [452, 176, "#ffd7e4", "#e8567f"],
];
// Tufts per tile in a 2 x 2 block: [col, row, x, y, size]. Coordinates are inside the tile.
const TUFTS = [
  [0, 0, 9, 23, 0.9],
  [1, 1, 22, 15, 0.9],
];

function pickLook(dx, dy, fallback) {
  if (dx === 0 && dy === 0) return fallback;
  if (dx < 0 && dy < 0) return "up-left";
  if (dx > 0 && dy < 0) return "up-right";
  if (dx < 0 && dy > 0) return "down-left";
  if (dx > 0 && dy > 0) return "down-right";
  if (dx < 0) return "left";
  if (dx > 0) return "right";
  if (dy < 0) return "up";
  return "down";
}

export default function Demo() {
  const stageRef = useRef(null);
  const keysRef = useRef(new Set());
  const targetRef = useRef(null);
  const posRef = useRef({ x: STAGE_W / 2, y: STAGE_H / 2 + 16 });
  const [pos, setPos] = useState(posRef.current);
  const [moving, setMoving] = useState(false);
  const [gait, setGait] = useState("walk");
  const [shift, setShift] = useState(false);
  const run = gait === "run" || shift;
  const runRef = useRef(run);
  runRef.current = run;
  const [look, setLook] = useState("down");
  const [shape, setShape] = useState("nonla");
  const [color, setColor] = useState("#F47820");

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const keys = keysRef.current;
      let dx = (keys.has("right") ? 1 : 0) - (keys.has("left") ? 1 : 0);
      let dy = (keys.has("down") ? 1 : 0) - (keys.has("up") ? 1 : 0);

      if (dx !== 0 || dy !== 0) {
        targetRef.current = null;
      } else if (targetRef.current) {
        const tx = targetRef.current.x - posRef.current.x;
        const ty = targetRef.current.y - posRef.current.y;
        const dist = Math.hypot(tx, ty);
        if (dist < 4) {
          targetRef.current = null;
        } else {
          dx = Math.abs(tx) > 3 ? Math.sign(tx) : 0;
          dy = Math.abs(ty) > 3 ? Math.sign(ty) : 0;
        }
      }

      if (dx !== 0 || dy !== 0) {
        // Sideways keeps the full stride speed, even on a diagonal, so the feet do not skate.
        const vx = runRef.current ? RUN_SPEED : SPEED;
        const vy = runRef.current ? RUN_SPEED_Y : SPEED_Y;
        const nx = Math.max(44, Math.min(STAGE_W - 44, posRef.current.x + dx * vx * dt));
        const ny = Math.max(64, Math.min(STAGE_H - 18, posRef.current.y + dy * vy * dt));
        posRef.current = { x: nx, y: ny };
        setPos({ x: nx, y: ny });
        setMoving(true);
        setLook((prev) => pickLook(dx, dy, prev));
      } else {
        setMoving(false);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const mapKey = (key) => {
    const k = key.toLowerCase();
    if (k === "w" || k === "arrowup") return "up";
    if (k === "s" || k === "arrowdown") return "down";
    if (k === "a" || k === "arrowleft") return "left";
    if (k === "d" || k === "arrowright") return "right";
    return null;
  };

  const onKeyDown = (e) => {
    setShift(e.shiftKey);
    const dir = mapKey(e.key);
    if (!dir) return;
    e.preventDefault();
    keysRef.current.add(dir);
  };

  const onKeyUp = (e) => {
    setShift(e.shiftKey);
    const dir = mapKey(e.key);
    if (!dir) return;
    e.preventDefault();
    keysRef.current.delete(dir);
  };

  const holdDir = (dir, down) => {
    if (down) keysRef.current.add(dir);
    else keysRef.current.delete(dir);
  };

  const dpadBtn = (dir, label) => (
    <button
      type="button"
      onPointerDown={(e) => {
        e.stopPropagation();
        holdDir(dir, true);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        holdDir(dir, false);
      }}
      onPointerLeave={() => holdDir(dir, false)}
      className="flex size-8 cursor-pointer select-none items-center justify-center rounded-lg border border-border bg-card/90 text-xs font-medium text-foreground active:scale-95"
    >
      {label}
    </button>
  );

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={stageRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={() => {
          keysRef.current.clear();
          setShift(false);
        }}
        onPointerDown={(e) => {
          stageRef.current?.focus();
          const rect = e.currentTarget.getBoundingClientRect();
          targetRef.current = {
            x: ((e.clientX - rect.left) / rect.width) * STAGE_W,
            y: ((e.clientY - rect.top) / rect.height) * STAGE_H,
          };
        }}
        style={{ width: STAGE_W, height: STAGE_H }}
        className="relative max-w-full cursor-pointer overflow-hidden rounded-2xl border border-border bg-muted/30 outline-none focus:ring-2 focus:ring-foreground/25"
      >
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
          width={STAGE_W}
          height={STAGE_H}
        >
          <defs>
            {/* Grass tiles: a 2 x 2 checker block that repeats, with little tufts. */}
            <pattern id="agent-body-floor" width={TILE * 2} height={TILE * 2} patternUnits="userSpaceOnUse">
              {[0, 1].map((row) =>
                [0, 1].map((col) => (
                  <rect
                    key={`${row}-${col}`}
                    x={col * TILE}
                    y={row * TILE}
                    width={TILE}
                    height={TILE}
                    fill={(row + col) % 2 === 0 ? GRASS_A : GRASS_B}
                  />
                )),
              )}
              {TUFTS.map(([col, row, x, y, k], i) => (
                <path
                  key={i}
                  transform={`translate(${col * TILE + x} ${row * TILE + y}) scale(${k})`}
                  d="M-4 0 L-5 -5 M0 0 L0 -7 M4 0 L5 -5"
                  fill="none"
                  stroke="#5f9a52"
                  strokeWidth="1.4"
                  strokeOpacity="0.7"
                  strokeLinecap="round"
                />
              ))}
            </pattern>
            <radialGradient id="agent-body-floor-light" cx="50%" cy="55%" r="75%">
              <stop offset="0" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.12" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#agent-body-floor)" />
          {/* A few flowers, placed by hand so the floor does not look like a grid. */}
          {FLOWERS.map(([x, y, petal, core]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="2.6" fill={petal} />
              <circle cx={x} cy={y} r="1" fill={core} />
            </g>
          ))}
          <rect width="100%" height="100%" fill="url(#agent-body-floor-light)" />
        </svg>
        <span className="pointer-events-none absolute top-2.5 left-3 rounded-md bg-background/75 px-2 py-0.5 text-xs text-muted-foreground">
          Click floor or use WASD / ↑↓←→ (hold Shift to run) · {moving ? `${run ? "running" : "walking"} ${look}` : "idle"}
        </span>

        <div
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y,
            transform: "translate(-50%, -88%)",
          }}
          className="pointer-events-none"
        >
          <AgentBody
            config={{ shape, color }}
            size={CHAR_SIZE}
            motion={moving ? (run ? "run" : "walk") : "idle"}
            look={look}
          />
        </div>

        <div className="absolute right-3 bottom-3 flex flex-col items-center gap-1">
          {dpadBtn("up", "↑")}
          <div className="flex gap-1">
            {dpadBtn("left", "←")}
            {dpadBtn("down", "↓")}
            {dpadBtn("right", "→")}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {["walk", "run"].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGait(g)}
            className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs capitalize ${
              gait === g ? "border-foreground bg-foreground text-background" : "border-border bg-transparent text-muted-foreground"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {["nonla", "drop", "circle", "square", "cloud", "blob", "shield", "hex"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setShape(s)}
            className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs capitalize ${
              shape === s ? "border-foreground bg-foreground text-background" : "border-border bg-transparent text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {AGENT_BODY_PARTS.color.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            onClick={() => setColor(c)}
            className="size-6 cursor-pointer rounded-full border border-border"
            style={{
              background: c,
              boxShadow: color === c ? "0 0 0 2px var(--card), 0 0 0 4px var(--foreground)" : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

## Walk (4 directions)

`motion="walk"` (or `motion="run"`, the same gait faster) pairs with `look` (`left`, `right`, `up`, `down`) so the legs step and the arms swing in that direction. The torso stays still. `look="down"` walks toward the viewer, so the face looks straight ahead (same as `forward`). `look="up"` is the view from behind: the face has no eyes, in every motion. `idle` with `look="up"` stays turned away and does not glance around.

```live-react
import { AgentBody } from "devnonla-ui";

const dirs = [
  ["left", "Left"],
  ["right", "Right"],
  ["up", "Up"],
  ["down", "Down"],
];

export default function Demo() {
  return dirs.map(([look, label]) => (
    <div key={look} className="flex w-24 flex-col items-center gap-1">
      <AgentBody config={{ shape: "nonla", color: "#F47820" }} size={84} motion="walk" look={look} label={label} />
      <span className="text-center text-[15px] leading-7 text-muted-foreground">{label}</span>
    </div>
  ));
}
```

## Motion

`still` holds the pose. `idle` breathes, blinks, and glances around. `walk` steps continuously. `run` is a faster gait: shorter step time, bigger swing, and deeper knee and elbow bend. Pair it with a faster travel speed so the feet do not skate. `talk` nods a little and gestures with the near arm.

```live-react
import { AgentBody } from "devnonla-ui";

const face = { shape: "nonla", color: "#F47820" };

export default function Demo() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-6 pt-10">
      <div className="flex flex-col items-center gap-1">
        <AgentBody config={face} size={84} motion="still" />
        <span className="text-[15px] leading-7 text-muted-foreground">still</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <AgentBody config={face} size={84} motion="idle" />
        <span className="text-[15px] leading-7 text-muted-foreground">idle</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <AgentBody config={face} size={84} motion="walk" look="right" />
        <span className="text-[15px] leading-7 text-muted-foreground">walk</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <AgentBody config={face} size={84} motion="run" look="right" />
        <span className="text-[15px] leading-7 text-muted-foreground">run</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <AgentBody config={face} size={84} motion="talk" say="Hi!" />
        <span className="text-[15px] leading-7 text-muted-foreground">talk</span>
      </div>
    </div>
  );
}
```

## Talk

`motion="talk"` with `say` shows an RPG-style speech bubble above the head. The line types out character by character. Long text is split into short pages (prefer whole sentences, then wrap by length); when a page finishes, a ▼ cue blinks and the next page types. Omit `say` and the gesture still runs without a bubble.

```live-react
import { useState } from "react";
import { AgentBody } from "devnonla-ui";

const lines = [
  { label: "Short", text: "Hi!" },
  { label: "Sentence", text: "Ready when you are." },
  {
    label: "Paged",
    text: "Okay — I can help with that. First I will outline the steps. Then we can refine the details together.",
  },
  { label: "Long word", text: "Supercalifragilisticexpialidocious!" },
];

export default function Demo() {
  const [i, setI] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4 pt-16">
      <AgentBody
        config={{ shape: "nonla", color: "#F47820" }}
        size={96}
        motion="talk"
        say={lines[i].text}
      />
      <div className="flex flex-wrap justify-center gap-1.5">
        {lines.map((line, idx) => (
          <button
            key={line.label}
            type="button"
            onClick={() => setI(idx)}
            className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs ${
              i === idx ? "border-foreground bg-foreground text-background" : "border-border bg-transparent text-muted-foreground"
            }`}
          >
            {line.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Shape

All thirteen `AgentAvatar` head shapes sit on the same torso, arms, and legs.

```live-react
import { AGENT_BODY_PARTS, AgentBody } from "devnonla-ui";

export default function Demo() {
  return AGENT_BODY_PARTS.shape.map((shape) => (
    <div key={shape} className="flex w-20 flex-col items-center gap-1">
      <AgentBody config={{ shape, color: "#6E56F0" }} size={68} motion="idle" label={shape} />
      <span className="text-center text-[15px] leading-7 text-muted-foreground capitalize">{shape}</span>
    </div>
  ));
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `config.shape` | Head silhouette (same 13 shapes as `AgentAvatar`, including `nonla`). | `circle` \| `square` \| `triangle` \| `diamond` \| `hex` \| `gem` \| `pill` \| `arch` \| `cloud` \| `blob` \| `drop` \| `shield` \| `nonla` | `nonla` |
| `config.color` | Character color, as a hex string. | `string` | `#F47820` |
| `config.eyeColor` | Pupil color. Omitted uses black, or white when the face is dark. | `black` \| `white` | black, or white on a dark face |
| `size` | Width in pixels. Height follows the standing viewBox (`80 × 104`). | `number` | `80` |
| `motion` | `still` holds the pose. `idle` breathes, blinks, and glances. `walk` steps in the `look` direction. `run` is the same gait, faster. `talk` nods and gestures. | `still` \| `idle` \| `walk` \| `run` \| `talk` | `still` |
| `look` | Facing / walking direction. | `forward` \| `left` \| `right` \| `up` \| `down` \| `up-left` \| `up-right` \| `down-left` \| `down-right` | `forward` |
| `say` | Spoken line. RPG bubble types it out; long text is paged by sentence then length. | `string` | `-` |
| `className` | Extra class on the root element. | `string` | `-` |
| `label` | Accessible name. | `string` | `Agent` |
