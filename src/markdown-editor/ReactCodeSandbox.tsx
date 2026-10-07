import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { SolarIcon } from "../icon/SolarIcon";
import { cn } from "../lib/cn";
import { getColorMode, type NonlaColorMode, subscribeColorMode } from "../theme";
import { ReactCodeFrame } from "./ReactCodeFrame";
import { type HostMessage, REACT_CODE_SOURCE, readRunnerMessage } from "./reactCodeProtocol";

/** Keep `mode` on the runner URL without dropping a query the caller already set. */
function withColorMode(src: string, mode: NonlaColorMode): string {
  const hashAt = src.indexOf("#");
  const hash = hashAt >= 0 ? src.slice(hashAt) : "";
  const beforeHash = hashAt >= 0 ? src.slice(0, hashAt) : src;
  const queryAt = beforeHash.indexOf("?");
  const path = queryAt >= 0 ? beforeHash.slice(0, queryAt) : beforeHash;
  const params = new URLSearchParams(queryAt >= 0 ? beforeHash.slice(queryAt + 1) : "");
  params.set("mode", mode);
  return `${path}?${params.toString()}${hash}`;
}

/** The runner page must report `ready` within this time. */
const READY_TIMEOUT_MS = 20000;
/** After the code is sent, the runner must report `rendered` within this time. */
const RENDER_TIMEOUT_MS = 15000;
const MIN_HEIGHT = 32;
const MAX_HEIGHT = 1200;

export type ReactCodeSandboxProps = {
  code: string;
  /** URL of a page that calls `mountReactCodeRunner`. Serve it from its own origin. Loaded with `?mode=light|dark` so the runner can paint before its script. */
  src: string;
  /** Header above the result. Default `true`. */
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
 * `sandbox="allow-scripts"` without `allow-same-origin` gives the frame an opaque origin,
 * so it cannot read this page's cookies, storage, or DOM.
 */
export function ReactCodeSandbox({ code, src, showHeader = true, showCode = true, title = "Sandbox", icon, className }: ReactCodeSandboxProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState(getColorMode);
  const [painted, setPainted] = useState(false);
  // Mode stays out of the URL after first load. A later theme change is a message, so the frame does not reload.
  const modeOnLoad = useRef(getColorMode());
  const frameSrc = useMemo(() => withColorMode(src, modeOnLoad.current), [src]);

  useEffect(() => subscribeColorMode(() => setMode(getColorMode())), []);

  useEffect(() => {
    setPainted(false);
    setError(null);
  }, [frameSrc, code]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
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
  }, [code, src]);

  return (
    <ReactCodeFrame
      title={title}
      icon={icon === undefined ? <SolarIcon name="shield-check-linear" size={16} className="text-success" /> : icon}
      showHeader={showHeader}
      code={showCode ? code : undefined}
      className={className}
    >
      {error ? <p className="m-0 text-sm text-destructive">{error}</p> : null}
      <iframe
        ref={frameRef}
        src={frameSrc}
        title="React example"
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        className={cn("block w-full border-0 bg-background", (!painted || error) && "opacity-0")}
        style={{ height, colorScheme: mode }}
      />
    </ReactCodeFrame>
  );
}
