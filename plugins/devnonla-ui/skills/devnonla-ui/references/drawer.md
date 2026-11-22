<!-- Generated from docs/pages/components/drawer.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/drawer -->

# Drawer

A panel which slides in from the edge of the screen.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `open` | Whether the drawer is shown | `boolean` | `false` |
| `title` | Header title | `ReactNode` | — |
| `children` | Drawer body | `ReactNode` | — |
| `footer` | Content in a bar under the body | `ReactNode` | — |
| `extra` | Actions in the header, before the close button | `ReactNode` | — |
| `placement` | Edge the drawer slides in from | `right` \| `left` \| `top` \| `bottom` | `right` |
| `size` | Width for `left`/`right`, height for `top`/`bottom` | `number` \| `string` | `378` |
| `closable` | Show the close button in the header | `boolean` | `true` |
| `destroyOnHidden` | Unmount the body after the drawer closes | `boolean` | `false` |
| `onClose` | Fires when the drawer asks to close | `() => void` | — |
| `onOpenChange` | Fires with the next open state | `(open: boolean) => void` | — |
| `className` | Extra class on the panel | `string` | — |
| `styles` | Inline styles for `content`, `header`, `body` and `footer` | `{ content?, header?, body?, footer?: CSSProperties }` | — |
