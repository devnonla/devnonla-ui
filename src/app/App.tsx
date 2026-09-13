import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ReactNode, useLayoutEffect, useMemo, useState } from "react";
import { type ControlSize, ControlSizeContext, normalizeSize } from "../lib/sizes";
import { MessageHolder, message } from "../message/message";
import { ConfirmHolder, Modal } from "../modal/Modal";
import { applyNonlaTheme, type NonlaThemeConfig } from "../theme";
import { AppContext, type NonlaAppConfig, useAppConfig, usePopupContainer, useToken } from "./context";

export type { NonlaAppConfig };
export { useAppConfig, usePopupContainer, useToken };

export type AppProps = {
  children: ReactNode;
  getPopupContainer?: () => HTMLElement;
  /** Default control size (`componentSize`). Per-control `size` still wins. */
  componentSize?: ControlSize;
  /** Override `--nonla-*` knobs on `:root` (portals inherit). Prefer CSS in the host when possible. */
  theme?: NonlaThemeConfig;
};

/** Root host for NonlaUI — ConfigProvider + message/modal holders. Mount once near app root. */
export function App({ children, getPopupContainer, componentSize, theme }: AppProps) {
  const [themeRev, setThemeRev] = useState(0);
  const size = componentSize ? normalizeSize(componentSize) : undefined;
  const value = useMemo<NonlaAppConfig>(
    () => ({ getPopupContainer, componentSize: size, themeRev }),
    [getPopupContainer, size, themeRev],
  );

  useLayoutEffect(() => {
    if (!theme) return;
    const restore = applyNonlaTheme(theme);
    setThemeRev((n) => n + 1);
    return () => {
      restore();
      setThemeRev((n) => n + 1);
    };
  }, [theme]);

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
