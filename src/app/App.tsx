import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ReactNode, useMemo } from "react";
import { type ControlSize, ControlSizeContext, normalizeSize } from "../lib/sizes";
import { MessageHolder, message } from "../message/message";
import { ConfirmHolder, Modal } from "../modal/Modal";
import { initColorMode } from "../theme";
import { AppContext, type NonlaAppConfig, useAppConfig, usePopupContainer, useToken } from "./context";

export type { NonlaAppConfig };
export { useAppConfig, usePopupContainer, useToken };

export type AppProps = {
  children: ReactNode;
  getPopupContainer?: () => HTMLElement;
  /** Default control size (`componentSize`). Per-control `size` still wins. */
  componentSize?: ControlSize;
};

/** Root host for NonlaUI — ConfigProvider + message/modal holders. Mount once near app root. */
export function App({ children, getPopupContainer, componentSize }: AppProps) {
  // Before children paint, so a sandbox iframe can open on the saved mode instead of flashing the default.
  initColorMode();
  const size = componentSize ? normalizeSize(componentSize) : undefined;
  const value = useMemo<NonlaAppConfig>(() => ({ getPopupContainer, componentSize: size }), [getPopupContainer, size]);

  return (
    <AppContext.Provider value={value}>
      <ControlSizeContext.Provider value={size}>
        <TooltipPrimitive.Provider delayDuration={100}>
          {children}
          <MessageHolder />
          <ConfirmHolder />
        </TooltipPrimitive.Provider>
      </ControlSizeContext.Provider>
    </AppContext.Provider>
  );
}

/** Static APIs that follow this App tree (`useApp`). */
export function useApp() {
  return { message, modal: Modal };
}
