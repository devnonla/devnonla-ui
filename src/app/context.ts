import { createContext, useContext, useMemo } from "react";
import type { CanonicalSize } from "../lib/sizes";
import { getDesignToken, type NonlaTokenSnapshot } from "../theme";

export type NonlaAppConfig = {
  getPopupContainer?: () => HTMLElement;
  componentSize?: CanonicalSize;
  /** Bumps when `<App theme>` applies knobs — `useToken` re-reads CSS. */
  themeRev: number;
};

export const AppContext = createContext<NonlaAppConfig>({ themeRev: 0 });

export function useAppConfig() {
  return useContext(AppContext);
}

/** Portal container for overlays (`getPopupContainer`). Always leaves the desktop stacking context. */
export function usePopupContainer(override?: () => HTMLElement) {
  const { getPopupContainer } = useAppConfig();
  return () => (override ?? getPopupContainer)?.() ?? document.body;
}

/** Computed seed knobs under the current App theme (`useToken`). */
export function useToken(): { token: NonlaTokenSnapshot } {
  const { themeRev } = useAppConfig();
  const token = useMemo(() => {
    void themeRev;
    return getDesignToken();
  }, [themeRev]);
  return { token };
}
