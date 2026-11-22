<!-- Generated from docs/pages/components/dropdown.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/dropdown -->

# Dropdown

A dropdown list.

## API

### Dropdown

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `menu` | Menu items and click handler | `{ items, onClick?, className?, style? }` | — |
| `children` | Trigger element | `ReactNode` | — |
| `trigger` | Events that open the menu | `("click" \| "hover" \| "contextMenu")[]` | `["click"]` |
| `placement` | Menu side and alignment, such as `top` or `bottomLeft` | `top` \| `bottom` \| `bottomLeft` \| … | `bottomLeft` |
| `disabled` | Blocks opening the menu | `boolean` | `false` |
| `open` | Menu open state, for a controlled menu | `boolean` | — |
| `onOpenChange` | Fires when the menu opens or closes | `(open: boolean) => void` | — |
| `className` | Extra class on the menu popup | `string` | — |
| `overlayClassName` | Same as `className` | `string` | — |
| `classNames` | `overlay` on the menu panel, `root` on the trigger | `{ root?: string; overlay?: string }` | — |

### menu

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `items` | Menu entries. `null` entries are skipped. | `MenuItem[]` | — |
| `onClick` | Fires with the clicked item's key | `({ key }) => void` | — |
| `className` | Extra class on the menu popup | `string` | — |
| `style` | Inline style on the menu popup | `CSSProperties` | — |

### Menu item

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `key` | Id passed to `onClick`. Falls back to the index. | `string` | — |
| `label` | Item text, or group heading for `group` | `ReactNode` | — |
| `icon` | Icon before the label | `ReactNode` | — |
| `type` | `divider` draws a line. `group` labels its `children`. | `item` \| `divider` \| `group` | `item` |
| `children` | Submenu items, or the items of a `group` | `MenuItem[]` | — |
| `danger` | Use the danger color | `boolean` | `false` |
| `disabled` | Blocks selecting the item | `boolean` | `false` |
| `onClick` | Fires when this item is selected | `({ key }) => void` | — |
| `className` | Extra class on the item | `string` | — |
| `style` | Inline style on the item | `CSSProperties` | — |
