# NonlaUI docs (local)

Docs for `devnonla-ui`. `/` opens Introduction. Each page is a markdown file under `pages/` with frontmatter (`path`, `title`, `group`). The sidebar and routes come from those files.

```bash
cd docs && bun run dev
```

http://localhost:5176/

Published: https://devnonla.github.io/devnonla-ui/

| Path | Page |
| --- | --- |
| `/` | Redirects to `/introduction` |
| `/introduction` | Get started |
| `/theming` | Theme playground |
| `/desktop` | Desktop window dialog |
| `/components/button` | Button |
| `/chat/agent-panel` | AgentPanel (full height) |

Old hashes (`#/general/button`, `#/theme`, `#/button`) and `/docs/…` redirect to the current paths.
