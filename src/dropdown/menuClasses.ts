import { cn } from "../lib/cn";
import { glassOverlayClass } from "../lib/surface";

export const menuItemClass =
  "nonla-menu-item relative flex cursor-default select-none items-center gap-2 rounded-md border border-solid border-transparent px-2.5 py-1.5 text-sm outline-none data-[disabled]:opacity-40";

export const menuContentClass = cn(glassOverlayClass, "min-w-40 overflow-hidden p-1");

export const menuIconClass = "inline-flex size-4 shrink-0 items-center justify-center [&_img]:size-4 [&_svg]:size-4";
