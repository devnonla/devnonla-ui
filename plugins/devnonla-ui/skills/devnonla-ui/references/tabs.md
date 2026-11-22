<!-- Generated from docs/pages/components/tabs.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/tabs -->

# Tabs

Switch between views. The bar stays on one line and scrolls when the labels do not fit.

## API

### Tabs

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `items` | Tabs, in order | `TabItem[]` | — |
| `variant` | `line` underlines the active tab; `pill` raises it on a soft track | `"line"` \| `"pill"` | `"line"` |
| `activeKey` | Active tab key, controlled | `string` | — |
| `defaultActiveKey` | Initial tab when uncontrolled | `string` | first enabled tab |
| `onChange` | Fires with the key of the clicked tab | `(key: string) => void` | — |
| `aria-label` | Accessible name of the tab list | `string` | `"Tabs"` |
| `className` | Extra class on the root | `string` | — |
| `style` | Inline style on the root | `CSSProperties` | — |

### Tab item

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `key` | Unique tab key | `string` | — |
| `label` | Tab text | `ReactNode` | — |
| `children` | Panel content shown while the tab is active | `ReactNode` | — |
| `icon` | An `Icon` name, or a node | `ReactNode` | — |
| `disabled` | Tab cannot be selected | `boolean` | `false` |
