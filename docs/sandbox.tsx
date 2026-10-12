import * as ui from "@nonla-agents/ui";
import * as chat from "@nonla-agents/ui/chat";
import * as markdown from "@nonla-agents/ui/markdown";
import { mountReactCodeRunner } from "@nonla-agents/ui/markdown";
import * as rhf from "react-hook-form";
import "./sandbox.css";

// The only modules markdown can import in the sandbox. Docs import the public package name.
const root = document.getElementById("root");
if (!root) throw new Error("Sandbox root element not found");

const stop = mountReactCodeRunner(root, {
  "devnonla-ui": ui,
  "devnonla-ui/markdown": markdown,
  "devnonla-ui/chat": chat,
  "@nonla-agents/ui": ui,
  "@nonla-agents/ui/markdown": markdown,
  "@nonla-agents/ui/chat": chat,
  "react-hook-form": rhf,
});

// Without this, Vite HMR runs the module again and mounts a second runner on the same node.
import.meta.hot?.dispose(stop);
