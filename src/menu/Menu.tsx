import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FluentIcon } from "../icon/FluentIcon";
import { cn } from "../lib/cn";
import type { PopperPlacement } from "../lib/placement";
import { Popover } from "../popover/Popover";

export type MenuRootProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  placement?: PopperPlacement;
};

export function Menu({ open, onOpenChange, trigger, children, contentClassName, placement = "bottomLeft" }: MenuRootProps) {
  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      trigger="click"
      placement={placement}
      contentClassName={cn("w-55 p-1", contentClassName)}
      content={<div className="flex flex-col gap-px">{children}</div>}
    >
      {trigger}
    </Popover>
  );
}

export type MenuTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  open?: boolean;
};

export function MenuTrigger({ active, open, className, children, ...rest }: MenuTriggerProps) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-7 max-w-44 items-center gap-0.5 rounded-md border-0 bg-transparent px-2.5 text-sm font-medium leading-5 cursor-pointer",
        active || open ? "bg-ink-active text-foreground" : "text-foreground/85 hover:bg-ink-hover hover:text-foreground",
        className,
      )}
      {...rest}
    >
      <span className="min-w-0 truncate leading-5">{children}</span>
      <FluentIcon name="arrow-square-down-24" size={12} className={cn("shrink-0 transition-transform duration-150", open && "rotate-180")} />
    </button>
  );
}

export type MenuItemProps = {
  icon?: ReactNode;
  label: ReactNode;
  extra?: ReactNode;
  selected?: boolean;
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function MenuItem({ icon, label, extra, selected, action, onClick, className }: MenuItemProps) {
  return (
    <div className={cn("group relative flex min-h-8 items-center rounded-md", selected ? "bg-ink-active" : "hover:bg-ink-hover", className)}>
      <button
        type="button"
        aria-current={selected ? "true" : undefined}
        onClick={onClick}
        className={cn(
          "flex min-h-8 w-full items-center gap-2 rounded-md border-0 bg-transparent px-2.5 text-left text-sm cursor-pointer",
          selected ? "font-medium text-foreground" : "font-normal text-foreground",
        )}
      >
        {icon ? <span className="inline-flex size-4 shrink-0 items-center justify-center [&_img]:size-4">{icon}</span> : null}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {extra != null ? <span className={cn("shrink-0 text-xs tabular-nums text-muted-foreground", action && "group-hover:invisible")}>{extra}</span> : null}
      </button>
      {action ? <div className="absolute right-1 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100">{action}</div> : null}
    </div>
  );
}

export function MenuAction({ className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={cn("flex size-6 items-center justify-center rounded-md border-0 bg-transparent p-0 cursor-pointer hover:bg-ink-active", className)} {...rest} />;
}

export function MenuDivider({ className }: { className?: string }) {
  return <div className={cn("mx-2.5 my-1 h-px bg-ink-line", className)} />;
}

Menu.Trigger = MenuTrigger;
Menu.Item = MenuItem;
Menu.Action = MenuAction;
Menu.Divider = MenuDivider;
