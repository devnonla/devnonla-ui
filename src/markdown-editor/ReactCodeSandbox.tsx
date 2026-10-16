import { type ReactNode, useEffect, useRef, useState } from "react";
import { Icon } from "../icon/Icon";
import { cn } from "../lib/cn";
import { getColorMode, type NonlaColorMode, subscribeColorMode } from "../theme";
import { ReactCodeFrame } from "./ReactCodeFrame";
import { type HostMessage, REACT_CODE_SOURCE, readRunnerMessage } from "./reactCodeProtocol";

const RUNNER_URL = new URL("./reactSandboxFrame.ts", import.meta.url).href;

/** The runner page must report `ready` within this time. */
const READY_TIMEOUT_MS = 20000;
/** After the code is sent, the runner must report `rendered` within this time. */
const RENDER_TIMEOUT_MS = 15000;
const MIN_HEIGHT = 32;
const MAX_HEIGHT = 1200;

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

type ViteEnv = { DEV?: boolean; BASE_URL?: string };

function viteEnv(): ViteEnv {
  return (import.meta as ImportMeta & { env?: ViteEnv }).env ?? {};
}

/** Local Vite needs a websocket. A deployed host does not get network from the frame. */
function connectSrc(origin: string): string {
  const host = new URL(origin).hostname;
  if (host !== "localhost" && host !== "127.0.0.1") return "'none'";
  return `${origin} ${origin.replace(/^http/, "ws")}`;
}

/** Vite's React refresh check fails unless this runs before the runner module. Dev only. */
function reactRefreshPreamble(): string {
  const env = viteEnv();
  if (env.DEV !== true) return "";
  const base = env.BASE_URL ?? "/";
  return `<script type="module">
import { injectIntoGlobalHook } from ${JSON.stringify(`${base}@react-refresh`)};
injectIntoGlobalHook(window);
window.$RefreshReg$ = function () {};
window.$RefreshSig$ = function () { return function (type) { return type; }; };
</script>`;
}

/** Document for the sandboxed frame. The runner and its styles load from this package. */
function sandboxDocument(mode: NonlaColorMode): string {
  const origin = new URL(RUNNER_URL).origin;
  const csp = [
    "default-src 'none'",
    `script-src 'unsafe-inline' 'unsafe-eval' ${origin}`,
    `style-src 'unsafe-inline' ${origin}`,
    `img-src data: blob: ${origin}`,
    `font-src data: ${origin}`,
    `connect-src ${connectSrc(origin)}`,
    "form-action 'none'",
    "base-uri 'none'",
    "frame-src 'none'",
  ].join("; ");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Security-Policy" content="${escapeAttr(csp)}" />
<script>
document.documentElement.dataset.pendingMode=${JSON.stringify(mode)};
window.addEventListener("error", function (event) {
  var message = event.message || "The sandbox did not start.";
  parent.postMessage({ source: ${JSON.stringify(REACT_CODE_SOURCE)}, type: "error", message: String(message).slice(0, 300) }, "*");
});
</script>
<style>
  html { color-scheme: dark; background: #141414; }
  html:has(.nonla-ui.light) { color-scheme: light; background: #ffffff; }
  .nonla-ui { min-height: 100%; }
</style>
</head>
<body>
<div id="root"></div>
${reactRefreshPreamble()}
<script type="module" src="${escapeAttr(RUNNER_URL)}"></script>
</body>
</html>`;
}

export type ReactCodeSandboxProps = {
  /** Component source. Must `export default` a React component. */
  code: string;
  /** Header above the result. Default `false`. */
  showHeader?: boolean;
  /** Preview / Code switch in the header. Needs `showHeader`. Default `true`. */
  showCode?: boolean;
  /** Header text. Default `Sandbox`. */
  title?: ReactNode;
  /** Header icon. `null` hides it. */
  icon?: ReactNode;
  /** Classes for the outer box. */
  className?: string;
};

/**
 * Runs untrusted `live-react` source in a sandboxed iframe.
 *
 * Pass `code`. The frame is built here and loads this package's runner.
 * `react`, `devnonla-ui`, `devnonla-ui/chat`, `devnonla-ui/markdown`, and
 * `react-hook-form` can be imported. Nothing else can.
 *
 * `sandbox="allow-scripts"` without `allow-same-origin` gives the frame an opaque origin,
 * so it cannot read this page's cookies, storage, or DOM.
 */
export function ReactCodeSandbox({ code, showHeader = false, showCode = true, title = "Sandbox", icon, className }: ReactCodeSandboxProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState(getColorMode);
  const [painted, setPainted] = useState(false);
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  // Mode is baked into the document once. A later theme change is a message, so the frame does not reload.
  const modeOnLoad = useRef(getColorMode());

  useEffect(() => subscribeColorMode(() => setMode(getColorMode())), []);

  useEffect(() => {
    setSrcDoc(sandboxDocument(modeOnLoad.current));
  }, []);

  useEffect(() => {
    setPainted(false);
    setError(null);
  }, [srcDoc, code]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !srcDoc) return;
    let alive = true;
    // Once the runner has painted, a late timer must not replace the preview with an error.
    let didRender = false;
    let renderTimer: ReturnType<typeof setTimeout> | undefined;
    const readyTimer = setTimeout(() => {
      if (alive && !didRender) setError("The sandbox did not start.");
    }, READY_TIMEOUT_MS);

    const postRun = () => {
      const run: HostMessage = { source: REACT_CODE_SOURCE, type: "run", code, mode: getColorMode() };
      frame.contentWindow?.postMessage(run, "*");
    };

    const expectRender = () => {
      clearTimeout(renderTimer);
      renderTimer = setTimeout(() => {
        if (alive && !didRender) setError("The code took too long to run.");
      }, RENDER_TIMEOUT_MS);
    };

    const onMessage = (event: MessageEvent) => {
      // Only the frame we created. Its origin is opaque, so compare the window, not the origin.
      if (event.source !== frame.contentWindow) return;
      const msg = readRunnerMessage(event.data);
      if (!msg) return;
      if (msg.type === "ready") {
        clearTimeout(readyTimer);
        // A runner that restarts after paint (HMR) still needs the code, but must not restart the failure clock.
        if (didRender) {
          postRun();
          return;
        }
        setError(null);
        postRun();
        expectRender();
      } else if (msg.type === "rendered") {
        didRender = true;
        clearTimeout(renderTimer);
        setError(null);
        setPainted(true);
      } else if (msg.type === "resize") {
        setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(msg.height))));
      } else if (msg.type === "error") {
        clearTimeout(readyTimer);
        clearTimeout(renderTimer);
        setError(msg.message);
      }
    };

    // The frame has its own document, so it follows the page's light or dark mode through us.
    const unsubscribeMode = subscribeColorMode(() => {
      const mode: HostMessage = { source: REACT_CODE_SOURCE, type: "mode", mode: getColorMode() };
      frame.contentWindow?.postMessage(mode, "*");
    });

    window.addEventListener("message", onMessage);
    // Strict Mode remounts this listener after the frame already posted `ready`.
    postRun();
    return () => {
      alive = false;
      unsubscribeMode();
      window.removeEventListener("message", onMessage);
      clearTimeout(readyTimer);
      clearTimeout(renderTimer);
    };
  }, [code, srcDoc]);

  return (
    <ReactCodeFrame
      title={title}
      icon={icon === undefined ? <Icon name="shield-check" size={16} className="text-success" /> : icon}
      showHeader={showHeader}
      code={showCode ? code : undefined}
      className={className}
    >
      {error ? <p className="m-0 text-sm text-destructive">{error}</p> : null}
      {srcDoc ? (
        <iframe
          ref={frameRef}
          srcDoc={srcDoc}
          title="React example"
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
          className={cn("block w-full border-0 bg-background", (!painted || error) && "opacity-0")}
          style={{ height, colorScheme: mode }}
        />
      ) : null}
    </ReactCodeFrame>
  );
}
