---
path: "/components/tree"
title: "Tree"
group: "Data Display"
groupOrder: 6
order: 12
icon: "list-bar-24"
---

# Tree

Show nested data, like files, settings, or an org chart. Click a row (icon or text) to open or close it; there is no expand arrow. Thin SVG guide lines run down from each parent's icon and tie every child to it: a `├` for a child with siblings below it, a rounded `└` for the last one.

```live-react
import { Tree } from "devnonla-ui";

const files = [
  {
    key: "src",
    title: "src",
    icon: "book",
    children: [
      {
        key: "components",
        title: "components",
        icon: "book",
        children: [
          { key: "button", title: "Button.tsx", icon: "code" },
          { key: "tree", title: "Tree.tsx", icon: "code" },
          { key: "tooltip", title: "Tooltip.tsx", icon: "code" },
        ],
      },
      {
        key: "lib",
        title: "lib",
        icon: "book",
        children: [
          { key: "cn", title: "cn.ts", icon: "code" },
          { key: "sizes", title: "sizes.ts", icon: "code" },
        ],
      },
      { key: "index", title: "index.ts", icon: "code" },
      { key: "styles", title: "styles.css", icon: "document" },
    ],
  },
  { key: "pkg", title: "package.json", icon: "json" },
  { key: "readme", title: "README.md", icon: "md" },
];

export default function Demo() {
  return <Tree aria-label="Files" treeData={files} defaultExpandAll defaultSelectedKeys={["tree"]} className="max-w-xs" />;
}
```

## Controlled

Keep `expandedKeys` and `selectedKeys` in your state. A click opens or closes a parent and picks the row. Arrow keys move, `→` / `←` open and close, `Enter` picks.

```live-react
import { Button, Text, Tree } from "devnonla-ui";
import { useState } from "react";

const org = [
  {
    key: "ceo",
    title: "Linh · CEO",
    children: [
      {
        key: "eng",
        title: "Engineering",
        children: [
          { key: "platform", title: "Platform" },
          { key: "agents", title: "Agents" },
          { key: "infra", title: "Infra", disabled: true },
        ],
      },
      { key: "design", title: "Design", children: [{ key: "brand", title: "Brand" }] },
      { key: "ops", title: "Operations" },
    ],
  },
];

export default function Demo() {
  const [open, setOpen] = useState(["ceo", "eng"]);
  const [sel, setSel] = useState(["agents"]);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button size="small" onClick={() => setOpen(["ceo", "eng", "design"])}>Expand all</Button>
        <Button size="small" onClick={() => setOpen([])}>Collapse all</Button>
      </div>
      <Tree aria-label="Org chart" treeData={org} expandedKeys={open} onExpand={setOpen} selectedKeys={sel} onSelect={setSel} className="max-w-xs" />
      <Text type="secondary">Selected: {sel.join(", ") || "none"}</Text>
    </div>
  );
}
```

## Without lines

`showLine={false}` keeps only the indent. `multiple` lets a click toggle several rows; `size="small"` packs rows at 24px (default 32px).

```live-react
import { Tree } from "devnonla-ui";

const settings = [
  { key: "account", title: "Account", icon: "pointer", children: [{ key: "profile", title: "Profile" }, { key: "security", title: "Security" }] },
  { key: "workspace", title: "Workspace", icon: "window", children: [{ key: "members", title: "Members" }, { key: "billing", title: "Billing" }] },
];

export default function Demo() {
  return <Tree aria-label="Settings" treeData={settings} showLine={false} multiple size="small" defaultExpandAll defaultSelectedKeys={["profile", "members"]} className="max-w-xs" />;
}
```

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
