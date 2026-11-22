---
path: "/components/command-palette"
title: "CommandPalette"
group: "Navigation"
groupOrder: 8
order: 5
icon: "options-24"
---

# CommandPalette

⌘K search over pages, agents, and actions. Grouped rows, arrow keys to move, Enter to run. ⌘K / Ctrl+K opens it from anywhere.

```live-react
import { useState } from "react";
import { Button, CommandPalette, Kbd, message } from "devnonla-ui";

const go = (name) => () => message.info(`Open ${name}`);

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Quick search <Kbd keys={["⌘", "K"]} />
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        placeholder="Search agents, pages, and actions…"
        groups={[
          {
            label: "Recents",
            items: [
              { key: "nova", label: "Nova", description: "Agents", icon: "dialog", onSelect: go("Nova") },
              { key: "runs", label: "Runs", description: "Observability", icon: "clock", onSelect: go("Runs") },
            ],
          },
          {
            label: "Actions",
            items: [
              { key: "new", label: "New agent", icon: "add", shortcut: ["⌘", "N"], onSelect: go("New agent") },
              { key: "theme", label: "Toggle theme", icon: "moon", keywords: ["dark", "light"], onSelect: go("theme") },
            ],
          },
        ]}
      />
    </>
  );
}
```

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `groups` | Sections of rows, each with an optional label | `CommandGroup[]` | — |
| `open` | Controlled open state | `boolean` | — |
| `defaultOpen` | Initial open state when uncontrolled | `boolean` | `false` |
| `onOpenChange` | Called when the palette opens or closes | `(open: boolean) => void` | — |
| `placeholder` | Input placeholder | `string` | `"Search…"` |
| `emptyText` | Shown when nothing matches | `ReactNode` | `"No results"` |
| `hotkey` | Toggle on ⌘K / Ctrl+K anywhere | `boolean` | `true` |
| `filter` | Filter rows locally by label, description, and keywords. Turn off for remote results. | `boolean` | `true` |
| `onQueryChange` | Called on every keystroke, for remote search | `(query: string) => void` | — |
| `className` | Extra class on the panel | `string` | — |

### Item

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `key` | Unique id | `string` | — |
| `label` | Main text; a string is also what the query matches | `ReactNode` | — |
| `description` | Muted context after an em dash | `ReactNode` | — |
| `icon` | `Icon` name or node | `ReactNode` | — |
| `keywords` | Extra words the query matches | `string[]` | — |
| `shortcut` | Keys shown on the right (display only) | `string[]` | — |
| `disabled` | Skipped by arrows and clicks | `boolean` | `false` |
| `onSelect` | Runs on Enter or click. Return `false` to keep the palette open. | `() => unknown` | — |
