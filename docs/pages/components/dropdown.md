---
path: "/components/dropdown"
title: "Dropdown"
group: "Navigation"
groupOrder: 8
order: 1
icon: "list-bar-24"
---

# Dropdown

A dropdown list.

```live-react
import { Button, Dropdown, message } from "devnonla-ui";

export default function Demo() {
  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items: [
          { key: "1", label: "Edit" },
          { type: "divider" },
          { key: "2", label: "Delete", danger: true },
        ],
        onClick: ({ key }) => message.info(`Menu ${key}`),
      }}
    >
      <Button>Click menu</Button>
    </Dropdown>
  );
}
```

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
