<!-- Generated from docs/pages/components/tree.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/tree -->

# Tree

Show nested data, like files, settings, or an org chart. Click a row (icon or text) to open or close it; there is no expand arrow. Thin SVG guide lines run down from each parent's icon and tie every child to it: a `├` for a child with siblings below it, a rounded `└` for the last one.

## API

### Tree

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `treeData` | Nodes to show | `TreeNode[]` | — |
| `showLine` | Draw guide lines from each parent to its children | `boolean` | `true` |
| `expandedKeys` | Open parents, controlled | `string[]` | — |
| `defaultExpandedKeys` | Open parents on first render | `string[]` | — |
| `defaultExpandAll` | Open every parent on first render | `boolean` | `false` |
| `onExpand` | Fires when a parent opens or closes | `(keys, { node, expanded }) => void` | — |
| `selectedKeys` | Picked rows, controlled | `string[]` | — |
| `defaultSelectedKeys` | Picked rows on first render | `string[]` | — |
| `onSelect` | Fires when a row is picked or unpicked | `(keys, { node, selected }) => void` | — |
| `selectable` | Allow picking rows. A click still opens and closes parents with `false` | `boolean` | `true` |
| `multiple` | A click toggles a row in the selection | `boolean` | `false` |
| `titleRender` | Custom row content | `(node) => ReactNode` | — |
| `size` | Row height and indent: 24 / 32 / 40px, like the other controls | `"small" \| "default" \| "large"` | `"default"` |
| `aria-label` | Name for screen readers | `string` | — |
| `className` | Extra class on the tree | `string` | — |

### TreeNode

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `key` | Unique id | `string` | — |
| `title` | Row text | `ReactNode` | — |
| `icon` | An `Icon` name, or a node | `ReactNode` | — |
| `children` | Child nodes | `TreeNode[]` | — |
| `disabled` | Shown dimmed; can't be picked or opened | `boolean` | — |
| `isLeaf` | `false` makes the row open and close without `children` (lazy loading) | `boolean` | — |

The line color is `--nonla-tree-line`.
