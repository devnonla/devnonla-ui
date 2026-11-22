<!-- Generated from docs/pages/components/modal.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/modal -->

# Modal

Display a dialog for user decisions or extra content.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `open` | Shows the modal. `visible` is the same prop. | `boolean` | `false` |
| `title` | Header text. | `ReactNode` | — |
| `children` | Body content. | `ReactNode` | — |
| `footer` | Replaces the OK and Cancel buttons. `null` hides the footer. | `ReactNode \| null` | — |
| `okText` | OK button label. | `ReactNode` | `"OK"` |
| `cancelText` | Cancel button label. | `ReactNode` | `"Cancel"` |
| `width` | Dialog width. | `number \| string` | `480` |
| `centered` | Centers the dialog vertically. | `boolean` | `false` |
| `confirmLoading` | Forces the OK button's loading state. | `boolean` | — |
| `onOk` | Called by OK. A returned promise keeps the button loading. | `() => void \| Promise<void>` | — |
| `onCancel` | Called by Cancel, the close button, Escape or a mask click. | `() => void` | — |
| `onClose` | Called with `onCancel` whenever the modal is dismissed. | `() => void` | — |
| `onOpenChange` | Called with the next open state, also after `onOk` resolves. | `(open: boolean) => void` | — |
| `afterClose` | Called once the close animation ends. | `() => void` | — |
| `okButtonProps` | Props passed to the OK `Button`. | `ButtonProps` | — |
| `cancelButtonProps` | Props passed to the Cancel `Button`. | `ButtonProps` | — |
| `closable` | Shows the close button in the header. | `boolean` | `true` |
| `maskClosable` | Closes on a click outside the dialog. | `boolean` | `true` |
| `destroyOnHidden` | Unmounts the body after close. `destroyOnClose` is the same prop. | `boolean` | `false` |
| `className` | Extra class on the dialog. | `string` | — |
| `style` | Inline style on the dialog, such as `{ top }`. | `CSSProperties` | — |
| `styles` | Inline styles for the `header`, `body`, `footer` and `content` parts. | `{ header?, body?, footer?, content?: CSSProperties }` | — |

`Modal.confirm(props)` opens a dialog without state and returns `{ destroy, update }`. It takes `title`, `content`, `okText`, `cancelText`, `okType`, `okButtonProps`, `onOk`, `onCancel`, `centered` and `width`; `Modal.info`, `Modal.success`, `Modal.warning` and `Modal.error` take the same props.
