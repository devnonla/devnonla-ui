<!-- Generated from docs/pages/components/empty.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/empty -->

# Empty

Empty state: an icon, a title, one muted line, and the action that fills the space.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `title` | Bold line, e.g. "No projects yet" | `ReactNode` | — |
| `description` | Muted line under the title. `null` hides it. | `ReactNode` | `"No data"` without a title |
| `icon` | `Icon` name or node above the title. `null` hides it. | `IconName` \| `ReactNode` | Nonla mark |
| `action` | Call to action, usually a primary `Button` | `ReactNode` | — |
| `bordered` | Wrap in a `Card`. Turn off inside tables, panels, or cards. | `boolean` | `true` |
| `children` | Extra content under the action | `ReactNode` | — |
| `className` | Extra class on the inner content | `string` | — |
