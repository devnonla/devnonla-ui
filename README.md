# devnonla-ui (NonlaUI)

React controls for Nonla Agents.

```bash
bun add devnonla-ui
```

Peer deps: `react` / `react-dom` >= 19, `react-hook-form`. Consumer should use Tailwind CSS v4.

```tsx
import "devnonla-ui/styles.css";
import { App, Button, EFormItemType, SchemaForm, Modal, message, type TFormItemProps } from "devnonla-ui";
import { useForm } from "react-hook-form";

message.success("Saved");
Modal.confirm({ title: "Delete?", onOk: async () => {} });

const items: TFormItemProps[] = [
  {
    type: EFormItemType.Input,
    name: "name",
    label: "Name",
    rules: { required: "Name is required" },
    options: { placeholder: "Your name" },
  },
];

function Example() {
  const form = useForm({ defaultValues: { name: "" } });
  return (
    <App>
      <form onSubmit={form.handleSubmit(console.log)}>
        <SchemaForm form={form} items={items} />
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </form>
    </App>
  );
}
```

`SchemaForm` is JSON-schema driven (ZoForm-style) on `react-hook-form`. The BE can return `TFormItemProps[]`; FE hydrates `rules.pattern` strings to `RegExp`. Pass `fetcher` for `select_remote` fields. Layout-only labeled fields use `Form` / `Form.Item`.

# Sizes

Only **3 canonical sizes**: `small` | `default` | `large`.

Edit [`src/lib/sizes.ts`](src/lib/sizes.ts) — `CONTROL_SIZES`.

Aliases: `xs` → small, `middle` / `medium` → default.

# Theme (colors)

All color lives in **`--nonla-*` knobs** (`src/styles.css`). Components never hardcode palette hex.

**Other apps** — import the CSS, then override knobs. Do not fork Button/Tag/….

```css
@import "tailwindcss";
@import "devnonla-ui/styles.css";

:root {
  --nonla-brand: #3b82f6;
  --nonla-bg: #0b0f19;
}
```

`--brand-50` … `--brand-800` follow `--nonla-brand` (500 = the knob). Text on cream uses `brand-700`. Text **on** the brand fill (Button primary, Tag solid, Checkbox) is `--nonla-solid-fg` / `colors.solidFg` — default white.

Or at runtime:

```tsx
<App
  theme={{
    colors: { brand: "#3b82f6", bg: "#0b0f19", border: "#666666", borderInput: "#8a8a8a" },
  }}
>
  …
</App>
```

Flat knobs still work (`brand`, `colorBorder`, `colorBorderInput`, …). `applyNonlaTheme({ brand: "#3b82f6" })` does the same on `:root`.

Core knobs: `--nonla-bg`, `--nonla-fg`, `--nonla-brand`, `--nonla-solid-fg`, `--nonla-danger`, `--nonla-success`, `--nonla-warn`, `--nonla-link`, `--nonla-radius` (small = −2px, large = +2px), `--nonla-height` / `--nonla-height-sm` / `--nonla-height-lg`, plus surfaces (`--nonla-surface`, `--nonla-chip`, …) and preset accents (`--nonla-blue`, `--nonla-purple`, …).

Those map into shadcn-standard tokens (`--background`, `--destructive`, …) plus Nonla aliases (`--brand`, `--success`, …).

- You: only touch `--nonla-*` (CSS or `theme` / `applyNonlaTheme`).
- Shadcn consumers: can still override `--background` / `--primary` / etc.
- Nonla CTA = `--brand` (from `--nonla-brand`). Label on that fill = `--nonla-solid-fg`. `--primary` = ink (emphasis), not the brand button.

`<App>` is the ConfigProvider: `theme`, `componentSize`, `getPopupContainer`. Overlay portals (Select, Dropdown, DatePicker, Modal, Drawer, …) read `getPopupContainer`. `message.*` and `Modal.confirm` render into holders under `App`. `useToken()` / `getDesignToken()` read the live seed knobs.

```tsx
<App componentSize="large" getPopupContainer={() => document.getElementById("app")!}>
  …
</App>
```

# Desktop

Meadow wallpaper, window chrome, header bar, and desktop icons live in this package so other Nonla apps share the same shell.

```tsx
import { DesktopStage, DesktopHeader, MeadowDesktop, DesktopWindow, MeadowShell, Menu, FluentIcon } from "devnonla-ui";

<DesktopStage>
  <MeadowDesktop>{icons}</MeadowDesktop>
  <DesktopHeader left={nav} right={apps} />
  <DesktopWindow title="Tools" left={nav} right={actions} expanded={false} onClose={close} onToggleExpand={toggle}>
    {children}
  </DesktopWindow>
</DesktopStage>
```

`MeadowShell` is the login/setup backdrop. `DesktopWindow` chrome is inline: traffic lights, `left`, a flex middle (title — double-click to expand), then `right`. A child can fill the same slots with `WindowHeader`. `Menu` is the glass picker (trigger + items + hover action) used by AgentsMenu. Wallpaper defaults to the bundled meadow; pass `src` on `MeadowWallpaper` to swap.

# Chat

`AgentPanel` is the full chat surface: welcome, messages, thinking, tool calls, markdown, composer. Attach an SSE endpoint and send. The panel POSTs `{ messages }` (plus optional `extraBody`).

`AgentChatbox` is the same UI when the **app** owns the request: `send` POSTs only the new user text; `resume` reattaches a live stream on mount; `onStop` runs after the client abort.

```tsx
import { AgentChatbox, AgentPanel } from "devnonla-ui";

<AgentPanel
  endpoint="/api/agents/abc/assistant/stream"
  title="Nova"
  toolbar={<ModelPicker />}
  toolUis={[{ name: "get_calendar_events", component: CalendarToolUI }]}
  toolHooks={[
    { name: "web_fetch", onCall: (e) => console.log("fetch", e.input), onResult: (e) => console.log("done", e.output) },
  ]}
/>

<AgentChatbox
  send={({ text, signal }) => fetch("/api/chat", { method: "POST", body: JSON.stringify({ text }), signal })}
  resume={({ signal }) => fetch("/api/chat/stream", { signal })}
  onStop={() => fetch("/api/chat/stop", { method: "POST" })}
/>
```

`endpoint` can also be a function that returns a `Response` (tests, mocks). Pass any node to `toolbar` for the composer (model picker, tools, …). Extra tool cards go in `toolUis` and win over builtins on the same `toolName`. `toolHooks` fire `onCall` / `onResult` for matching tools (omit `name` to hear every tool).

Stream events:

`text-delta` | `thinking-delta` | `tool-call` | `tool-result` | `done` | `error`

Primitives (`ChatWelcome`, `ChatUserMessage`, `ChatAgentMessage`, `ChatThinking`, `ChatToolCall`, `ChatInput`, `ChatError`, `ChatMarkdown`) stay exported for custom layouts.

# Icons

`FluentIcon` renders vendored Fluent Color (`@iconify-json/fluent-color`). No Solar / Lucide.

```tsx
<FluentIcon name="settings-24" size={16} />
```
