<!-- Generated from docs/pages/components/button.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/button -->

# Button

To trigger an operation.

## API

`type` sets the look. Pass `color` and `variant` together to override it. `nostyle` leaves the paint to `className` and `style`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `type` | Visual style. `icon` is a square, icon-only button. | `default` \| `primary` \| `text` \| `icon` \| `link` | `default` |
| `size` | Control height. `middle` and `medium` match `default`. `xs` matches `small`. | `small` \| `default` \| `large` | `default` |
| `danger` | Use the danger color. | `boolean` | `false` |
| `loading` | Shows a spinner and blocks clicks. Pass `{ delay, icon }` to wait or replace the spinner. | `boolean` \| `{ delay?: number; icon?: ReactNode }` | `false` |
| `disabled` | Blocks clicks. | `boolean` | `false` |
| `icon` | Icon shown with the label. | `ReactNode` | — |
| `iconPlacement` | Which side the icon sits on. `iconPosition` is the same prop. | `start` \| `end` | `start` |
| `shape` | Corner shape. `circle` and `round` are fully rounded. | `default` \| `circle` \| `round` \| `square` | `default` |
| `color` | Theme color name, such as `primary` or `blue`. Pair it with `variant`. | `string` | — |
| `variant` | Fill style. `nostyle` drops the theme paint. | `outlined` \| `solid` \| `filled` \| `text` \| `icon` \| `link` \| `nostyle` | — |
| `ghost` | Transparent background, except on `text` and `link`. | `boolean` | `false` |
| `block` | Stretch to the full width of the parent. | `boolean` | `false` |
| `href` | Renders an anchor instead of a button. | `string` | — |
| `htmlType` | Native button type. | `button` \| `submit` \| `reset` | `button` |

### Button.Group

Shares one `size` with every button inside.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `size` | Size for every button in the group. A button's own `size` wins. | `small` \| `default` \| `large` | — |
| `className` | Extra class on the group. | `string` | — |
| `style` | Inline style on the group. | `CSSProperties` | — |
