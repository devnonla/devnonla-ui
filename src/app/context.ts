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

/**
 * Portal container for overlays (`getPopupContainer`). Defaults to the `App` `.nonla-ui` host, then `document.body`.
 * Returns `undefined` on the server (no `document`), so overlays can render during SSR; Radix portals mount on the client.
 */
export function usePopupContainer(override?: () => HTMLElement) {
  const { getPopupContainer } = useAppConfig();
  return (): HTMLElement | undefined => {
    if (typeof document === "undefined") return undefined;
    return (override ?? getPopupContainer)?.() ?? document.body;
  };
}
