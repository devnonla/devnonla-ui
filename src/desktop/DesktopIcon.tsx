import { forwardRef, type ReactNode } from "react";
import { Icon } from "../icon/Icon";

const iconButtonClass =
  "group w-[96px] flex flex-col items-center gap-0.5 py-2 px-0 rounded-md border-none cursor-pointer select-none outline-none bg-transparent focus-visible:outline-2 focus-visible:outline-brand motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]";

const labelClass = "text-xs leading-[18px] font-semibold text-center line-clamp-2 w-full";

export const DesktopIcon = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    media?: ReactNode;
    active?: boolean;
    onCard?: boolean;
    onClick?: () => void;
  }
>(function DesktopIcon({ label, media, active = false, onCard = false, onClick }, ref) {
  return (
    <button ref={ref} type="button" title={label} aria-label={label} aria-current={active ? "true" : undefined} dir="ltr" onClick={onClick} className={iconButtonClass}>
      {media ?? <Icon name="stars" size={32} />}
      <span className={`${labelClass} ${onCard ? "text-foreground" : "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]"}`}>{label}</span>
    </button>
  );
});
