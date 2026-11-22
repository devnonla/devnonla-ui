<!-- Generated from docs/pages/components/breadcrumb.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/breadcrumb -->

# Breadcrumb

Where the page sits: muted ancestors, the current page in medium weight. Put it in the top bar.

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
