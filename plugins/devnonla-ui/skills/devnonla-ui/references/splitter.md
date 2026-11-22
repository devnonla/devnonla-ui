<!-- Generated from docs/pages/components/splitter.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/splitter -->

# Splitter

Resizable split panel layout — kéo thanh giữa các vùng để đổi kích thước.

## API

### Splitter

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `children` | `Splitter.Panel` elements. Other children are ignored. | `ReactNode` | — |
| `orientation` | Panel direction. `vertical` stacks panels top to bottom. | `"horizontal" \| "vertical"` | `"horizontal"` |
| `vertical` | Same as `orientation="vertical"`. `orientation` wins when both are set. | `boolean` | `false` |
| `onResize` | Called with every panel size in px as sizes change. | `(sizes: number[]) => void` | — |
| `onResizeStart` | Called with panel sizes when a drag starts. | `(sizes: number[]) => void` | — |
| `onResizeEnd` | Called with panel sizes when a drag ends. | `(sizes: number[]) => void` | — |
| `draggerIcon` | Icon drawn on each drag bar. | `ReactNode` | — |
| `destroyOnHidden` | Unmounts panels collapsed to zero size. A panel can override it. | `boolean` | `false` |
| `className` | Extra class on the root. | `string` | — |
| `style` | Inline style on the root. | `CSSProperties` | — |
| `classNames` | Classes for the `root`, `panel` and `dragger` parts. | `{ root?, panel?, dragger?: string }` | — |
| `styles` | Inline styles for the `root`, `panel` and `dragger` parts. | `{ root?, panel?, dragger?: CSSProperties }` | — |

### Splitter.Panel

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `children` | Panel content. | `ReactNode` | — |
| `defaultSize` | Initial size, in px or a percent such as `"40%"`. | `number \| string` | — |
| `size` | Size, controlled. In px or a percent string. | `number \| string` | — |
| `min` | Smallest size while dragging, in px or percent. | `number \| string` | — |
| `max` | Largest size while dragging, in px or percent. | `number \| string` | — |
| `resizable` | `false` locks the drag bars on both sides of this panel. | `boolean` | `true` |
| `destroyOnHidden` | Unmounts this panel at zero size. Overrides the Splitter's value. | `boolean` | — |
| `className` | Extra class on the panel. | `string` | — |
| `style` | Inline style on the panel. | `CSSProperties` | — |
