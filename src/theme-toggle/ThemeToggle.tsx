import { useEffect, useSyncExternalStore } from "react";
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

  // Passive effect: runs after `App`'s layout effect has bound the `.nonla-ui` host, so the first
  // init reads and paints the host instead of `<html>`. Outside `App` it falls back to `<html>`.
  useEffect(() => {
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
