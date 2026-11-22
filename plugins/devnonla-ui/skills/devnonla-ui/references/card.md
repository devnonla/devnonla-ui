<!-- Generated from docs/pages/components/card.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/card -->

# Card

Settings surface — section title, faint borders between rows, and a caption under the card. Each `Card.Item` is a settings row: `label` and `description` on the left, the control on the right. Stack sections with `gap-10`.

## API

### Card

Other HTML attributes pass through to the root `section`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `title` | Section label above the surface | `ReactNode` | — |
| `children` | Rows inside the surface, usually `Card.Item` | `ReactNode` | — |
| `caption` | Note under the surface, such as a “Learn more” link | `ReactNode` | — |
| `className` | Extra class on the root | `string` | — |

### Card.Item

Other HTML attributes pass through to the row.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `label` | Row title on the left | `ReactNode` | — |
| `description` | Muted text under the label | `ReactNode` | — |
| `children` | Control on the right. Without `label` or `description` it fills the row. | `ReactNode` | — |
| `align` | `center` centers the control. `start` pins it to the first line. | `start` \| `center` | `center` |
| `split` | Split the row in half so a field fills the trailing column | `boolean` | `false` |
| `className` | Extra class on the row | `string` | — |
