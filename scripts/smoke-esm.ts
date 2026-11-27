/**
 * Smoke test for the prebuilt bundle in `dist/` (run `bun run build` first).
 *
 * 1. Checks the bundle is real: every entry exists and there are chunks
 *    (Bun 1.4.0 once emitted three near-empty entries).
 * 2. Serves `dist/` and loads it in headless Chromium the way a remote host does:
 *    `nonla-ui.css` + an import map with React from esm.sh. Renders a few controls,
 *    opens a Select popup, imports the chat and markdown entries, and fails on any
 *    console error, missing host, missing text, or unloaded font.
 *
 * Usage: bun scripts/smoke-esm.ts            (needs `bunx playwright install chromium`)
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const root = join(import.meta.dir, "..");
const dist = join(root, "dist");

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

// ── 1. Bundle shape ─────────────────────────────────────────────────────────
const entries = ["index.js", "chat/index.js", "markdown-editor/index.js", "nonla-ui.css"];
for (const entry of entries) {
  if (!existsSync(join(dist, entry))) fail(`dist/${entry} is missing. Run \`bun run build\`.`);
}
const chunks = readdirSync(dist).filter((name) => name.endsWith(".js") && name !== "index.js");
if (chunks.length < 10) fail(`dist/ has ${chunks.length} chunks; the bundle is likely empty.`);
const cssSize = statSync(join(dist, "nonla-ui.css")).size;
if (cssSize < 50_000) fail(`dist/nonla-ui.css is ${cssSize} bytes; Tailwind likely did not compile.`);
if (!existsSync(join(dist, "files")) || readdirSync(join(dist, "files")).length === 0) {
  fail("dist/files/ (fonts) is empty.");
}
console.log(`✓ bundle: ${chunks.length} chunks, css ${(cssSize / 1024).toFixed(0)}KB`);

// ── 2. Browser ──────────────────────────────────────────────────────────────
const version = (pkg: string) => require(`${pkg}/package.json`).version as string;
const react = version("react");
const reactDom = version("react-dom");
const rhf = version("react-hook-form");

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="/nonla-ui.css">
<script type="importmap">
${JSON.stringify({
  imports: {
    react: `https://esm.sh/react@${react}`,
    "react/jsx-runtime": `https://esm.sh/react@${react}/jsx-runtime`,
    "react-dom": `https://esm.sh/react-dom@${reactDom}?external=react`,
    "react-dom/client": `https://esm.sh/react-dom@${reactDom}/client?external=react`,
    "react-hook-form": `https://esm.sh/react-hook-form@${rhf}?external=react`,
    "devnonla-ui": "/index.js",
    "devnonla-ui/chat": "/chat/index.js",
    "devnonla-ui/markdown": "/markdown-editor/index.js",
  },
})}
</script></head>
<body><div id="root"></div>
<script type="module">
  import { createElement as h } from "react";
  import { createRoot } from "react-dom/client";
  import { App, Button, Card, Input, Select, Switch, Tag } from "devnonla-ui";
  import { MarkdownViewer } from "devnonla-ui/markdown";
  const chat = await import("devnonla-ui/chat");
  window.__chatExports = Object.keys(chat).length;
  createRoot(document.getElementById("root")).render(
    h(App, null, h("div", { style: { padding: 24, display: "grid", gap: 12, maxWidth: 520 } },
      h(Card, { title: "Smoke" },
        h(Button, { type: "primary" }, "Primary"), h(Tag, { color: "success" }, "ok"), h(Switch, { defaultChecked: true })),
      h(Input, { placeholder: "Xin chào" }),
      h(Select, { "data-testid": "select", options: [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }], defaultValue: "a" }),
      h(MarkdownViewer, { value: "## Heading\\n\\n| a | b |\\n|---|---|\\n| 1 | 2 |" }),
    )),
  );
</script></body></html>`;

const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const path = new URL(req.url).pathname;
    if (path === "/" || path === "/index.html") return new Response(html, { headers: { "content-type": "text/html" } });
    const file = Bun.file(join(dist, path));
    return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
  },
});

const browser = await chromium.launch();
const errors: string[] = [];
try {
  const page = await browser.newPage({ colorScheme: "dark" });
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("requestfailed", (req) => errors.push(`request failed: ${req.url()}`));
  page.on("response", (res) => {
    if (res.status() >= 400) errors.push(`${res.status()} ${res.url()}`);
  });

  await page.goto(server.url.href);
  await page.getByText("Primary").waitFor({ timeout: 30_000 });

  const host = await page.locator(".nonla-ui").first().getAttribute("class");
  if (!host?.includes("dark")) errors.push(`host should follow the OS (dark), got "${host}"`);

  for (const text of ["Smoke", "ok", "Alpha", "Heading"]) {
    if ((await page.getByText(text, { exact: true }).count()) === 0) errors.push(`text "${text}" not rendered`);
  }

  // Tailwind utilities applied: the primary button must not be transparent.
  const painted = await page.getByText("Primary").evaluate((el) => {
    const style = getComputedStyle(el.closest("button") ?? el);
    return style.backgroundImage !== "none" || style.backgroundColor !== "rgba(0, 0, 0, 0)";
  });
  if (!painted) errors.push("primary button has no background (CSS not applied)");

  // Popup renders through the portal.
  await page.getByText("Alpha", { exact: true }).click();
  await page.getByText("Beta", { exact: true }).waitFor({ timeout: 5_000 });

  const chatExports = await page.evaluate(() => (window as unknown as { __chatExports?: number }).__chatExports ?? 0);
  if (chatExports < 5) errors.push(`chat entry exported ${chatExports} names`);

  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family));
  if (!fonts.some((f) => f.includes("Inter"))) errors.push("Inter font did not load");
} catch (err) {
  errors.push(err instanceof Error ? err.message : String(err));
} finally {
  await browser.close();
  server.stop(true);
}

if (errors.length > 0) fail(`browser smoke test:\n  ${errors.join("\n  ")}`);
console.log("✓ browser: controls, popup, chat and markdown entries, CSS and fonts");
