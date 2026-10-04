import { type AnchorHTMLAttributes, createElement, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/cn";

export type TypographyType = "secondary" | "success" | "warning" | "danger";

export type TitleLevel = 1 | 2 | 3 | 4 | 5;

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

const TYPE_CLASS: Record<TypographyType, string> = {
  secondary: "text-muted-foreground",
  success: "text-success",
  warning: "text-warn",
  danger: "text-destructive",
};

const TITLE_TAG = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
} as const;

/** Ant Design seed: body 14/22, headings 38/46, 30/38, 24/32, 20/28, 16/24. */
const BODY = "text-[14px] leading-[22px]";

const TITLE_CLASS: Record<TitleLevel, string> = {
  1: "text-[38px] leading-[46px] font-bold",
  2: "text-[30px] leading-[38px] font-bold",
  3: "text-[24px] leading-[32px] font-semibold",
  4: "text-[20px] leading-[28px] font-semibold",
  5: "text-[16px] leading-[24px] font-semibold",
};

const TITLE_SPACE = "nonla-typo mt-0 mb-[0.5em] [.nonla-typo+&]:mt-[1.2em]";

function decorationLine(underline?: boolean, deleted?: boolean) {
  if (underline && deleted) return "underline line-through";
  if (underline) return "underline";
  if (deleted) return "line-through";
  return undefined;
}

function wrapDecorations(children: ReactNode, props: Decorations) {
  let node = children;
  if (props.mark) {
    node = <mark className="rounded-sm bg-[color-mix(in_oklab,var(--nonla-yellow)_40%,transparent)] px-0.5 text-inherit">{node}</mark>;
  }
  if (props.code) {
    node = <code className="rounded-sm bg-secondary px-1 py-px font-mono text-[0.9em]">{node}</code>;
  }
  if (props.keyboard) {
    node = <kbd className="inline-block rounded-md border border-b-2 border-border bg-muted px-1.5 font-mono text-[0.85em] leading-5">{node}</kbd>;
  }
  return node;
}

function toneClass({ type, disabled }: Decorations) {
  if (disabled) return "cursor-not-allowed text-quaternary-foreground";
  return type ? TYPE_CLASS[type] : undefined;
}

function decorated(props: Decorations, children: ReactNode, base: string, className?: string, style?: HTMLAttributes<HTMLElement>["style"]) {
  const line = decorationLine(props.underline, props.delete);
  return {
    className: cn(base, toneClass(props), props.strong && "font-semibold", props.italic && "italic", props.underline && "underline-offset-[3px]", className),
    style: line ? { textDecorationLine: line, ...style } : style,
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
  return <span {...rest} {...decorated(decorations, children, cn(BODY, "text-foreground"), className, style)} />;
}

export type TypographyTitleProps = Omit<HTMLAttributes<HTMLHeadingElement>, "color"> & Decorations & {
  level?: TitleLevel;
  children?: ReactNode;
};

export function Title({ level = 1, className, style, children, ...props }: TypographyTitleProps) {
  const { decorations, rest } = splitDecorations(props);
  return createElement(TITLE_TAG[level], { ...rest, ...decorated(decorations, children, cn(TITLE_SPACE, "text-foreground", TITLE_CLASS[level]), className, style) });
}

export type TypographyParagraphProps = Omit<HTMLAttributes<HTMLParagraphElement>, "color"> & Decorations & { children?: ReactNode };

export function Paragraph({ className, style, children, ...props }: TypographyParagraphProps) {
  const { decorations, rest } = splitDecorations(props);
  return <p {...rest} {...decorated(decorations, children, "nonla-typo m-0 text-[15px] leading-7 text-foreground [p.nonla-typo+&]:mt-3", className, style)} />;
}

export type TypographyLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> & Decorations & { children?: ReactNode };

export function Link({ href, target, rel, className, style, children, onClick, ...props }: TypographyLinkProps) {
  const { decorations, rest } = splitDecorations(props);
  const view = decorated(
    decorations,
    children,
    cn(
      "cursor-pointer underline-offset-[3px]",
      BODY,
      decorations.type || decorations.disabled ? undefined : "text-brand hover:text-brand-700",
      decorations.disabled || decorations.underline ? undefined : "hover:underline",
    ),
    className,
    style,
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
