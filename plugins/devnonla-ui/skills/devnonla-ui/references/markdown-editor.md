<!-- Generated from docs/pages/components/markdown-editor.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/markdown-editor -->

# MarkdownEditor

Click từng block để sửa. Diff so bản gốc với bản hiện tại. Chỉ cần inline edit thì `showModes={false}`. Bài chỉ để đọc dùng MarkdownViewer.

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `value` | Current markdown. In diff mode this is the modified version. | `string` | — |
| `defaultValue` | Initial markdown, for an uncontrolled editor | `string` | `""` |
| `onChange` | Fires with the new markdown after an edit | `(value: string) => void` | — |
| `original` | Earlier version. Enables the Diff view. | `string` | — |
| `title` | Header label, such as a filename | `ReactNode` | — |
| `mode` | Current view, for a controlled editor | `preview` \| `edit` \| `diff` | — |
| `defaultMode` | Initial view | `preview` \| `edit` \| `diff` | `preview` |
| `showModes` | Show the Preview / Edit / Diff switch. Hidden when `readOnly`. | `boolean` | `true` |
| `readOnly` | Lock editing and hide the mode switch | `boolean` | `false` |
| `placeholder` | Text shown when the document is empty | `string` | `"Write markdown…"` |
| `components` | Components for fenced blocks, keyed by language. They stay view only. | `Record<string, ComponentType>` | — |
| `diffLayout` | Diff layout, for a controlled editor | `side-by-side` \| `inline` | — |
| `defaultDiffLayout` | Initial diff layout | `side-by-side` \| `inline` | `side-by-side` |
| `originalLabel` | Label for the original side of the diff | `ReactNode` | `"Original"` |
| `modifiedLabel` | Label for the modified side of the diff | `ReactNode` | `"Modified"` |
| `onModeChange` | Fires when the view changes | `(mode) => void` | — |
| `onDiffLayoutChange` | Fires when the diff layout changes | `(layout) => void` | — |
| `className` | Extra class on the root | `string` | — |
| `style` | Inline style on the root | `CSSProperties` | — |
