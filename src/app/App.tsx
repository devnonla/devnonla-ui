import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ReactNode, useLayoutEffect, useMemo, useRef } from "react";
import { cn } from "../lib/cn";
import { type ControlSize, ControlSizeContext, normalizeSize } from "../lib/sizes";
import { MessageHolder, message } from "../message/message";
import { ConfirmHolder, Modal } from "../modal/Modal";
import { bindColorModeTarget, initColorMode } from "../theme";
import { AppContext, type NonlaAppConfig, useAppConfig, usePopupContainer } from "./context";

export type { NonlaAppConfig };
export { useAppConfig, usePopupContainer };

export type AppProps = {
  children: ReactNode;
  getPopupContainer?: () => HTMLElement;
  /** Default control size (`componentSize`). Per-control `size` still wins. */
  componentSize?: ControlSize;
  /** Extra classes on the `.nonla-ui` host. */
  className?: string;
};

/** Root host for NonlaUI — theme scope + message/modal holders. Mount once near app root. */
export function App({ children, getPopupContainer, componentSize, className }: AppProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const size = componentSize ? normalizeSize(componentSize) : undefined;
  const value = useMemo<NonlaAppConfig>(
    () => ({
      getPopupContainer: getPopupContainer ?? (() => hostRef.current ?? document.body),
      componentSize: size,
    }),
    [getPopupContainer, size],
  );

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    bindColorModeTarget(host);
    initColorMode(host);
    return () => bindColorModeTarget(null);
  }, []);

  return (
    <div ref={hostRef} className={cn("nonla-ui h-full min-h-0", className)}>
      <AppContext.Provider value={value}>
        <ControlSizeContext.Provider value={size}>
          <TooltipPrimitive.Provider delayDuration={100}>
            {children}
            <MessageHolder />
            <ConfirmHolder />
          </TooltipPrimitive.Provider>
        </ControlSizeContext.Provider>
      </AppContext.Provider>
    </div>
  );
}

/** Static APIs that follow this App tree (`useApp`). */
export function useApp() {
  return { message, modal: Modal };
}
