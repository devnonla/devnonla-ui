import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";
import { usePopupContainer } from "../app/context";
import { cn } from "../lib/cn";
import { type PopperPlacement, placementToRadix } from "../lib/placement";
import { glassOverlayClass } from "../lib/surface";

export type TooltipPlacement = PopperPlacement;

export type TooltipProps = {
  title?: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  mouseEnterDelay?: number;
  className?: string;
  /** Extra class on the overlay panel. */
  overlayClassName?: string;
  getPopupContainer?: () => HTMLElement;
  /** Show the small arrow pointing at the trigger. Default `true`. */
  arrow?: boolean | { pointAtCenter?: boolean };
};

export function Tooltip({
  title,
  children,
  placement = "top",
  open,
  defaultOpen,
  onOpenChange,
  mouseEnterDelay = 0.1,
  className,
  overlayClassName,
  getPopupContainer,
  arrow = true,
}: TooltipProps) {
  const getContainer = usePopupContainer(getPopupContainer);
  const { side, align } = placementToRadix(placement);
  if (title == null || title === false) return <>{children}</>;
  return (
    <TooltipPrimitive.Provider delayDuration={Math.round(mouseEnterDelay * 1000)}>
      <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal container={getContainer()}>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={10}
            className={cn(
              glassOverlayClass,
              // Cloudflare-style bubble: 6px radius, an outline ring (in the shadow token), a medium drop.
              "max-w-80 rounded-md border-0 px-2.5 py-1.5 text-(length:--nonla-nav-text-size) leading-[18px] shadow-(--nonla-tooltip-shadow)",
              // Radix tooltips open as `delayed-open` / `instant-open`; scale 0.9 + fade from the trigger, out the same way.
              "data-[state=delayed-open]:animate-[nonla-tooltip-in_var(--nonla-dur-fast)_cubic-bezier(0.4,0,0.2,1)] data-[state=instant-open]:animate-none",
              "data-[state=closed]:animate-[nonla-tooltip-out_var(--nonla-dur-fast)_cubic-bezier(0.4,0,0.2,1)_forwards]",
              className,
              overlayClassName,
            )}
          >
            {title}
            {arrow ? (
              <TooltipPrimitive.Arrow asChild width={20} height={10}>
                {/* Soft-tipped arrow: the fill hides the ring under its base, the edge path carries the ring around the tip. */}
                <svg viewBox="0 0 20 10" overflow="visible" aria-hidden="true">
                  <path className="fill-card" d="M9.66 6.4L4.81 2.03C4.07 1.37 3.12 1 2.13 1H0V-1H20V1H18.53C17.55 1 16.59 1.37 15.86 2.03L11 6.4C10.62 6.74 10.04 6.74 9.66 6.4Z" />
                  <path
                    className="fill-(--nonla-tooltip-arrow-edge)"
                    d="M10.33 5.65L5.48 1.28C4.56 0.46 3.37 0 2.13 0H0V1H2.13C3.12 1 4.07 1.37 4.81 2.03L9.66 6.4C10.04 6.74 10.62 6.74 11 6.4L15.86 2.03C16.59 1.37 17.55 1 18.53 1H20V0H18.53C17.3 0 16.11 0.46 15.19 1.28L10.33 5.65Z"
                  />
                </svg>
              </TooltipPrimitive.Arrow>
            ) : null}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
