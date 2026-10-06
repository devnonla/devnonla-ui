---
path: "/components/color-picker"
title: "ColorPicker"
group: "Data Entry"
groupOrder: 5
order: 9
icon: "paint-brush-24"
---

# ColorPicker

Color selection — palette, hue/alpha, HEX / RGB / HSB.

```live-react
import { ColorPicker } from "devnonla-ui";

export default function Demo() {
  return (
    <>
      <ColorPicker size="small" />
      <ColorPicker />
      <ColorPicker size="large" showText />
    </>
  );
}
```
