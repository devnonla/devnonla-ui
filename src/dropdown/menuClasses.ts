import { cn } from "../lib/cn";
import { glassOverlayClass } from "../lib/surface";

export const menuItemClass =
  "nonla-menu-item relative flex cursor-default select-none items-center gap-2 rounded-lg border border-solid border-transparent px-2.5 py-1 text-sm leading-5 outline-none data-[disabled]:opacity-40";

export const menuContentClass = cn(glassOverlayClass, "min-w-40 overflow-hidden p-1");

export const menuIconClass = "inline-flex size-4 shrink-0 items-center justify-center [&_img]:size-4 [&_svg]:size-4";

export const menuGroupClass = "not-first:pt-2.5";

export const menuGroupLabelClass = "px-2.5 pb-1 pt-1 text-xs font-medium leading-4 text-tertiary-foreground";
