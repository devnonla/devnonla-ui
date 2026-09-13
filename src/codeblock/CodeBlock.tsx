import { FileText } from "lucide-react";
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
      <div className={cn("nonla-codeblock relative flex min-w-0 w-full flex-col overflow-clip rounded-lg border border-border bg-glass-bar text-sm text-foreground backdrop-blur-lg", className)} data-language={language} {...props}>
        <div className="flex h-9 items-center justify-between gap-2 pl-2 pr-1 text-sm text-muted-foreground">
          <div className="flex min-w-0 items-center gap-2">
            {label ? (
              <>
                <FileText size={14} className="shrink-0" aria-hidden />
                <span className="truncate font-medium">{label}</span>
              </>
            ) : null}
          </div>
          <CodeBlockCopyButton />
        </div>

        <OverlayScroll
          autoHeight
          className={cn("nonla-codeblock-body nonla-codeblock-well min-w-0 bg-card font-mono text-[13px] leading-5 max-h-96", !children && "mx-0.5 mb-0.5 rounded-lg")}
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
