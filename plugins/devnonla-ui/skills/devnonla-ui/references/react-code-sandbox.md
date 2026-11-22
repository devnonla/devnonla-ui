<!-- Generated from docs/pages/components/react-code-sandbox.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/react-code-sandbox -->

# ReactCodeSandbox

Chạy một component React viết dạng chuỗi trong iframe sandbox. Không đọc được cookie, storage hay DOM của trang chứa nó. Dùng cho code do user hoặc agent viết.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `code` | Component source. It must `export default` a React component. | `string` | — |
| `showHeader` | Shows a header bar above the result. | `boolean` | `false` |
| `showCode` | Adds a Preview / Code switch to the header. Needs `showHeader`. | `boolean` | `true` |
| `title` | Header text. | `ReactNode` | `"Sandbox"` |
| `icon` | Header icon. `null` hides it. | `ReactNode` | — |
| `className` | Extra class on the outer box. | `string` | — |
