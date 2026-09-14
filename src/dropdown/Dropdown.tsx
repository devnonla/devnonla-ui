import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { type CSSProperties, type MouseEvent, type ReactNode, useState } from "react";
import { usePopupContainer } from "../app/context";
import { cn } from "../lib/cn";
import { type PopperPlacement, placementToRadix } from "../lib/placement";
import { menuContentClass, menuGroupClass, menuGroupLabelClass, menuIconClass, menuItemClass } from "./menuClasses";

export type MenuItemType = {
  key?: string;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  type?: "item" | "divider" | "group";
  children?: (MenuItemType | null | undefined)[];
  onClick?: (info?: { key: string }) => void;
  style?: CSSProperties;
  className?: string;
};

export type MenuProps = {
  items?: (MenuItemType | null | undefined)[];
  onClick?: (info: { key: string }) => void;
  style?: CSSProperties;
  className?: string;
};

export type DropdownProps = {
  menu?: MenuProps;
  children: ReactNode;
  trigger?: ("click" | "hover" | "contextMenu")[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopperPlacement;
  className?: string;
  overlayClassName?: string;
  disabled?: boolean;
  /** Alias — accepted, no-op (Radix unmounts when closed). */
  destroyOnHidden?: boolean;
  classNames?: { root?: string; overlay?: string };
};

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="ml-auto opacity-50">
      <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function itemKey(item: MenuItemType, i: number) {
  return item.key ?? (item.type === "divider" ? `divider-${i}` : item.type === "group" ? `group-${i}` : `item-${i}`);
}

function MenuItems({ items, onClick, portal }: { items: (MenuItemType | null | undefined)[]; onClick?: MenuProps["onClick"]; portal?: HTMLElement }) {
  return (
    <>
      {items.map((item, i) => {
        if (!item) return null;
        const key = itemKey(item, i);
        if (item.type === "divider") {
          return <DropdownMenu.Separator key={key} className="my-1 h-px bg-border" />;
        }
        if (item.type === "group") {
          return (
            <DropdownMenu.Group key={key} className={menuGroupClass}>
              {item.label != null && item.label !== "" ? (
                <DropdownMenu.Label className={cn(menuGroupLabelClass, item.className)} style={item.style}>
                  {item.label}
                </DropdownMenu.Label>
              ) : null}
              <MenuItems items={item.children ?? []} onClick={onClick} portal={portal} />
            </DropdownMenu.Group>
          );
        }
        if (item.children?.length) {
          return (
            <DropdownMenu.Sub key={key}>
              <DropdownMenu.SubTrigger disabled={item.disabled} className={cn(menuItemClass, "data-[state=open]:bg-ink-active", item.danger && "text-destructive", item.className)} style={item.style}>
                {item.icon ? <span className={menuIconClass}>{item.icon}</span> : null}
                <span className="min-w-0 flex-1">{item.label}</span>
                <ChevronRight />
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal container={portal}>
                <DropdownMenu.SubContent sideOffset={4} className={cn(menuContentClass, "nonla-popper")}>
                  <MenuItems items={item.children} onClick={onClick} portal={portal} />
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>
          );
        }
        return (
          <DropdownMenu.Item
            key={key}
            disabled={item.disabled}
            className={cn(menuItemClass, item.danger && "text-destructive", item.className)}
            style={item.style}
            onSelect={() => {
              item.onClick?.({ key });
              onClick?.({ key });
            }}
          >
            {item.icon ? <span className={menuIconClass}>{item.icon}</span> : null}
            {item.label}
          </DropdownMenu.Item>
        );
      })}
    </>
  );
}

export function Dropdown({ menu, children, trigger = ["click"], open, onOpenChange, placement = "bottomLeft", className, overlayClassName, disabled }: DropdownProps) {
  const { side, align } = placementToRadix(placement);
  const portal = usePopupContainer()?.();
  const hover = trigger.includes("hover");
  const contextMenu = trigger.includes("contextMenu");
  const click = trigger.includes("click") || (!hover && !contextMenu);
  const [innerOpen, setInnerOpen] = useState(false);
  const isOpen = open ?? innerOpen;
  const setIsOpen = (v: boolean) => {
    if (open === undefined) setInnerOpen(v);
    onOpenChange?.(v);
  };

  const handleContext = (e: MouseEvent) => {
    if (!contextMenu || disabled) return;
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen} modal={!hover}>
      <DropdownMenu.Trigger asChild disabled={disabled} onClick={click || contextMenu ? undefined : (e) => e.preventDefault()} onMouseEnter={hover && !disabled ? () => setIsOpen(true) : undefined} onMouseLeave={hover ? () => setIsOpen(false) : undefined} onContextMenu={handleContext}>
        {children}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal container={portal}>
        <DropdownMenu.Content
          side={side}
          align={align === "center" ? "start" : align}
          sideOffset={4}
          className={cn(menuContentClass, "nonla-popper", className, overlayClassName, menu?.className)}
          style={menu?.style}
          onMouseEnter={hover ? () => setIsOpen(true) : undefined}
          onMouseLeave={hover ? () => setIsOpen(false) : undefined}
        >
          <MenuItems items={menu?.items ?? []} onClick={menu?.onClick} portal={portal} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export type { MenuProps as DropdownMenuProps };
