import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { CanonicalSize } from "../lib/sizes";
import { getColorMode, getDesignToken, type NonlaTokenSnapshot, subscribeColorMode } from "../theme";

export type NonlaAppConfig = {
  getPopupContainer?: () => HTMLElement;
  componentSize?: CanonicalSize;
};

export const AppContext = createContext<NonlaAppConfig>({});

export function useAppConfig() {
  return useContext(AppContext);
}

/** Portal container for overlays (`getPopupContainer`). Always leaves the desktop stacking context. */
export function usePopupContainer(override?: () => HTMLElement) {
  const { getPopupContainer } = useAppConfig();
  return () => (override ?? getPopupContainer)?.() ?? document.body;
}

/** Computed `--nonla-*` knobs (`useToken`). Re-reads when the color mode changes. */
export function useToken(): { token: NonlaTokenSnapshot } {
  const mode = useSyncExternalStore(subscribeColorMode, getColorMode, () => "dark" as const);
  const token = useMemo(() => {
    void mode;
    return getDesignToken();
  }, [mode]);
  return { token };
}
