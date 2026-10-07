import { Component, type ReactNode, useMemo } from "react";
import { ReactCodeFrame } from "./ReactCodeFrame";
import { compileReactCode, type LiveComponent } from "./reactCompile";

export type ReactCodeProps = {
  /** Component source. Must `export default` a React component. */
  code: string;
  /** Modules `import` can resolve. `react` is always available. */
  trustedModules: Record<string, unknown>;
  /** Bordered frame around the preview. `false` shows the result inline. Default `true`. */
  showHeader?: boolean;
  /** Switch that opens the source. Needs `showHeader`. Default `true`. */
  showCode?: boolean;
  /** Label above the preview. Omit for no label bar. */
  title?: ReactNode;
  /** Icon before the title. */
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
export function ReactCode({ code, trustedModules, showHeader = true, showCode = true, title, icon, className }: ReactCodeProps) {
  return (
    <ReactCodeFrame
      title={title}
      icon={icon}
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
