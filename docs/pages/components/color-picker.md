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

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `value` | Current color, for a controlled picker. `null` shows it cleared. | `string` \| `Color` \| `null` | — |
| `defaultValue` | Initial color, for an uncontrolled picker | `string` \| `Color` \| `null` | — |
| `size` | Trigger height | `small` \| `default` \| `large` | `default` |
| `showText` | Show the color text in the trigger, or render your own | `boolean` \| `(color) => ReactNode` | `false` |
| `format` | Text format, for a controlled format | `hex` \| `rgb` \| `hsb` | — |
| `defaultFormat` | Initial text format | `hex` \| `rgb` \| `hsb` | `hex` |
| `presets` | Groups of preset swatches under the panel | `{ label, colors, key?, defaultOpen? }[]` | — |
| `allowClear` | Show a clear button in the panel | `boolean` | `false` |
| `disabled` | Blocks opening the panel | `boolean` | `false` |
| `disabledAlpha` | Hide the alpha slider and keep colors opaque | `boolean` | `false` |
| `disabledFormat` | Lock the format switch | `boolean` | `false` |
| `status` | Validation outline on the trigger | `error` \| `warning` | — |
| `trigger` | How the panel opens | `click` \| `hover` | `click` |
| `placement` | Panel side and alignment, such as `top` or `bottomLeft` | `top` \| `bottom` \| `bottomLeft` \| … | `bottomLeft` |
| `arrow` | Show an arrow on the panel | `boolean` \| `{ pointAtCenter?: boolean }` | `false` |
| `open` | Panel open state, for a controlled panel | `boolean` | — |
| `children` | Custom trigger in place of the swatch button | `ReactNode` | — |
| `onChange` | Fires on every change, with the color and its CSS string | `(value: Color, css: string) => void` | — |
| `onChangeComplete` | Fires when a drag ends or a value is committed | `(value: Color) => void` | — |
| `onFormatChange` | Fires when the text format changes | `(format) => void` | — |
| `onOpenChange` | Fires when the panel opens or closes | `(open: boolean) => void` | — |
| `onClear` | Fires when the clear button is clicked | `() => void` | — |
| `panelRender` | Wrap or rebuild the panel from its `Picker` and `Presets` parts | `(panel, { components }) => ReactNode` | — |
| `destroyOnHidden` | `false` keeps the panel mounted while closed | `boolean` | — |
| `getPopupContainer` | Element the panel portals into | `() => HTMLElement` | — |
| `className` | Extra class on the trigger | `string` | — |
| `style` | Inline style on the trigger | `CSSProperties` | — |
| `popupClassName` | Extra class on the panel | `string` | — |
| `classNames` | Classes per part: `root`, `body`, `content`, `description`, `popup` | `Record<slot, string>` | — |
| `styles` | Inline styles per part, same keys as `classNames` | `Record<slot, CSSProperties>` | — |
