import { useLayoutEffect, useSyncExternalStore } from "react";
import { SolarIcon } from "../icon/SolarIcon";
import { cn } from "../lib/cn";
import { getColorPreference, initColorMode, type NonlaColorPreference, setColorPreference, subscribeColorPreference } from "../theme";

const OPTIONS: { value: NonlaColorPreference; label: string; icon: string }[] = [
  { value: "system", label: "System", icon: "monitor-linear" },
  { value: "light", label: "Light", icon: "sun-linear" },
  { value: "dark", label: "Dark", icon: "moon-linear" },
];

export function useColorPreference(): NonlaColorPreference {
  return useSyncExternalStore(subscribeColorPreference, getColorPreference, () => "dark");
}

export type ThemeSwitcherProps = {
  className?: string;
};

/** System, Light, and Dark as three icons. System follows the OS. Remembers the choice. */
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const preference = useColorPreference();

  useLayoutEffect(() => {
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
              "inline-flex size-5 items-center justify-center rounded-full border-0 bg-transparent p-0 cursor-pointer text-foreground/75",
              selected ? "bg-ink-active text-foreground" : "hover:bg-ink-hover hover:text-foreground",
            )}
          >
            <SolarIcon name={option.icon} size={12} />
          </button>
        );
      })}
    </div>
  );
}
