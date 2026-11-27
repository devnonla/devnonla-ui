/**
 * SSR smoke test: render controls inside `<App>` with `react-dom/server` under Bun, where
 * `document` and `window` do not exist. Fails if any render touches the DOM (e.g. reading
 * `document.body` for a popup container during render).
 *
 * Usage: bun scripts/smoke-ssr.tsx
 */
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import {
  App,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  ColorPicker,
  CommandPalette,
  ContextMenu,
  DatePicker,
  Drawer,
  Dropdown,
  Empty,
  Input,
  Modal,
  PageHeader,
  Pagination,
  Popconfirm,
  Popover,
  Segmented,
  Select,
  Sidebar,
  Switch,
  Table,
  Tabs,
  Tag,
  ThemeSwitcher,
  ThemeToggle,
  TimePicker,
  Tooltip,
  Tree,
} from "../src/index";
import { MarkdownViewer } from "../src/markdown-editor/index";

if (typeof document !== "undefined") {
  console.error("✗ smoke-ssr must run without a DOM");
  process.exit(1);
}

const cases: [string, () => ReactNode][] = [
  ["ThemeSwitcher", () => <ThemeSwitcher />],
  ["ThemeToggle", () => <ThemeToggle />],
  ["Tooltip", () => <Tooltip title="Hint"><Button>Hover</Button></Tooltip>],
  ["Popover", () => <Popover content="Body"><Button>Open</Button></Popover>],
  ["Popconfirm", () => <Popconfirm title="Sure?"><Button>Delete</Button></Popconfirm>],
  ["Dropdown", () => <Dropdown menu={{ items: [{ key: "a", label: "A" }] }}><Button>Menu</Button></Dropdown>],
  ["ContextMenu", () => <ContextMenu items={[{ key: "a", label: "A" }]}><div>Area</div></ContextMenu>],
  ["Select", () => <Select options={[{ value: "a", label: "A" }]} defaultValue="a" />],
  ["DatePicker", () => <DatePicker />],
  ["TimePicker", () => <TimePicker />],
  ["ColorPicker", () => <ColorPicker />],
  ["Modal", () => <Modal open={false} title="T">Body</Modal>],
  ["Drawer", () => <Drawer open={false} title="T">Body</Drawer>],
  ["CommandPalette", () => <CommandPalette groups={[{ label: "G", items: [{ key: "a", label: "A", onSelect: () => {} }] }]} />],
  ["Input", () => <Input placeholder="x" />],
  ["Checkbox / Switch", () => <><Checkbox>On</Checkbox><Switch /></>],
  ["Segmented / Tabs", () => <><Segmented options={["a", "b"]} /><Tabs items={[{ key: "a", label: "A", children: "x" }]} /></>],
  ["Card / Tag / Empty", () => <Card title="C"><Tag>t</Tag><Empty /></Card>],
  ["PageHeader / Breadcrumb", () => <><PageHeader title="P" /><Breadcrumb items={[{ title: "Home" }]} /></>],
  ["Table / Pagination", () => <><Table columns={[{ title: "A", dataIndex: "a" }]} dataSource={[{ a: 1 }]} rowKey="a" /><Pagination total={50} /></>],
  ["Sidebar", () => <Sidebar items={[{ key: "a", label: "A" }]} selectedKey="a" />],
  ["Tree", () => <Tree treeData={[{ key: "a", title: "A", children: [{ key: "b", title: "B" }] }]} />],
  ["MarkdownViewer", () => <MarkdownViewer value={"## T\n\n| a |\n|---|\n| 1 |"} />],
];

const failures: string[] = [];
for (const [name, render] of cases) {
  try {
    const html = renderToString(<App>{render()}</App>);
    if (!html.includes("nonla-ui")) failures.push(`${name}: no .nonla-ui host in output`);
  } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

if (failures.length > 0) {
  console.error(`✗ SSR:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ SSR: ${cases.length} cases rendered inside <App> without a DOM`);
