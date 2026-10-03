import { useLayoutEffect, useSyncExternalStore } from "react";
import { Segmented } from "../segmented/Segmented";
import { getColorMode, initColorMode, type NonlaColorMode, setColorMode, subscribeColorMode } from "../theme";

export function useColorMode(): NonlaColorMode {
  return useSyncExternalStore(subscribeColorMode, getColorMode, () => "dark");
}

export type ThemeToggleProps = {
  className?: string;
};

/** Light and Dark, both always visible. Remembers the choice. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const mode = useColorMode();

  useLayoutEffect(() => {
    initColorMode();
  }, []);

  return (
    <Segmented
      size="small"
      className={className}
      value={mode}
      onChange={setColorMode}
      options={[
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ]}
    />
  );
}
