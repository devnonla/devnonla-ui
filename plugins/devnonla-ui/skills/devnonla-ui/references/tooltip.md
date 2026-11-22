<!-- Generated from docs/pages/components/tooltip.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/tooltip -->

# Tooltip

A simple text popup tip.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `title` | Tip content. Empty renders only `children` | `ReactNode` | — |
| `children` | Trigger element. Must accept a ref | `ReactNode` | — |
| `placement` | Side and alignment of the tip | `PopperPlacement` | `"top"` |
| `open` | Visibility, controlled | `boolean` | — |
| `defaultOpen` | Initial visibility when uncontrolled | `boolean` | `false` |
| `onOpenChange` | Fires when the tip shows or hides | `(open: boolean) => void` | — |
| `mouseEnterDelay` | Hover delay before showing, in seconds | `number` | `0.1` |
| `arrow` | Small arrow pointing at the trigger | `boolean` | `true` |
| `getPopupContainer` | Element to portal the tip into | `() => HTMLElement` | `App` host |
| `className` | Extra class on the tip panel | `string` | — |
| `overlayClassName` | Extra class on the tip panel | `string` | — |
