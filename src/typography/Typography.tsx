import { type AnchorHTMLAttributes, type CSSProperties, createElement, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { headingClass, markdownBodyClass, markdownParagraphClass, markdownVariantStyle, pageTitleClass } from "../markdown-editor/markdownScale";

export type TypographyType = "secondary" | "success" | "warning" | "danger";

export type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

type Decorations = {
  type?: TypographyType;
  disabled?: boolean;
  mark?: boolean;
  code?: boolean;
  keyboard?: boolean;
  underline?: boolean;
  delete?: boolean;
  strong?: boolean;
  italic?: boolean;
};

/** Same ink as MarkdownViewer. Status tones sit on top of that. */
const INK = {
  title: "var(--nonla-text-main)",
  body: "var(--nonla-text-main)",
  secondary: "var(--nonla-text-tertiary)",
  quiet: "var(--nonla-text-quaternary)",
  success: "var(--nonla-success)",
  warning: "var(--nonla-warn)",
  danger: "var(--nonla-danger)",
} as const;

type InkRole = "title" | "body";

const TITLE_TAG = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

/** Same scale as MarkdownViewer `docs`. Body size is `--nonla-base-text-size`. Inline code reads `--md-inline-size` (14px). */
const BODY = markdownBodyClass;

const INLINE_CODE = "nonla-inline-code rounded-sm bg-muted px-[0.35em] py-[0.12em] align-baseline font-mono text-(length:--md-inline-size,14px) leading-none whitespace-nowrap [box-decoration-break:clone] [-webkit-box-decoration-break:clone]";

const TITLE_SPACE = "nonla-typo";

function decorationLine(underline?: boolean, deleted?: boolean) {
  if (underline && deleted) return "underline line-through";
  if (underline) return "underline";
  if (deleted) return "line-through";
  return undefined;
}

function wrapDecorations(children: ReactNode, props: Decorations) {
  let node = children;
  if (props.mark) {
    node = <mark className="rounded-sm bg-[color-mix(in_oklab,var(--nonla-warn)_40%,transparent)] px-0.5 text-inherit">{node}</mark>;
  }
  if (props.code) {
    node = <code className={INLINE_CODE}>{node}</code>;
  }
  if (props.keyboard) {
    node = <kbd className="inline-block rounded-md border border-b-2 border-border bg-muted px-1.5 font-mono text-[0.85em] leading-5">{node}</kbd>;
  }
  return node;
}

function rankColor(role: InkRole, props: Decorations): string | undefined {
  if (props.disabled) return INK.quiet;
  if (props.type === "secondary") return INK.secondary;
  if (props.type === "success") return INK.success;
  if (props.type === "warning") return INK.warning;
  if (props.type === "danger") return INK.danger;
  if (role === "title") return INK.title;
  if (role === "body") return INK.body;
  return undefined;
}

function decorated(props: Decorations, children: ReactNode, base: string, className?: string, style?: HTMLAttributes<HTMLElement>["style"], role: InkRole = "body") {
  const line = decorationLine(props.underline, props.delete);
  const color = rankColor(role, props);
  const scale: CSSProperties = { ...markdownVariantStyle("docs"), ...(color ? { color } : null), ...(line ? { textDecorationLine: line } : null), ...style };
  return {
    className: cn(base, props.disabled && "cursor-not-allowed", props.strong && "font-(--md-strong-weight,600)", props.italic && "italic", props.underline && "underline-offset-[3px]", className),
    style: scale,
    children: wrapDecorations(children, props),
    "aria-disabled": props.disabled || undefined,
  };
}

function splitDecorations<T extends Decorations>(props: T) {
  const { type, disabled, mark, code, keyboard, underline, delete: deleted, strong, italic, ...rest } = props;
  return {
    decorations: { type, disabled, mark, code, keyboard, underline, delete: deleted, strong, italic },
    rest,
  };
}

export type TypographyProps = HTMLAttributes<HTMLDivElement>;

function TypographyRoot({ className, ...rest }: TypographyProps) {
  return <div className={cn("text-foreground", className)} {...rest} />;
}

export type TypographyTextProps = Omit<HTMLAttributes<HTMLSpanElement>, "color"> & Decorations & { children?: ReactNode };

export function Text({ className, style, children, ...props }: TypographyTextProps) {
  const { decorations, rest } = splitDecorations(props);
  return <span {...rest} {...decorated(decorations, children, BODY, className, style, "body")} />;
}

export type TypographyTitleProps = Omit<HTMLAttributes<HTMLHeadingElement>, "color"> & Decorations & {
  level?: TitleLevel;
  children?: ReactNode;
};

export function Title({ level = 1, className, style, children, ...props }: TypographyTitleProps) {
  const { decorations, rest } = splitDecorations(props);
  return createElement(TITLE_TAG[level], { ...rest, ...decorated(decorations, children, cn(TITLE_SPACE, level === 1 ? pageTitleClass : headingClass(level)), className, style, "title") });
}

export type TypographyParagraphProps = Omit<HTMLAttributes<HTMLParagraphElement>, "color"> & Decorations & { children?: ReactNode };

export function Paragraph({ className, style, children, ...props }: TypographyParagraphProps) {
  const { decorations, rest } = splitDecorations(props);
  return <p {...rest} {...decorated(decorations, children, markdownParagraphClass, className, style, "body")} />;
}

export type TypographyLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> & Decorations & { children?: ReactNode };

export function Link({ href, target, rel, className, style, children, onClick, ...props }: TypographyLinkProps) {
  const { decorations, rest } = splitDecorations(props);
  const view = decorated(
    decorations,
    children,
    cn("cursor-pointer underline-offset-[3px]", BODY, decorations.disabled || decorations.underline ? undefined : "hover:underline"),
    className,
    style,
    "body",
  );

  return (
    <a
      {...rest}
      {...view}
      href={decorations.disabled ? undefined : href}
      target={target}
      rel={target === "_blank" && rel == null ? "noreferrer noopener" : rel}
      tabIndex={decorations.disabled ? -1 : rest.tabIndex}
      onClick={(event) => {
        if (decorations.disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    />
  );
}

export const Typography = Object.assign(TypographyRoot, { Text, Title, Paragraph, Link });
