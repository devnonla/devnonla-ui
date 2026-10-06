import { Component, type ReactNode, useMemo } from "react";
import { SolarIcon } from "../icon/SolarIcon";
import { ReactCodeFrame } from "./ReactCodeFrame";
import { compileReactCode, type LiveComponent } from "./reactCompile";

export type ReactCodeProps = {
  /** Component source. Must `export default` a React component. */
  code: string;
  /** Modules `import` can resolve. `react` is always available. */
  trustedModules: Record<string, unknown>;
  /** Header above the result. Default `true`. */
  showHeader?: boolean;
  /** Code tab in the header. Needs `showHeader`. Default `true`. */
  showCode?: boolean;
  /** Header text. Default `Live`. */
  title?: ReactNode;
  /** Header icon. `null` hides it. */
  icon?: ReactNode;
  /** Classes for the outer box. */
  className?: string;
};

type Compiled = { Demo: LiveComponent } | { error: string };

function Live({ code, trustedModules }: Pick<ReactCodeProps, "code" | "trustedModules">) {
  const compiled = useMemo<Compiled>(() => {
    try {
      return { Demo: compileReactCode(code, trustedModules) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Could not run this React block." };
    }
  }, [code, trustedModules]);

  if ("error" in compiled) return <p className="m-0 text-sm text-destructive">{compiled.error}</p>;
  const { Demo } = compiled;
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-6">
      <Demo />
    </div>
  );
}

class RenderBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }

  render() {
    if (this.state.error) return <p className="m-0 text-sm text-destructive">{this.state.error}</p>;
    return this.props.children;
  }
}

/**
 * Runs a `live-react` fence in this page, with this page's cookies, storage, and network.
 *
 * Only for source you wrote. Markdown from users or agents must use `ReactCodeSandbox`.
 */
export function ReactCode({ code, trustedModules, showHeader = true, showCode = true, title = "Live", icon, className }: ReactCodeProps) {
  return (
    <ReactCodeFrame
      title={title}
      icon={icon === undefined ? <SolarIcon name="play-circle-linear" size={16} className="text-warn" /> : icon}
      showHeader={showHeader}
      code={showCode ? code : undefined}
      className={className}
    >
      <RenderBoundary key={code}>
        <Live code={code} trustedModules={trustedModules} />
      </RenderBoundary>
    </ReactCodeFrame>
  );
}
