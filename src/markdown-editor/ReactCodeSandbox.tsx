import { type ReactNode, useEffect, useRef, useState } from "react";
import { SolarIcon } from "../icon/SolarIcon";
import { getColorMode, subscribeColorMode } from "../theme";
import { ReactCodeFrame } from "./ReactCodeFrame";
import { type HostMessage, REACT_CODE_SOURCE, readRunnerMessage } from "./reactCodeProtocol";

/** The runner page must report `ready` within this time. */
const READY_TIMEOUT_MS = 4000;
/** After the code is sent, the runner must report `rendered` within this time. */
const RENDER_TIMEOUT_MS = 5000;
const MIN_HEIGHT = 32;
const MAX_HEIGHT = 1200;

export type ReactCodeSandboxProps = {
  code: string;
  /** URL of a page that calls `mountReactCodeRunner`. Serve it from its own origin. */
  src: string;
  /** Header above the result. Default `true`. */
  showHeader?: boolean;
  /** Code tab in the header. Needs `showHeader`. Default `true`. */
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
 * so it cannot read this page's cookies, storage, or DOM. Hang or error removes the frame.
 */
export function ReactCodeSandbox({ code, src, showHeader = true, showCode = true, title = "Sandbox", icon, className }: ReactCodeSandboxProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let readyTimer: ReturnType<typeof setTimeout> | undefined = setTimeout(() => setError("The sandbox did not start."), READY_TIMEOUT_MS);
    let renderTimer: ReturnType<typeof setTimeout> | undefined;

    const onMessage = (event: MessageEvent) => {
      // Only the frame we created. Its origin is opaque, so compare the window, not the origin.
      if (event.source !== frame.contentWindow) return;
      const msg = readRunnerMessage(event.data);
      if (!msg) return;
      if (msg.type === "ready" && readyTimer) {
        clearTimeout(readyTimer);
        readyTimer = undefined;
        const run: HostMessage = { source: REACT_CODE_SOURCE, type: "run", code, mode: getColorMode() };
        frame.contentWindow?.postMessage(run, "*");
        renderTimer = setTimeout(() => setError("The code took too long to run."), RENDER_TIMEOUT_MS);
      } else if (msg.type === "rendered") {
        clearTimeout(renderTimer);
        renderTimer = undefined;
      } else if (msg.type === "resize") {
        setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(msg.height))));
      } else if (msg.type === "error") {
        // The real error wins over a timeout that has not fired yet.
        clearTimeout(readyTimer);
        clearTimeout(renderTimer);
        readyTimer = undefined;
        renderTimer = undefined;
        setError(msg.message);
      }
    };

    // The frame has its own document, so it follows the page's light or dark mode through us.
    const unsubscribeMode = subscribeColorMode(() => {
      const mode: HostMessage = { source: REACT_CODE_SOURCE, type: "mode", mode: getColorMode() };
      frame.contentWindow?.postMessage(mode, "*");
    });

    window.addEventListener("message", onMessage);
    return () => {
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
      {error ? (
        <p className="m-0 text-sm text-destructive">{error}</p>
      ) : (
        <iframe
          ref={frameRef}
          src={src}
          title="React example"
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
          className="block w-full border-0 bg-transparent"
          style={{ height }}
        />
      )}
    </ReactCodeFrame>
  );
}
