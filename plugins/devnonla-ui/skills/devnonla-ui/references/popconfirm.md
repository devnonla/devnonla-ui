<!-- Generated from docs/pages/components/popconfirm.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/popconfirm -->

# Popconfirm

A compact confirmation dialog of an action.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `title` | Bold first line. | `ReactNode` | — |
| `description` | Muted text under the title. | `ReactNode` | — |
| `children` | Trigger element. | `ReactNode` | — |
| `okText` | OK button label. | `ReactNode` | `"OK"` |
| `cancelText` | Cancel button label. | `ReactNode` | `"Cancel"` |
| `okType` | OK button type. `danger` makes it a red primary button. | `"primary" \| "default" \| "link" \| "text" \| "danger"` | `"primary"` |
| `open` | Controls visibility. | `boolean` | — |
| `placement` | Side and alignment of the popup, such as `topLeft`. | `"top" \| "bottom" \| "left" \| "right" \| "topLeft" \| …` | `"top"` |
| `icon` | Leading icon. `null` hides it. | `ReactNode \| null` | — |
| `showCancel` | Shows the Cancel button. | `boolean` | `true` |
| `disabled` | Renders only the trigger, with no popup. | `boolean` | — |
| `onConfirm` | Called by OK. A returned promise keeps the button loading. | `() => void \| Promise<void>` | — |
| `onCancel` | Called by Cancel. | `() => void` | — |
| `onOpenChange` | Called when the popup opens or closes. | `(open: boolean) => void` | — |
| `okButtonProps` | `danger` and `type` override the OK button. | `{ danger?: boolean; type?: string }` | — |
| `cancelButtonProps` | Props passed to the Cancel `Button`. | `ButtonProps` | — |
| `getPopupContainer` | Returns the element the popup mounts into. | `() => HTMLElement` | — |
| `className` | Extra class on the popup panel. | `string` | — |
| `overlayClassName` | Same as `className`. | `string` | — |
| `styles` | `root` sets an inline style on the popup panel. | `{ root?: CSSProperties }` | — |
