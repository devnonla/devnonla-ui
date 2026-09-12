import * as PopoverPrimitive from "@radix-ui/react-popover";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { usePopupContainer } from "../app/context";
import { cn } from "../lib/cn";
import { type PopperPlacement, placementToRadix } from "../lib/placement";
import { glassOverlayClass } from "../lib/surface";

export type PopoverProps = {
  content?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: "click" | "hover";
  placement?: PopperPlacement;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  getPopupContainer?: () => HTMLElement;
  /** Show arrow pointing at the trigger (Popconfirm default). */
  arrow?: boolean | { pointAtCenter?: boolean };
  className?: string;
  overlayClassName?: string;
  /** Extra class on the content panel (padding / width). */
  contentClassName?: string;
  style?: CSSProperties;
  /** `styles` — `root`/`body` map to content panel; `container` accepted as alias. */
  styles?: {
    root?: CSSProperties;
    body?: CSSProperties;
    content?: CSSProperties;
    container?: CSSProperties;
  };
};

export function Popover({
  content,
  title,
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  trigger = "click",
  placement = "bottom",
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  getPopupContainer,
  arrow = false,
  className,
  overlayClassName,
  contentClassName,
  style,
  styles,
}: PopoverProps) {
  const hover = trigger === "hover";
  const showArrow = Boolean(arrow);
  const panelStyle = { ...style, ...styles?.root, ...styles?.content, ...styles?.container, ...styles?.body };
  const getContainer = usePopupContainer(getPopupContainer);
  const { side, align } = placementToRadix(placement);
  const [innerOpen, setInnerOpen] = useState(defaultOpen ?? false);
  const open = openProp ?? innerOpen;
  const enterTimer = useRef<number>(0);
  const leaveTimer = useRef<number>(0);

  const setOpen = (v: boolean) => {
    if (openProp === undefined) setInnerOpen(v);
    onOpenChange?.(v);
  };

  useEffect(() => () => {
    window.clearTimeout(enterTimer.current);
    window.clearTimeout(leaveTimer.current);
  }, []);

  const onEnter = () => {
    if (!hover) return;
    window.clearTimeout(leaveTimer.current);
    enterTimer.current = window.setTimeout(() => setOpen(true), mouseEnterDelay * 1000);
  };
  const onLeave = () => {
    if (!hover) return;
    window.clearTimeout(enterTimer.current);
    leaveTimer.current = window.setTimeout(() => setOpen(false), mouseLeaveDelay * 1000);
  };

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        if (hover && v) return;
        setOpen(v);
      }}
    >
      <PopoverPrimitive.Trigger asChild onMouseEnter={onEnter} onMouseLeave={onLeave}>
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={getContainer()}>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={showArrow ? 8 : 6}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className={cn("w-max max-w-sm p-3", glassOverlayClass, contentClassName, className, overlayClassName)}
          style={panelStyle}
        >
          {title ? <div className="mb-2 text-sm font-medium">{title}</div> : null}
          {content}
          {showArrow ? <PopoverPrimitive.Arrow width={12} height={6} className="fill-glass drop-shadow-[0_1px_0_var(--glass-border)]" /> : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
