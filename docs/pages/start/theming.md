---
path: "/theming"
title: "Theming"
group: "Get started"
groupOrder: 1
order: 3
icon: "paint-brush-24"
wide: true
---

# Theming

Font, body size, corner radius, and control height. Colors are on [Colors](/colors).

**Config** is the font, `--nonla-base-text-size`, `--nonla-radius`, and the three control heights. Small and large radius follow the radius knob. Light does not change these. `text-base` follows the body size, 15px, leading 1.6. `text-md` is 16px. `text-lg` is 18px. The other `text-*` steps stay on Tailwind’s default scale.

```live-react
import { useEffect, useState } from "react";

const GROUPS = [
  {
    title: "Font",
    note: "Config is --nonla-font. Mono is for code.",
    items: [
      { token: "--nonla-font", alias: "font-sans", use: "UI text. Buttons, fields, markdown, and this page.", kind: "font", sample: "Nonla 0123", className: "font-sans" },
      { token: "--font-mono", alias: "font-mono", use: "Code, token names, and line numbers.", kind: "font", sample: "const n = 8", className: "font-mono" },
    ],
  },
  {
    title: "Text",
    note: "Config is --nonla-base-text-size. Mono code reads --nonla-mono-text-size.",
    items: [
      { token: "--nonla-base-text-size", alias: "", use: "Default body size. Leading is 1.6.", kind: "type", className: "text-(length:--nonla-base-text-size) leading-[calc(var(--nonla-base-text-size)*1.6)]" },
      { token: "--nonla-mono-text-size", alias: "", use: "Inline code and fenced code. Defaults to 90% of the body size.", kind: "type", className: "font-mono text-(length:--nonla-mono-text-size) leading-[calc(var(--nonla-mono-text-size)*1.6)]" },
    ],
  },
  {
    title: "Radius",
    note: "One knob. Tailwind rounded uses it. Small is 2px tighter. Large is 2px rounder.",
    items: [
      { token: "--nonla-radius-sm", alias: "rounded-sm", use: "Small controls. Tailwind rounded-sm.", kind: "radius", className: "rounded-sm" },
      { token: "--nonla-radius", alias: "rounded", use: "The knob. Tailwind rounded.", kind: "radius", className: "rounded" },
      { token: "--nonla-radius-lg", alias: "rounded-lg", use: "Large controls. Tailwind rounded-lg.", kind: "radius", className: "rounded-lg" },
    ],
  },
  {
    title: "Control height",
    note: "Config. Light does not change these.",
    items: [
      { token: "--nonla-height-sm", alias: "", use: "Small button, input, and sidebar row.", kind: "height" },
      { token: "--nonla-height", alias: "", use: "Default button and input.", kind: "height" },
      { token: "--nonla-height-lg", alias: "", use: "Large button and input.", kind: "height" },
    ],
  },
];

function firstFamily(stack) {
  const name = stack.split(",")[0].trim().replace(/^["']|["']$/g, "");
  return name || stack;
}

function Row({ item, tick }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const node = document.getElementById("specimen-" + item.token);
    if (!node) return;
    const style = getComputedStyle(node);
    if (item.kind === "font") setLabel(firstFamily(style.fontFamily));
    else if (item.kind === "type") setLabel(style.fontSize + " / " + style.lineHeight);
    else if (item.kind === "radius") setLabel(style.borderRadius);
    else setLabel(style.height);
  }, [tick, item]);

  const specimen =
    item.kind === "font" ? (
      <div id={"specimen-" + item.token} className={"text-[15px] leading-6 text-foreground " + item.className}>
        {item.sample}
      </div>
    ) : item.kind === "type" ? (
      <div id={"specimen-" + item.token} className={"text-foreground " + item.className}>
        Text
      </div>
    ) : item.kind === "radius" ? (
      <div id={"specimen-" + item.token} className={"size-11 border border-border bg-muted " + (item.className ?? "")} style={item.className ? undefined : { borderRadius: "var(" + item.token + ")" }} />
    ) : (
      <div id={"specimen-" + item.token} className="w-16 border border-border bg-muted" style={{ height: "var(" + item.token + ")", borderRadius: "var(--nonla-radius)" }} />
    );

  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-3 border-b border-border-secondary py-2.5 sm:grid-cols-[7rem_minmax(0,1fr)_auto]">
      <div className="flex min-h-11 items-center">{specimen}</div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-mono text-[13px] text-foreground">{item.token}</span>
          {item.alias ? <span className="font-mono text-[12px] text-tertiary-foreground">{item.alias}</span> : null}
        </div>
        <div className="text-[13px] leading-5 text-muted-foreground">{item.use}</div>
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
          {group.items.map((item) => (
            <Row key={item.token} item={item} tick={tick} />
          ))}
        </section>
      ))}
    </div>
  );
}
```

## Toggle

```tsx
import { ThemeToggle, setColorMode } from "devnonla-ui";

setColorMode("light");

<ThemeToggle />
```

```live-react
import { ThemeToggle } from "devnonla-ui";

export default function Demo() {
  return <ThemeToggle />;
}
```
