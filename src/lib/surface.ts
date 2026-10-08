/** Solid panel — window, modal, popover, menu, drawer, toast. */
export const glassSurfaceClass =
  "nonla-glass border border-solid border-border bg-card text-foreground shadow-(--nonla-shadow)";

/** Floating overlay chrome (Popover / Dropdown / Select / pickers / Tooltip). */
export const glassOverlayClass = [
  glassSurfaceClass,
  "nonla-popup-layer nonla-popper z-[var(--nonla-z-popup,1050)] rounded-xl outline-none will-change-[transform,opacity]",
  "[transform-origin:var(--radix-popover-content-transform-origin,var(--radix-dropdown-menu-content-transform-origin,var(--radix-select-content-transform-origin,var(--radix-tooltip-content-transform-origin,center))))]",
  "data-[state=open]:data-[side=top]:animate-[nonla-pop-in-top_var(--nonla-dur-fast)_var(--nonla-ease-out)]",
  "data-[state=open]:data-[side=bottom]:animate-[nonla-pop-in-bottom_var(--nonla-dur-fast)_var(--nonla-ease-out)]",
  "data-[state=open]:data-[side=left]:animate-[nonla-pop-in-left_var(--nonla-dur-fast)_var(--nonla-ease-out)]",
  "data-[state=open]:data-[side=right]:animate-[nonla-pop-in-right_var(--nonla-dur-fast)_var(--nonla-ease-out)]",
  "data-[state=open]:not-data-[side]:animate-[nonla-pop-in-bottom_var(--nonla-dur-fast)_var(--nonla-ease-out)]",
  "data-[state=closed]:animate-[nonla-pop-out_100ms_var(--nonla-ease-in)]",
].join(" ");

/** Meadow menus — same panel as overlays. */
export const meadowSurfaceClass = `rounded-xl ${glassSurfaceClass}`;
