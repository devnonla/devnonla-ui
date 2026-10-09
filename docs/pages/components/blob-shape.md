---
path: "/components/blob-shape"
title: "BlobShape"
group: "General"
groupOrder: 3
order: 4
icon: "magic-wand-3-24"
---

# BlobShape

Decorative SVG shapes for landing pages. Blobs and orbs sit behind content. Thin lines split two sections.

```live-react
import { BlobShape } from "devnonla-ui";

export default function Demo() {
  return (
    <div className="grid w-full grid-cols-2 gap-6 sm:grid-cols-4">
      {["blob", "blob-alt", "ring", "orb", "square", "star", "circle", "cursor"].map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <BlobShape variant={variant as "blob"} width={96} />
          <span className="text-xs text-muted-foreground">{variant}</span>
        </div>
      ))}
    </div>
  );
}
```

## Background

A decoration sits in a `-100 -100 200 200` box. Place it with `className`, and keep the content above it with `relative`.

```live-react
import { BlobShape } from "devnonla-ui";

export default function Demo() {
  return (
    <section className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-xl border border-border-secondary">
      <BlobShape className="absolute -left-16 -top-16" variant="orb" width={320} opacity={0.5} blur={40} />
      <BlobShape className="absolute -bottom-20 -right-12" variant="blob-alt" width={260} color="var(--nonla-brand)" opacity={0.15} />
      <p className="relative text-lg font-semibold">Build agents faster</p>
    </section>
  );
}
```

## Appearance

`appearance` sets how a shape is painted. `solid` fills it, `outline` strokes its edge, and `sticker` adds a white border and a soft drop shadow. Every decoration supports all three.

```live-react
import { BlobShape } from "devnonla-ui";

const SHAPES = ["blob", "blob-alt", "ring", "orb", "square", "star", "circle", "cursor"] as const;
const APPEARANCES = ["solid", "outline", "sticker"] as const;

export default function Demo() {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border-secondary bg-muted p-6">
      <div className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] items-center gap-x-8 gap-y-6 text-sm">
        <span />
        {APPEARANCES.map((appearance) => (
          <span key={appearance} className="text-center text-xs text-muted-foreground">{appearance}</span>
        ))}
        {SHAPES.map((variant) => (
          <div key={variant} className="contents">
            <span className="text-xs text-muted-foreground">{variant}</span>
            {APPEARANCES.map((appearance) => (
              <div key={appearance} className="flex justify-center">
                <BlobShape variant={variant} appearance={appearance} width={72} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## API

`variant` picks the shape. `blob`, `blob-alt`, `ring`, `orb`, `square`, `star`, `circle`, and `cursor` are decorations. The rest are dividers. `color` is the fill, or the stroke for `outline` and dividers. Any CSS color works, including `var(--nonla-*)`.

The shape ignores pointer events and is hidden from assistive technology.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `variant` | Decorations: `blob`, `blob-alt`, `ring`, `orb`, `square`, `star`, `circle`, `cursor`. Dividers: `horizontal`, `fade`, `dashed`, `double`, `ornament`, `zigzag`, `wave`, `waves`, `mountain`, `vertical`. | `blob` \| `blob-alt` \| `ring` \| `orb` \| `square` \| `star` \| `circle` \| `cursor` \| `horizontal` \| `fade` \| `dashed` \| `double` \| `ornament` \| `zigzag` \| `wave` \| `waves` \| `mountain` \| `vertical` | `blob` |
| `color` | Fill color, or stroke for `outline` and dividers. | `string` | `var(--nonla-brand)` |
| `width` | Width in px or any CSS length. Decorations default to `320`. Dividers default to `100%`, and `vertical` defaults to `1`. | `number` \| `string` | `320` for decorations, `100%` for dividers |
| `height` | Explicit height. Usually omit it so the aspect ratio holds. Fixed-height dividers use their own default, and `vertical` defaults to `100%`. | `number` \| `string` | `-` |
| `opacity` | Opacity from `0` to `1`. | `number` | `-` |
| `blur` | Gaussian blur in px. Softens edges for glow-style backgrounds. | `number` | `-` |
| `flipX` | Mirror horizontally. | `boolean` | `false` |
| `flipY` | Mirror vertically. Use it to put a divider on the top edge of a section. | `boolean` | `false` |
| `appearance` | `solid` fills the shape. `outline` strokes its edge. `sticker` adds a white border and a drop shadow. Dividers ignore it. | `solid` \| `outline` \| `sticker` | `solid` |
| `className` | Extra class on the root. Use it for positioning, such as `absolute -z-10`. | `string` | `-` |
| `style` | Inline style on the root. | `CSSProperties` | `-` |
