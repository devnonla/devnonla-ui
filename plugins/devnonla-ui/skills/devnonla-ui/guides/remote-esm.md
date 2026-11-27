# Remote ESM (no bundler, no Tailwind)

The normal entries (`devnonla-ui`, `/chat`, `/markdown`) ship raw `.ts`; a CDN or browser cannot run them. For hosts that load the kit remotely, use the prebuilt files in the package's `dist/` (since the release that added `build`).

| Need | URL / subpath |
|---|---|
| Controls | `devnonla-ui/esm` → `dist/index.js` |
| Chat | `devnonla-ui/esm/chat` → `dist/chat/index.js` |
| Markdown | `devnonla-ui/esm/markdown` → `dist/markdown-editor/index.js` |
| CSS (Tailwind compiled in, fonts included) | `devnonla-ui/esm/styles.css` → `dist/nonla-ui.css` |

## Use

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/devnonla-ui@VERSION/dist/nonla-ui.css">
<script type="importmap">
{ "imports": {
  "react": "https://esm.sh/react@19",
  "react/jsx-runtime": "https://esm.sh/react@19/jsx-runtime",
  "react-dom": "https://esm.sh/react-dom@19",
  "react-dom/client": "https://esm.sh/react-dom@19/client",
  "react-hook-form": "https://esm.sh/react-hook-form@7?external=react",
  "devnonla-ui": "https://cdn.jsdelivr.net/npm/devnonla-ui@VERSION/dist/index.js"
} }
</script>
<script type="module">
  import { App, Button } from "devnonla-ui";
</script>
```

## Rules

- `react`, `react-dom`, `react-hook-form` are external: map them in the import map to the same React the host uses (two Reacts break hooks).
- Host the whole `dist/` together; entries import hashed chunks by relative path (`./index-xxx.js`), and the CSS references `dist/files/*.woff2`.
- Still wrap in `<App>`; tokens live on `.nonla-ui`.
- `nonla-ui.css` already includes Tailwind. If the host has its own Tailwind v4, use `devnonla-ui/styles.css` instead; loading both duplicates utilities.
- Pin `VERSION`; do not use `@latest` for production.
