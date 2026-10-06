import * as ui from "@nonla-agents/ui";
import { mountReactCodeRunner } from "@nonla-agents/ui";
import * as rhf from "react-hook-form";
import "./sandbox.css";

// The only modules markdown can import in the sandbox. Docs import the public package name.
const root = document.getElementById("root");
if (!root) throw new Error("Sandbox root element not found");

const stop = mountReactCodeRunner(root, {
  "devnonla-ui": ui,
  "@nonla-agents/ui": ui,
  "react-hook-form": rhf,
});

// Without this, Vite HMR runs the module again and mounts a second runner on the same node.
import.meta.hot?.dispose(stop);
