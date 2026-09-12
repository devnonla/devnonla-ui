import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ReactNode } from "react";
import { useAppConfig } from "../app/App";
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
  /** antd alias */
  overlayClassName?: string;
  getPopupContainer?: () => HTMLElement;
  /** antd accepts `boolean | { pointAtCenter }` — we only honor truthiness. */
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
}: TooltipProps) {
  const app = useAppConfig();
  const { side, align } = placementToRadix(placement);
  const container = getPopupContainer ?? app.getPopupContainer;
  if (title == null || title === false) return <>{children}</>;
  return (
    <TooltipPrimitive.Provider delayDuration={Math.round(mouseEnterDelay * 1000)}>
      <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal container={container?.()}>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            className={cn(glassOverlayClass, "max-w-xs rounded-md px-2.5 py-1.5 text-xs", className, overlayClassName)}
          >
            {title}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
