import { type ComponentProps, createContext, type ReactNode, useContext, useMemo } from "react";
import { ButtonCopy } from "../button/ButtonCopy";
import { cn } from "../lib/cn";
import type { ControlSize } from "../lib/sizes";
import { OverlayScroll } from "../scroll/OverlayScroll";
import { highlightCode, languageLabel, wrapHljsLines } from "./highlight";

type CodeBlockContextValue = {
  code: string;
};

const CodeBlockContext = createContext<CodeBlockContextValue | null>(null);

export type CodeBlockProps = ComponentProps<"div"> & {
  /** Source code to render. */
  code: string;
  /** Language for highlight.js (`javascript`, `tsx`, `json`, …). */
  language?: string;
  /** Filename / label shown in the header. Falls back to the language name. */
  title?: ReactNode;
  /** Show gutter line numbers. */
  lineNumbers?: boolean;
  /** Wrap long lines instead of horizontal scroll. */
  wordWrap?: boolean;
};

export type CodeBlockCopyButtonProps = Omit<ComponentProps<"button">, "size"> & {
  content?: string;
  size?: ControlSize;
};

export function CodeBlockCopyButton({ content, className, ...props }: CodeBlockCopyButtonProps) {
  const ctx = useContext(CodeBlockContext);
  return <ButtonCopy text={content ?? ctx?.code ?? ""} label="Copy code" className={className} {...props} />;
}

export function CodeBlock({ code, language, title, lineNumbers = false, wordWrap = false, className, children, ...props }: CodeBlockProps) {
  const html = useMemo(() => {
    const highlighted = highlightCode(code, language);
    return lineNumbers ? wrapHljsLines(highlighted) : highlighted;
  }, [code, language, lineNumbers]);

  const label = title ?? languageLabel(language);

  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div className={cn("nonla-codeblock relative flex min-w-0 w-full flex-col overflow-clip rounded-xl border border-border bg-card text-sm text-foreground", className)} data-language={language} {...props}>
        <div className="nonla-codeblock-header flex h-8 items-center justify-between gap-2 pl-3 pr-1 text-xs text-muted-foreground">
          <div className="flex min-w-0 items-center gap-2">
            {label ? <span className="truncate font-medium">{label}</span> : null}
          </div>
          <CodeBlockCopyButton />
        </div>

        <OverlayScroll
          autoHeight
          className="nonla-codeblock-body nonla-codeblock-well min-w-0 bg-card font-mono text-(length:--md-code-size,var(--nonla-mono-text-size)) leading-(--md-code-leading,calc(var(--nonla-mono-text-size)*1.6)) max-h-96"
          innerClassName={wordWrap ? undefined : "overflow-x-auto"}
        >
          <pre className={cn("nonla-codeblock-pre m-0 whitespace-pre break-normal", lineNumbers && "nonla-codeblock-lines", wordWrap && "whitespace-pre-wrap wrap-break-word")}>
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: highlight.js emits escaped HTML */}
            <code className={cn("block px-3 py-2.5", !wordWrap && "w-max min-w-full")} dangerouslySetInnerHTML={{ __html: html }} />
          </pre>
        </OverlayScroll>
        {children}
      </div>
    </CodeBlockContext.Provider>
  );
}
