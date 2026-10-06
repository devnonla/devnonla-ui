# devnonla-ui (NonlaUI)

React controls for Nonla Agents.

Docs: https://devnonla.github.io/devnonla-ui/

```bash
bun add devnonla-ui
```

Peer deps: `react` / `react-dom` >= 19, `react-hook-form`. Consumer should use Tailwind CSS v4.

```tsx
import "devnonla-ui/styles.css";
import { App, Button } from "devnonla-ui";

export function Root() {
  return (
    <App>
      <Button type="primary">Save</Button>
    </App>
  );
}
```

Install, theme, and each control are in the [docs](https://devnonla.github.io/devnonla-ui/).
