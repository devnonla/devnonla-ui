<!-- Generated from docs/pages/components/pagination.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/pagination -->

# Pagination

A long list can be divided into several pages, and only one page is loaded at a time.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `current` | Current page, controlled. | `number` | — |
| `defaultCurrent` | Initial page when uncontrolled. | `number` | `1` |
| `total` | Total number of items. | `number` | `0` |
| `pageSize` | Items per page, controlled. | `number` | — |
| `defaultPageSize` | Initial items per page when uncontrolled. | `number` | `10` |
| `onChange` | Called with the new page and page size. | `(page, pageSize) => void` | — |
| `onShowSizeChange` | Called when the size changer picks a new page size. | `(current, size) => void` | — |
| `size` | Control height. | `"small" \| "default" \| "large"` | — |
| `disabled` | Disables every control. | `boolean` | — |
| `align` | Stretches to the full width and aligns the items. | `"start" \| "center" \| "end"` | — |
| `simple` | Prev and next with a page input. `{ readOnly: true }` shows plain text. | `boolean \| { readOnly?: boolean }` | — |
| `showSizeChanger` | Shows the page size select. Pass Select props to customize it. | `boolean \| SelectProps` | — |
| `pageSizeOptions` | Choices in the page size select. | `(number \| string)[]` | `[10, 20, 50, 100]` |
| `totalBoundaryShowSizeChanger` | Above this `total`, the size changer shows unless `showSizeChanger` is `false`. | `number` | `50` |
| `showQuickJumper` | Shows a "Go to page" input. `goButton` adds a button. | `boolean \| { goButton?: ReactNode }` | `false` |
| `showTotal` | Renders a total label from `total` and the shown `[start, end]` range. | `(total, range) => ReactNode` | — |
| `hideOnSinglePage` | Renders nothing when there is only one page. | `boolean` | `false` |
| `showLessItems` | Shows fewer page numbers around the current page. | `boolean` | `false` |
| `showTitle` | Adds native tooltips to the page items. | `boolean` | `true` |
| `responsive` | Switches to `small` on narrow screens when `size` is unset. | `boolean` | — |
| `itemRender` | Customizes each page, arrow and jump item. | `(page, type, element) => ReactNode` | — |
| `components` | `sizeChanger` replaces the page size select with your own component. | `{ sizeChanger?: ComponentType }` | — |
| `className` | Extra class on the root. | `string` | — |
| `style` | Inline style on the root. | `CSSProperties` | — |
| `classNames` | Classes for the `root` and `item` parts. | `{ root?: string; item?: string }` | — |
| `styles` | Inline styles for the `root` and `item` parts. | `{ root?, item?: CSSProperties }` | — |
