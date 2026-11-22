import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type CSSProperties, cloneElement, createContext, type ForwardRefExoticComponent, forwardRef, isValidElement, type MouseEvent, type ReactNode, type RefAttributes, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../icon/Icon";
import { cn, focusRing } from "../lib/cn";
import type { ControlSize } from "../lib/sizes";
import { controlHeightVar, controlRadiusVar, getSizeTokens, useControlSize } from "../lib/sizes";

/** `icon` is a square, icon-only button that looks like `text`: no fill or border until hover. Give it an `aria-label`. */
export type ButtonType = "default" | "primary" | "link" | "text" | "icon";
export type ButtonVariant = "outlined" | "solid" | "filled" | "text" | "icon" | "link" | "nostyle";
export type ButtonShape = "default" | "circle" | "round" | "square";
export type ButtonHtmlType = "submit" | "button" | "reset";
export type ButtonSize = ControlSize;
export type ButtonColor = "default" | "primary" | "danger" | "blue" | "purple" | "cyan" | "green" | "magenta" | "pink" | "red" | "orange" | "yellow" | "volcano" | "geekblue" | "lime" | "gold" | "link";

type SemanticSlot = "root" | "icon" | "content";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLElement> & AnchorHTMLAttributes<HTMLElement>, "type" | "color"> & {
  type?: ButtonType;
  color?: ButtonColor;
  variant?: ButtonVariant;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  iconPlacement?: "start" | "end";
  shape?: ButtonShape;
  size?: ButtonSize;
  loading?: boolean | { delay?: number; icon?: ReactNode };
  prefixCls?: string;
  rootClassName?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  href?: string;
  htmlType?: ButtonHtmlType;
  autoInsertSpace?: boolean;
  classNames?: Partial<Record<SemanticSlot, string>>;
  styles?: Partial<Record<SemanticSlot, CSSProperties>>;
};

export type ButtonGroupProps = {
  size?: ButtonSize;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const TYPE_MAP: Record<ButtonType, [ButtonColor, ButtonVariant]> = {
  default: ["default", "outlined"],
  primary: ["primary", "solid"],
  link: ["link", "link"],
  text: ["default", "text"],
  icon: ["default", "icon"],
};

const HTML_BUTTON_TYPES = new Set(["button", "submit", "reset"]);

function isButtonType(value: unknown): value is ButtonType {
  return typeof value === "string" && value in TYPE_MAP;
}

function resolveTone(type: ButtonType | undefined, color: ButtonColor | undefined, variant: ButtonVariant | undefined, danger: boolean): [ButtonColor, ButtonVariant] {
  if (variant === "nostyle") return ["default", "nostyle"];
  if (color && variant) return [danger ? "danger" : color, variant];
  if (type || danger) {
    const pair = TYPE_MAP[isButtonType(type) ? type : "default"];
    return [danger ? "danger" : pair[0], pair[1]];
  }
  if (variant === "solid") return ["primary", "solid"];
  return ["default", variant ?? "outlined"];
}

/** Glyph box for `type="icon"` per size: about 60% of the button. */
const ICON_BUTTON_GLYPH = { small: 16, default: 20, large: 24 } as const;

const PRESET_COLORS = new Set<ButtonColor>(["blue", "purple", "cyan", "green", "magenta", "pink", "red", "orange", "yellow", "volcano", "geekblue", "lime", "gold"]);

const TWO_CN = /^[\u4e00-\u9fa5]{2}$/;
const GroupSizeContext = createContext<ButtonSize | undefined>(undefined);

function tokenAppearance(color: "default" | "primary" | "danger" | "link", variant: ButtonVariant, ghost: boolean): string {
  if (variant === "nostyle") return "";
  const g = ghost && variant !== "text" && variant !== "link";
  if (color === "primary") {
    if (variant === "solid" && !g) return "border-(--nonla-brand-ring) bg-brand-fill text-on-brand shadow-(--nonla-solid-shadow) hover:bg-brand-fill-hover active:bg-brand-fill-active";
    if (variant === "filled") return "bg-brand-bg text-brand border-transparent hover:bg-brand-bg-hover active:bg-brand-border";
    if (variant === "text" || variant === "icon") return "bg-transparent text-brand border-transparent hover:bg-brand-bg active:bg-brand-bg-hover";
    if (variant === "link") return "text-brand border-transparent underline-offset-4 hover:underline";
    return "bg-transparent text-brand border-brand hover:bg-brand-bg active:bg-brand-bg-hover";
  }
  if (color === "danger") {
    if (variant === "solid" && !g) return "border-(--nonla-danger-ring) bg-destructive-fill text-on-destructive shadow-(--nonla-solid-shadow) hover:bg-destructive-fill-hover active:bg-destructive-fill-active";
    if (variant === "filled") return "bg-destructive-bg text-destructive border-transparent hover:bg-destructive-bg-hover active:bg-destructive-border";
    if (variant === "text" || variant === "icon") return "bg-transparent text-destructive border-transparent hover:bg-destructive-bg active:bg-destructive-bg-hover";
    if (variant === "link") return "text-destructive border-transparent underline-offset-4 hover:underline";
    return "bg-transparent text-destructive border-destructive-border hover:bg-destructive-bg active:bg-destructive-bg-hover";
  }
  if (color === "link" || variant === "link") return "text-link border-transparent underline-offset-4 hover:underline";
  if (variant === "filled") return "bg-muted text-foreground border-transparent hover:bg-(--nonla-fill-strong) active:bg-ink-active";
  if (variant === "text") return "bg-transparent text-foreground border-transparent hover:bg-ink-hover active:bg-ink-active";
  if (variant === "icon") return "bg-transparent text-foreground border-transparent hover:bg-ink-hover active:bg-ink-active";
  // Raised default (measured on Cloudflare): surface fill, hairline, 1px contact shadow. Hover darkens the fill a step, press a bit more.
  // No press scale on popup triggers (Radix sets `data-state`): the popup anchors to the trigger box and would jump with it.
  return "nonla-btn-glass border-border bg-card text-foreground shadow-(--nonla-btn-shadow) transition-[background-color,transform] duration-(--nonla-dur-fast) ease-(--nonla-ease-out) hover:not-disabled:not-aria-disabled:bg-(--nonla-btn-bg-hover) active:not-disabled:not-aria-disabled:not-data-[state]:scale-[0.97] active:not-disabled:not-aria-disabled:bg-(--nonla-btn-bg-active) motion-reduce:transition-[background-color] motion-reduce:active:transform-none";
}

function presetAppearance(variant: ButtonVariant, ghost: boolean): string {
  if (variant === "nostyle") return "";
  const g = ghost && variant !== "text" && variant !== "link";
  if (variant === "solid" && !g)
    return "bg-(--nonla-btn) text-(--nonla-text-on-solid) border-transparent hover:bg-[color-mix(in_oklab,var(--nonla-btn)_90%,var(--nonla-fill-shade))] active:bg-[color-mix(in_oklab,var(--nonla-btn)_82%,var(--nonla-fill-shade))]";
  if (variant === "filled") return "bg-(--nonla-btn)/10 text-(--nonla-btn) border-transparent hover:bg-(--nonla-btn)/16 active:bg-(--nonla-btn)/24";
  if (variant === "link") return "text-(--nonla-btn) border-transparent underline-offset-4 hover:underline";
  if (variant === "text" || variant === "icon") return "bg-transparent text-(--nonla-btn) border-transparent hover:bg-(--nonla-btn)/10 active:bg-(--nonla-btn)/16";
  return "bg-transparent text-(--nonla-btn) border-(--nonla-btn) hover:bg-(--nonla-btn)/10 active:bg-(--nonla-btn)/16";
}

function LoadingDot({ size }: { size: number }) {
  return <span className="shrink-0 rounded-full border-2 border-current/25 border-t-current animate-spin" style={{ width: size, height: size }} aria-hidden />;
}

function ButtonGroup({ size, className, style, children }: ButtonGroupProps) {
  return (
    <GroupSizeContext.Provider value={size}>
      <div role="group" className={cn("inline-flex items-stretch", className)} style={style}>
        {children}
      </div>
    </GroupSizeContext.Provider>
  );
}

const ButtonInner = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  {
    type: typeProp,
    color,
    variant,
    icon,
    iconPosition,
    iconPlacement,
    shape = "default",
    size: sizeProp,
    disabled,
    loading = false,
    prefixCls,
    className,
    rootClassName,
    ghost = false,
    danger = false,
    block = false,
    children,
    classNames,
    styles,
    href,
    htmlType = "button",
    autoInsertSpace = true,
    autoFocus,
    onClick,
    style,
    ...rest
  },
  ref,
) {
  // Radix Trigger asChild merges native type="button"|"submit"|"reset" onto our `type` prop.
  const typeIsHtml = typeof typeProp === "string" && HTML_BUTTON_TYPES.has(typeProp);
  const type = typeIsHtml ? undefined : (typeProp as ButtonType | undefined);
  const resolvedHtmlType = (typeIsHtml ? typeProp : htmlType) as ButtonHtmlType;

  const groupSize = useContext(GroupSizeContext);
  const size = useControlSize(sizeProp ?? groupSize);
  const tok = getSizeTokens(size);
  const [mergedColor, mergedVariant] = resolveTone(type, color, variant, danger);
  const preset = PRESET_COLORS.has(mergedColor);
  const placement = iconPlacement ?? iconPosition ?? "start";
  const iconVariant = mergedVariant === "icon";
  // `type="icon"` takes the glyph from `icon` or, if unset, from `children`. It never renders a label.
  const iconProp = iconVariant && icon == null ? children : icon;
  const iconOnly = iconVariant || children == null || children === false || children === "";

  const loadingOn = typeof loading === "object" ? true : !!loading;
  const loadingDelay = typeof loading === "object" ? (loading.delay ?? 0) : 0;
  const [innerLoading, setInnerLoading] = useState(loadingOn && loadingDelay <= 0);

  useLayoutEffect(() => {
    if (!loadingOn) {
      setInnerLoading(false);
      return;
    }
    if (loadingDelay <= 0) {
      setInnerLoading(true);
      return;
    }
    const t = window.setTimeout(() => setInnerLoading(true), loadingDelay);
    return () => window.clearTimeout(t);
  }, [loadingOn, loadingDelay]);

  const nodeRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  useEffect(() => {
    if (autoFocus) nodeRef.current?.focus();
  }, [autoFocus]);

  const setRef = (node: HTMLButtonElement | HTMLAnchorElement | null) => {
    nodeRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLButtonElement | HTMLAnchorElement | null }).current = node;
  };

  const content = useMemo(() => {
    if (typeof children === "string" && autoInsertSpace && TWO_CN.test(children)) return `${children[0]} ${children[1]}`;
    return children;
  }, [children, autoInsertSpace]);

  // Icon-only buttons use a toolbar-sized glyph box (20px in a 32px button, as on Claude desktop).
  const iconSize = iconVariant ? ICON_BUTTON_GLYPH[size] : tok.icon;
  // An `<Icon>` without its own `size` takes the icon button's glyph box, so the stroke weight matches the drawn size.
  const sizedIcon = iconVariant && isValidElement<{ size?: number }>(iconProp) && iconProp.type === Icon && iconProp.props.size == null ? cloneElement(iconProp, { size: iconSize }) : iconProp;
  const iconNode = innerLoading ? typeof loading === "object" && loading.icon ? loading.icon : <LoadingDot size={iconSize} /> : sizedIcon;
  const showIcon = Boolean(iconNode);
  const bare = mergedVariant === "nostyle";
  const radius = shape === "circle" || shape === "round" ? 9999 : shape === "square" ? 4 : controlRadiusVar(size);
  const appearance = bare ? "" : preset ? presetAppearance(mergedVariant, ghost) : tokenAppearance(mergedColor as "default" | "primary" | "danger" | "link", mergedVariant, ghost);
  const bordered = !bare && mergedVariant !== "text" && mergedVariant !== "icon" && mergedVariant !== "link";

  const padText = tok.paddingInline;
  const paddingLeft = iconOnly ? 0 : showIcon && placement === "start" ? tok.paddingInlineIconStart : padText;
  const paddingRight = iconOnly ? 0 : showIcon && placement === "end" ? tok.paddingInlineIconEnd : padText;

  const rootClass = cn(
    bare
      ? "inline-flex items-center justify-center gap-2 cursor-pointer border-0 bg-transparent px-0 py-0 text-inherit rounded-none disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      : "inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap select-none cursor-pointer border border-solid transition-colors disabled:cursor-not-allowed disabled:opacity-45",
    !bare && focusRing,
    !bare && (bordered ? "border" : "border-transparent"),
    appearance,
    block && "flex w-full",
    innerLoading && "pointer-events-none",
    !bare && innerLoading && "opacity-80",
    placement === "end" && "flex-row-reverse",
    prefixCls,
    className,
    rootClassName,
    classNames?.root,
  );

  const boxH = controlHeightVar(size);
  const mergedStyle: CSSProperties = bare
    ? { ...styles?.root, ...style }
    : {
        height: boxH,
        width: iconOnly ? boxH : undefined,
        fontSize: tok.fontSize,
        lineHeight: `${tok.lineHeight}px`,
        paddingLeft,
        paddingRight,
        borderRadius: radius,
        ...(preset ? ({ "--nonla-btn": `var(--nonla-${mergedColor})` } as CSSProperties) : null),
        ...styles?.root,
        ...style,
      };

  const handleClick = (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (innerLoading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const inner = (
    <>
      {showIcon ? (
        <span className={cn("relative z-10 inline-flex shrink-0 items-center justify-center", !bare && "[&_svg]:size-full", classNames?.icon)} style={bare ? styles?.icon : { width: iconSize, height: iconSize, ...styles?.icon }}>
          {iconNode}
        </span>
      ) : null}
      {!iconVariant && content != null && content !== false && content !== "" ? (
        <span className={cn("relative z-10 inline-flex min-w-0 items-center", classNames?.content)} style={styles?.content}>
          {content}
        </span>
      ) : null}
    </>
  );

  if (href !== undefined) {
    return (
      <a {...rest} ref={setRef} href={disabled ? undefined : href} className={rootClass} style={mergedStyle} onClick={handleClick} tabIndex={disabled ? -1 : rest.tabIndex} aria-disabled={disabled || undefined} aria-busy={innerLoading || undefined}>
        {inner}
      </a>
    );
  }

  return (
    <button {...rest} ref={setRef} type={resolvedHtmlType} className={rootClass} style={mergedStyle} onClick={handleClick} disabled={disabled} aria-busy={innerLoading || undefined}>
      {inner}
    </button>
  );
});

type ButtonComponent = ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement | HTMLAnchorElement>> & {
  Group: typeof ButtonGroup;
};

export const Button = Object.assign(ButtonInner, { Group: ButtonGroup }) as ButtonComponent;
