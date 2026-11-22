<!-- Generated from docs/pages/components/spin.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/spin -->

# Spin

Loading indicators — brand, neutral gray, and the AI agent snake.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `spinning` | Shows the indicator. | `boolean` | `true` |
| `tip` | Text under the indicator. | `ReactNode` | — |
| `size` | Indicator size. | `"small" \| "default" \| "large"` | — |
| `variant` | Visual style. `agent` is the 3×3 snake for AI run states. | `"default" \| "agent"` | `"default"` |
| `color` | Indicator hue. `neutral` stays gray in light and dark. | `"brand" \| "neutral"` | `"brand"` |
| `indicator` | Replaces the built-in indicator. | `ReactNode` | — |
| `children` | Content covered by a dimmed overlay while spinning. | `ReactNode` | — |
| `className` | Extra class on the root. | `string` | — |
