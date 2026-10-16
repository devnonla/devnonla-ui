import "./reactSandboxFrame.css";
import * as rhf from "react-hook-form";
import * as chat from "../chat/index";
import * as ui from "../index";
import * as markdown from "./index";
import { mountReactCodeRunner } from "./ReactCodeRunner";

// Fixed allowlist. The host page only sends source text, so it cannot add modules.
const modules = {
  "devnonla-ui": ui,
  "devnonla-ui/markdown": markdown,
  "devnonla-ui/chat": chat,
  "@nonla-agents/ui": ui,
  "@nonla-agents/ui/markdown": markdown,
  "@nonla-agents/ui/chat": chat,
  "react-hook-form": rhf,
};

const root = document.getElementById("root");
if (!root) throw new Error("Sandbox root element not found");

const stop = mountReactCodeRunner(root, modules);

type Hot = { dispose: (callback: () => void) => void };
const hot = (import.meta as ImportMeta & { hot?: Hot }).hot;
hot?.dispose(stop);
