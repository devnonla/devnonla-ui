import { createContext, useContext } from "react";
import type { CanonicalSize } from "../lib/sizes";

export type NonlaAppConfig = {
  getPopupContainer?: () => HTMLElement;
  componentSize?: CanonicalSize;
};

export const AppContext = createContext<NonlaAppConfig>({});

export function useAppConfig() {
  return useContext(AppContext);
}

/** Portal container for overlays (`getPopupContainer`). Defaults to the `App` `.nonla-ui` host, then `document.body`. */
export function usePopupContainer(override?: () => HTMLElement) {
  const { getPopupContainer } = useAppConfig();
  return () => (override ?? getPopupContainer)?.() ?? document.body;
}
