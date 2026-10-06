import { Component, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { applyColorMode } from "../theme";
import { REACT_CODE_SOURCE, type RunnerPayload, readHostMessage } from "./reactCodeProtocol";
import { compileReactCode } from "./reactCompile";

type Report = (message: RunnerPayload) => void;

class Boundary extends Component<{ report: Report; children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }

  componentDidCatch(error: Error) {
    this.props.report({ type: "error", message: error.message });
  }

  render() {
    if (this.state.error) return <p style={{ margin: 0, color: "crimson", fontSize: 14 }}>{this.state.error}</p>;
    return this.props.children;
  }
}

/**
 * Runner side of the sandbox. Call this once from the page `ReactCodeSandbox` loads.
 *
 * `modules` is the only thing the markdown can import, and the host cannot change it.
 * Serve the page with `Content-Security-Policy: connect-src 'none'`, and with
 * `Access-Control-Allow-Origin: *` on its assets, since a sandboxed frame loads them cross-origin.
 */
export function mountReactCodeRunner(root: HTMLElement, modules: Record<string, unknown>): () => void {
  const reactRoot = createRoot(root);
  const report: Report = (message) => window.parent.postMessage({ source: REACT_CODE_SOURCE, ...message }, "*");

  let waitingForRun = true;
  const onMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) return;
    const msg = readHostMessage(event.data);
    if (!msg) return;
    applyColorMode(msg.mode);
    if (msg.type === "mode") return;
    waitingForRun = false;
    try {
      const Demo = compileReactCode(msg.code, modules);
      flushSync(() =>
        reactRoot.render(
          <Boundary report={report}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 24 }}>
              <Demo />
            </div>
          </Boundary>,
        ),
      );
      report({ type: "rendered" });
    } catch (error) {
      report({ type: "error", message: error instanceof Error ? error.message : "Could not run this React block." });
    }
  };

  const sendHeight = () => report({ type: "resize", height: root.getBoundingClientRect().height });
  const observer = new ResizeObserver(sendHeight);
  observer.observe(root);

  window.addEventListener("message", onMessage);
  report({ type: "ready" });
  // Host effect may miss the first ping (React Strict Mode remounts the listener).
  const readyBeat = window.setInterval(() => {
    if (waitingForRun) report({ type: "ready" });
    else window.clearInterval(readyBeat);
  }, 250);

  return () => {
    waitingForRun = false;
    window.clearInterval(readyBeat);
    window.removeEventListener("message", onMessage);
    observer.disconnect();
    reactRoot.unmount();
  };
}
