import { useEffect, useSyncExternalStore } from "react";
import { Icon, type IconName } from "../icon/Icon";
import { cn } from "../lib/cn";
import { getColorPreference, initColorMode, type NonlaColorPreference, setColorPreference, subscribeColorPreference } from "../theme";

const OPTIONS: { value: NonlaColorPreference; label: string; icon: IconName }[] = [
  { value: "system", label: "System", icon: "monitor" },
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
];

export function useColorPreference(): NonlaColorPreference {
  return useSyncExternalStore(subscribeColorPreference, getColorPreference, () => "system");
}

export type ThemeSwitcherProps = {
  className?: string;
};

/** System, Light, and Dark as three icons. System follows the OS. Remembers the choice. */
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const preference = useColorPreference();

  // Passive effect: runs after `App`'s layout effect has bound the `.nonla-ui` host, so the first
  // init reads and paints the host instead of `<html>`. Outside `App` it falls back to `<html>`.
  useEffect(() => {
    initColorMode();
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("inline-flex h-6 items-center gap-px rounded-full border border-solid border-border bg-background p-px", className)}
    >
      {OPTIONS.map((option) => {
        const selected = option.value === preference;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            onClick={() => setColorPreference(option.value)}
            className={cn(
              "inline-flex size-5 items-center justify-center rounded-full border-0 bg-transparent p-0 cursor-pointer text-muted-foreground",
              selected ? "bg-ink-active text-foreground" : "hover:bg-ink-hover hover:text-foreground",
            )}
          >
            <Icon name={option.icon} size={12} />
          </button>
        );
      })}
    </div>
  );
}
