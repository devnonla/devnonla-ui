---
path: "/components/breadcrumb"
title: "Breadcrumb"
group: "Navigation"
groupOrder: 8
order: 4
icon: "list-bar-24"
---

# Breadcrumb

Where the page sits: muted ancestors, the current page in medium weight. Put it in the top bar.

```live-react
import { Breadcrumb } from "devnonla-ui";

export default function Demo() {
  return (
    <Breadcrumb
      items={[
        { title: "Workspace", href: "#" },
        { title: "Agents", onClick: () => {} },
        { title: "Nova" },
      ]}
    />
  );
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `items` | Path from the root. The last item is the current page. | `BreadcrumbItem[]` | — |
| `separator` | Node between items | `ReactNode` | chevron |
| `className` | Extra class on the `nav` | `string` | — |

### Item

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `title` | Label | `ReactNode` | — |
| `href` | Renders a link | `string` | — |
| `onClick` | Click handler for client routing. With `href`, it replaces navigation. | `() => void` | — |
| `icon` | Glyph before the label | `ReactNode` | — |
