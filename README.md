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

Dark is the default (`:root` and `.dark`). `.light` is the daylight palette. `<App>` calls `initColorMode()` once and restores `localStorage` key `nonla-color-mode`, falling back to dark. Switch with `setColorMode("light" | "dark")` or `<ThemeToggle>`. `setColorPreference("light" | "dark" | "system")` and `<ThemeSwitcher>` also store `system`, which follows the OS and still paints `light` or `dark`. To start in daylight before paint, put `class="light"` on `<html>`.

**Other apps** — import the CSS, then override knobs. Do not fork Button/Tag/….

```css
@import "tailwindcss";
@import "devnonla-ui/styles.css";

:root {
  --nonla-brand: #3b82f6;
  --nonla-bg: #0b0f19;
}
```

`--brand-50` … `--brand-800` follow `--nonla-brand` (500 = the knob). Tints mix into the surface; `brand-700` stays with the ink. Text **on** the brand fill (Button primary, Tag solid, Checkbox) is `--nonla-solid-fg` / `colors.solidFg` — default `#181818` on the neutral `#f0f0f0` fill.

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

# Card

Titled settings surface. `Card.Item` is a label row; `align="center"` for a short row, `split` so a field fills the trailing half. `Card.Footer` sits under the rows. `caption` is the note under the frame.

```tsx
import { Card, Switch } from "devnonla-ui";

<Card title="General" caption="Applies to this workspace.">
  <Card.Item label="Notifications" align="center">
    <Switch />
  </Card.Item>
  <Card.Footer>Saved</Card.Footer>
</Card>
```

# Desktop

Meadow wallpaper, window chrome, header bar, and desktop icons live in this package so other Nonla apps share the same shell.

```tsx
import { DesktopStage, DesktopHeader, MeadowDesktop, DesktopWindow, MeadowShell, Menu, SolarIcon } from "devnonla-ui";

<DesktopStage>
  <MeadowDesktop>{icons}</MeadowDesktop>
  <DesktopHeader left={nav} right={apps} />
  <DesktopWindow title="Tools" left={nav} right={actions} expanded={false} onClose={close} onToggleExpand={toggle}>
    {children}
  </DesktopWindow>
</DesktopStage>
```

`MeadowShell` is the login/setup backdrop. `DesktopWindow` chrome is inline: traffic lights, `left`, a flex middle (title — double-click to expand), then `right`. A child can fill the same slots with `WindowHeader`. Last collapsed position and size are restored on reopen (`persistKey`, or `false` to disable). Resize handles stay when expanded; dragging an edge leaves expand and keeps the new size. `Menu` is the glass picker (trigger + items + hover action) used by AgentsMenu. Wallpaper defaults to the bundled meadow; pass `src` on `MeadowWallpaper` to swap.

# Sidebar

Grouped side nav. Pass JSON groups + items; the app owns routing.

```tsx
import { Sidebar, type SidebarItemType } from "devnonla-ui";

const items: SidebarItemType[] = [
  {
    type: "group",
    key: "chat",
    label: "Chat",
    children: [
      { key: "inbox", label: "Inbox", icon: "chat-24" },
      { key: "archive", label: "Archive", icon: "library-24" },
    ],
  },
];

<Sidebar items={items} selectedKey={active} searchable onSelect={({ key }) => setActive(key)} />
```

`icon` may be a Fluent name string (JSON-friendly) or a node. Set `href` to render `<a>`; left-click still goes through `onSelect` so a SPA can `navigate`. Cmd/Ctrl-click keeps the native new-tab. Parent sets width; `Sidebar` fills height.

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

# Markdown

`MarkdownViewer` renders markdown for reading: headings, lists, tables, code, and mermaid. Agent replies use the same view.

`MarkdownEditor` edits markdown in preview, source, or diff. Pass `original` to enable the diff view. `diffLayout` is side by side by default. `readOnly` locks the editor and hides the mode switcher.

```tsx
import { MarkdownEditor, MarkdownViewer } from "devnonla-ui";

<MarkdownViewer value={article} />
<MarkdownEditor value={text} original={previous} onChange={setText} />
```

## Live React in markdown

A `live-react` fence exports a default component and renders it above its source. It is off unless you opt in.

- **Markdown from users or agents:** pass `sandboxSrc`. The fence runs in an iframe with `sandbox="allow-scripts"` and no `allow-same-origin`, so it cannot reach the page's cookies, storage, or DOM. `sandboxSrc` is a page you host on its own origin that calls `mountReactCodeRunner`; its `modules` are the only imports markdown gets.
- **Markdown you wrote:** pass `trustedModules`. The fence runs in your page with full access. Never use it for content someone else can write.

```tsx
// sandbox page
import * as ui from "devnonla-ui";
import { mountReactCodeRunner } from "devnonla-ui";

mountReactCodeRunner(document.getElementById("root")!, { "devnonla-ui": ui });

// app
<MarkdownViewer value={article} sandboxSrc="https://sandbox.example.com/runner.html" />
```

Outside markdown, use the pieces directly. `ReactCodeSandbox` takes `code` and `src` and renders the same framed result with a Code tab. `ReactCode` is the in-page version for source you wrote. `ReactCodeFrame` is the header and tab box, if you want to wrap your own result.

```tsx
<ReactCodeSandbox code={source} src="https://sandbox.example.com/runner.html" />
```

Serve the runner page with `Content-Security-Policy: connect-src 'none'` and `Access-Control-Allow-Origin: *` on its assets, since a sandboxed frame loads them cross-origin.

# Typography

`Text`, `Title`, `Paragraph`, and `Link` share one decoration set: `type` (`secondary` | `success` | `warning` | `danger`), `disabled`, `mark`, `code`, `keyboard`, `underline`, `delete`, `strong`, and `italic`. `Title` `level` is 1–5. `Typography` groups the same pieces.

```tsx
import { Link, Paragraph, Text, Title } from "devnonla-ui";

<Title level={2}>Agents</Title>
<Paragraph>Run them on your machine.</Paragraph>
<Text type="secondary">Updated today</Text>
<Link href="https://nonlaagents.com">nonlaagents.com</Link>
```

# Logo

`Logo` is the mark and the wordmark “Nonla Agents”. The wordmark is K2D regular, drawn as SVG outlines. `variant` is `icon`, `text`, or `full` (default). `size` is the icon height in px (default 32). `color` recolors the mark and the wordmark; the eyes and the smile stay.

```tsx
import { Logo } from "devnonla-ui";

<Logo />
<Logo variant="icon" size={24} />
<Logo color="#181818" />
```

# Icons

`SolarIcon` renders vendored Solar icons (`@iconify-json/solar`) as inline SVG, so they follow `currentColor`. Default style is `linear`. A legacy Fluent Color id such as `settings-24` still resolves to the Solar equivalent.

```tsx
<SolarIcon name="settings-linear" size={16} />
```
