import type { ReactNode } from "react";
import * as React from "react";
import { transform } from "sucrase";

export type LiveComponent = () => ReactNode;

/**
 * Compiles TSX source to a component. This runs the source as code in the current
 * page, so it must only see trusted input or run inside the sandbox runner.
 */
export function compileReactCode(code: string, modules: Record<string, unknown>): LiveComponent {
  const js = transform(code, {
    transforms: ["typescript", "jsx", "imports"],
    jsxRuntime: "classic",
    production: true,
  }).code;
  const requireModule = (id: string) => {
    if (id === "react") return React;
    if (Object.hasOwn(modules, id)) return modules[id];
    throw new Error(`Unknown module "${id}".`);
  };
  const exports: { default?: LiveComponent } = {};
  const run = new Function("require", "exports", "React", `${js}\nreturn exports.default;`) as (
    require: (id: string) => unknown,
    exports: { default?: LiveComponent },
    React: typeof import("react"),
  ) => LiveComponent | undefined;
  const Demo = run(requireModule, exports, React);
  if (typeof Demo !== "function") throw new Error("React block must export default a component.");
  return Demo;
}
