---
path: "/colors"
title: "Colors"
group: "Get started"
groupOrder: 1
order: 4
icon: "palette-24"
wide: true
---

# Colors

Every color in the theme, and where it shows up. Use the theme switch in the header to see dark and light.

**Config** is what you set. **Derived** follows it. A second name on the row is the same color, the one Tailwind classes use (`bg-card`, `text-brand`).

```live-react
import { useEffect, useState } from "react";

const GROUPS = [
  {
    title: "Page and text",
    note: "Config. Placeholders and markdown use these text colors directly.",
    items: [
      ["--nonla-bg", "background", "Page background. Chat sits on this. Desktop wallpaper uses it too."],
      ["--nonla-text-main", "foreground", "Primary text, markdown body, and headings."],
      ["--nonla-text-secondary", "muted-foreground", "Secondary text: descriptions and inactive controls."],
      ["--nonla-text-tertiary", "tertiary-foreground", "Third step: input steppers and quieter icons. The shimmer uses it."],
      ["--nonla-text-quaternary", "quaternary-foreground", "Faintest step. Placeholders and code line numbers."],
      ["--nonla-text-on-solid", "", "Label on a solid fill: brand button, danger button, tag, checkbox, the chat stop button."],
    ],
  },
  {
    title: "Brand and status",
    note: "Config.",
    items: [
      ["--nonla-brand", "brand", "Call to action: primary button, checkbox, switch, current page. Focus ring is this color at 55%."],
      ["--nonla-danger", "destructive", "Errors, danger actions, the required mark, removed diff lines."],
      ["--nonla-success", "success", "Success alerts, added diff lines, the success checkbox and switch."],
      ["--nonla-warn", "warn", "Warning alerts and tags."],
      ["--nonla-link", "link", "Links, and the link button."],
    ],
  },
  {
    title: "Surfaces",
    note: "Sidebar, card, and the bar are config. The two fills follow the card.",
    items: [
      ["--nonla-sidebar", "sidebar", "Sidebar, and the fill of a focused field."],
      ["--nonla-surface", "card", "Cards, menus, modal, drawer, and popover."],
      ["--nonla-bar", "bar", "A solid bar. The desktop window title uses it. Toolbars and other strips can too."],
      ["--nonla-fill", "muted", "Soft wash on a card: chips, skeleton, filled inputs, inline code, table headers, tool-call input."],
      ["--nonla-fill-strong", "muted-strong", "Stronger wash: hover on a chip or filled input, the user bubble, tool results."],
    ],
  },
  {
    title: "Lines, fields, and washes",
    note: "Two borders, both config. The main one is the outline. The secondary one is the faint line inside.",
    items: [
      ["--nonla-border", "border", "The outline around a control, card, menu, or input."],
      ["--nonla-border-secondary", "border-secondary", "The faint border inside. Table rows, card sections, and chat dividers."],
      ["--nonla-ink-hover", "ink-hover", "Hover wash. Sidebar rows, menu and select rows, buttons, and the desktop header."],
      ["--nonla-ink-active", "ink-active", "Pressed or selected wash. Current sidebar item, selected select row, open menu row, and a pressed button."],
      ["--nonla-input", "input", "Rest stroke of a field."],
      ["--nonla-input-focus", "input-focus", "Stroke when a field is focused."],
      ["--mask", "", "Scrim behind a modal or drawer."],
      ["--nonla-scrollbar-thumb", "", "Scrollbar thumb."],
      ["--nonla-scrollbar-thumb-hover", "", "Scrollbar thumb on hover."],
    ],
  },
  {
    title: "Brand scale",
    note: "Mixed from brand. 500 is the knob. You do not set the steps.",
    items: [
      ["--brand-50", "", "Calendar hover, and the middle of a date range."],
      ["--brand-100", "", "Tint, one step stronger than 50."],
      ["--brand-200", "", "Selected day, and the start or end of a range."],
      ["--brand-300", "", "Tint."],
      ["--brand-400", "", "Tint, close to the knob."],
      ["--brand-500", "brand", "The brand knob. Same as --nonla-brand."],
      ["--brand-600", "", "Shade, mixed toward the text color."],
      ["--brand-700", "", "Filled and link button text."],
      ["--brand-800", "", "Deepest shade."],
    ],
  },
];

function formatColor(value) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  const hex = [r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("");
  if (a >= 255) return `#${hex}`;
  return `#${hex} · ${Math.round((a / 255) * 100)}%`;
}

function Row({ token, alias, use, tick }) {
  const [label, setLabel] = useState("");
  const fill = token.startsWith("bg-") ? token : "";

  useEffect(() => {
    const node = document.getElementById("swatch-" + token);
    if (!node) return;
    setLabel(formatColor(getComputedStyle(node).backgroundColor));
  }, [tick, token]);

  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-3 border-b border-border-secondary py-2.5 sm:grid-cols-[2.75rem_minmax(0,1fr)_auto]">
      <div className="relative size-11 overflow-hidden rounded-lg border border-border">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-conic-gradient(var(--nonla-text-main) 0% 25%, transparent 0% 50%)",
            backgroundSize: "10px 10px",
          }}
        />
        <div id={"swatch-" + token} className={"absolute inset-0 " + fill} style={fill ? undefined : { background: "var(" + token + ")" }} />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-mono text-[13px] text-foreground">{token}</span>
          {alias ? <span className="font-mono text-[12px] text-tertiary-foreground">{alias}</span> : null}
        </div>
        <div className="text-[13px] leading-5 text-muted-foreground">{use}</div>
      </div>
      <div className="col-start-2 font-mono text-[12px] text-quaternary-foreground sm:col-start-3 sm:text-right">{label}</div>
    </div>
  );
}

export default function Demo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const watch = new MutationObserver(() => setTick((value) => value + 1));
    watch.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => watch.disconnect();
  }, []);

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 text-left">
      {GROUPS.map((group) => (
        <section key={group.title} className="flex flex-col">
          <div className="text-base font-medium text-foreground">{group.title}</div>
          <div className="mt-1 mb-2 text-[13px] text-muted-foreground">{group.note}</div>
          {group.items.map(([token, alias, use]) => (
            <Row key={token} token={token} alias={alias} use={use} tick={tick} />
          ))}
        </section>
      ))}
    </div>
  );
}
```
