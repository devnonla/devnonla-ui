---
path: "/chat/avatar"
title: "Avatar"
group: "Chat"
groupOrder: 2
order: 11
icon: "bot-24"
---

# Agent avatar

Face on the welcome screen. Pass it as `avatar` on AgentPanel, AgentChatbox, or ChatWelcome. A flat shape and two eyes.

## Basic

Set the shape and the color.

```live-react
import { AgentAvatar } from "devnonla-ui";

export default function Demo() {
  return <AgentAvatar config={{ shape: "drop", color: "#6E56F0" }} />;
}
```

## Shape

Twelve silhouettes. The color stays the same so the shape is the only change.

```live-react
import { AGENT_AVATAR_PARTS, AgentAvatar } from "devnonla-ui";

export default function Demo() {
  return AGENT_AVATAR_PARTS.shape.map((shape) => (
    <div key={shape} className="flex w-16 flex-col items-center gap-1">
      <AgentAvatar config={{ shape, color: "#6E56F0" }} label={shape} />
      <span className="text-center text-[15px] leading-7 text-muted-foreground capitalize">{shape}</span>
    </div>
  ));
}
```

## Motion

`still` is the default and holds the pose. `idle` looks left, up, right, and down, then returns to `look`.

```live-react
import { AgentAvatar } from "devnonla-ui";

const face = { shape: "drop", color: "#6E56F0" };

export default function Demo() {
  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <AgentAvatar config={face} motion="still" />
        <span className="text-[15px] leading-7 text-muted-foreground">still</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <AgentAvatar config={face} motion="idle" />
        <span className="text-[15px] leading-7 text-muted-foreground">idle</span>
      </div>
    </>
  );
}
```

## Look

Facing is fixed. The head shifts that way and the eyes travel further.

```live-react
import { AgentAvatar } from "devnonla-ui";

const looks = [
  ["forward", "Forward"],
  ["left", "Left"],
  ["right", "Right"],
  ["up", "Up"],
  ["down", "Down"],
  ["up-left", "Top left"],
  ["up-right", "Top right"],
  ["down-left", "Bottom left"],
  ["down-right", "Bottom right"],
];

export default function Demo() {
  return looks.map(([look, label]) => (
    <div key={look} className="flex w-20 flex-col items-center gap-1">
      <AgentAvatar config={{ shape: "drop", color: "#6E56F0" }} look={look} label={label} />
      <span className="text-center text-[15px] leading-7 text-muted-foreground">{label}</span>
    </div>
  ));
}
```

## Color

Pick a shape, a face color, and a pupil color. All three go in `config`.

```live-react
import { useState } from "react";
import { AGENT_AVATAR_PARTS, AgentAvatar, Segmented } from "devnonla-ui";

const motions = [
  { label: "Still", value: "still" },
  { label: "Idle", value: "idle" },
];

const looks = [
  { label: "Forward", value: "forward" },
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
  { label: "Up", value: "up" },
  { label: "Down", value: "down" },
  { label: "Top left", value: "up-left" },
  { label: "Top right", value: "up-right" },
  { label: "Bottom left", value: "down-left" },
  { label: "Bottom right", value: "down-right" },
];

const eyeColors = [
  { label: "Black", value: "black" },
  { label: "White", value: "white" },
];

export default function Demo() {
  const [motion, setMotion] = useState("still");
  const [look, setLook] = useState("left");
  const [config, setConfig] = useState({ shape: "drop", color: "#6E56F0", eyeColor: "white" });

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <AgentAvatar config={config} size={120} motion={motion} look={look} label="Configured agent" />
      <Segmented value={motion} onChange={setMotion} options={motions} size="small" />
      <Segmented value={look} onChange={setLook} options={looks} size="small" />
      <Segmented value={config.eyeColor} onChange={(eyeColor) => setConfig((current) => ({ ...current, eyeColor }))} options={eyeColors} size="small" />
      <div className="mx-auto flex w-100 flex-wrap justify-center">
        {AGENT_AVATAR_PARTS.shape.map((shape) => (
          <button
            key={shape}
            type="button"
            aria-pressed={config.shape === shape}
            className="flex w-20 shrink-0 cursor-pointer flex-col items-center gap-1 border-0 bg-transparent p-0 py-1.5 text-inherit"
            onClick={() => setConfig((current) => ({ ...current, shape }))}
          >
            <span className="rounded-2xl" style={config.shape === shape ? { boxShadow: "0 0 0 2px var(--card), 0 0 0 4px var(--foreground)" } : undefined}>
              <AgentAvatar config={{ shape, color: config.color, eyeColor: config.eyeColor }} size={64} motion="still" look={look} label={shape} />
            </span>
            <span className="text-[15px] leading-7 text-muted-foreground capitalize">{shape}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {AGENT_AVATAR_PARTS.color.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            aria-pressed={config.color === color}
            className="size-7 rounded-full border border-border"
            style={{
              background: color,
              boxShadow: config.color === color ? "0 0 0 2px var(--card), 0 0 0 4px var(--foreground)" : undefined,
            }}
            onClick={() => setConfig((current) => ({ ...current, color }))}
          />
        ))}
      </div>
    </div>
  );
}
```

## Size

`size` is the width and height in pixels.

```live-react
import { AgentAvatar } from "devnonla-ui";

export default function Demo() {
  const face = { shape: "drop", color: "#6E56F0" };
  return [24, 32, 48, 64, 96].map((size) => (
    <div key={size} className="flex flex-col items-center gap-1">
      <AgentAvatar config={face} size={size} />
      <span className="text-[15px] leading-7 text-muted-foreground">{size}</span>
    </div>
  ));
}
```

## API

Pass shape, color, and eye color together: `config={{ shape, color, eyeColor }}`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `config.shape` | Silhouette of the face. | `circle` \| `square` \| `triangle` \| `diamond` \| `hex` \| `gem` \| `pill` \| `arch` \| `cloud` \| `blob` \| `drop` \| `shield` | `circle` |
| `config.color` | Face color, as a hex string. | `string` | `#6E56F0` |
| `config.eyeColor` | Pupil color. Omitted uses black, or white when the face is dark. | `black` \| `white` | black, or white on a dark face |
| `size` | Width and height, in pixels. | `number` | `64` |
| `motion` | `still` holds the pose. `idle` looks around and blinks. | `still` \| `idle` | `still` |
| `look` | Fixed facing. The head turns that way and the eyes follow. | `forward` \| `left` \| `right` \| `up` \| `down` \| `up-left` \| `up-right` \| `down-left` \| `down-right` | `forward` |
| `className` | Extra class on the root element. | `string` | `-` |
| `label` | Accessible name. | `string` | `Agent` |
