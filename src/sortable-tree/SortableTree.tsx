import {
  type CollisionDetection,
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  type Modifier,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS, type Transform } from "@dnd-kit/utilities";
import { type ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePopupContainer } from "../app/context";
import { cn } from "../lib/cn";

export type SortableTreeItem<T = unknown> = {
  id: string;
  label?: ReactNode;
  disabled?: boolean;
  data?: T;
  children?: SortableTreeItem<T>[];
};

export type SortableTreeProps<T = unknown> = {
  items: SortableTreeItem<T>[];
  /** Next tree after a row lands. A row only swaps with siblings; children stay on their parent. */
  onChange?: (items: SortableTreeItem<T>[]) => void;
  renderItem?: (item: SortableTreeItem<T>) => ReactNode;
  className?: string;
};

const DROP_ANIMATION = { duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" };

/** Keep the floating preview inside the window. Uses the source rect so the overlay is not clamped twice. */
const clampOverlayToWindow: Modifier = ({ transform, activeNodeRect, windowRect }) => {
  if (!activeNodeRect || !windowRect) return transform;
  const next = { ...transform };
  const left = activeNodeRect.left + transform.x;
  const top = activeNodeRect.top + transform.y;
  const maxLeft = windowRect.left + windowRect.width - activeNodeRect.width;
  const maxTop = windowRect.top + windowRect.height - activeNodeRect.height;
  if (left < windowRect.left) next.x = windowRect.left - activeNodeRect.left;
  else if (left > maxLeft) next.x = maxLeft - activeNodeRect.left;
  if (top < windowRect.top) next.y = windowRect.top - activeNodeRect.top;
  else if (top > maxTop) next.y = maxTop - activeNodeRect.top;
  return next;
};

function parentIdOf(data: { parentId?: unknown } | undefined): string | null {
  return typeof data?.parentId === "string" ? data.parentId : null;
}

/** Same-parent rows only, so a child drag never picks up the group and a group drag ignores nested rows. */
const siblingCollision: CollisionDetection = (args) => {
  const parentId = parentIdOf(args.active.data.current);
  const siblings = args.droppableContainers.filter((container) => parentIdOf(container.data.current) === parentId);
  const scoped = { ...args, droppableContainers: siblings };
  const inside = pointerWithin(scoped);
  return inside.length > 0 ? inside : closestCenter(scoped);
};

function findItem<T>(items: SortableTreeItem<T>[], id: string): SortableTreeItem<T> | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children?.length) {
      const found = findItem(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

function reorderSiblings<T>(items: SortableTreeItem<T>[], parentId: string | null, activeId: string, overId: string): SortableTreeItem<T>[] {
  if (parentId == null) {
    const oldIndex = items.findIndex((item) => item.id === activeId);
    const newIndex = items.findIndex((item) => item.id === overId);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return items;
    return arrayMove(items, oldIndex, newIndex);
  }

  let changed = false;
  const next = items.map((item) => {
    if (item.id === parentId) {
      const children = item.children ?? [];
      const oldIndex = children.findIndex((child) => child.id === activeId);
      const newIndex = children.findIndex((child) => child.id === overId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return item;
      changed = true;
      return { ...item, children: arrayMove(children, oldIndex, newIndex) };
    }
    if (!item.children?.length) return item;
    const children = reorderSiblings(item.children, parentId, activeId, overId);
    if (children === item.children) return item;
    changed = true;
    return { ...item, children };
  });
  return changed ? next : items;
}

/** Drop the horizontal delta. A sideways drag must not widen the list. */
function verticalShift(transform: Transform | null): string | undefined {
  if (!transform) return undefined;
  return CSS.Translate.toString({ ...transform, x: 0 });
}

function Grip() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="pointer-events-none shrink-0 text-quaternary-foreground">
      <circle cx="4.5" cy="2.5" r="1" fill="currentColor" />
      <circle cx="9.5" cy="2.5" r="1" fill="currentColor" />
      <circle cx="4.5" cy="7" r="1" fill="currentColor" />
      <circle cx="9.5" cy="7" r="1" fill="currentColor" />
      <circle cx="4.5" cy="11.5" r="1" fill="currentColor" />
      <circle cx="9.5" cy="11.5" r="1" fill="currentColor" />
    </svg>
  );
}

function RowLabel<T>({ item, renderItem }: { item: SortableTreeItem<T>; renderItem?: SortableTreeProps<T>["renderItem"] }) {
  return <span className="min-w-0 flex-1 truncate">{renderItem ? renderItem(item) : (item.label ?? item.id)}</span>;
}

function RowFace<T>({
  item,
  renderItem,
  disabled,
  activator,
}: {
  item: SortableTreeItem<T>;
  renderItem?: SortableTreeProps<T>["renderItem"];
  disabled?: boolean;
  activator?: {
    setRef: (element: HTMLElement | null) => void;
    props: Record<string, unknown>;
  };
}) {
  return (
    <div
      ref={activator?.setRef}
      className={cn(
        "flex min-h-8 min-w-0 items-center gap-1.5 rounded-md px-1.5 text-sm text-foreground",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-grab touch-none hover:bg-ink-hover active:cursor-grabbing",
      )}
      {...(disabled ? undefined : activator?.props)}
    >
      <Grip />
      <RowLabel item={item} renderItem={renderItem} />
    </div>
  );
}

function OverlayBranch<T>({ item, renderItem }: { item: SortableTreeItem<T>; renderItem?: SortableTreeProps<T>["renderItem"] }) {
  return (
    <div className="min-w-0">
      <div className="flex min-h-8 min-w-0 items-center gap-1.5 px-1.5 text-sm text-foreground">
        <Grip />
        <RowLabel item={item} renderItem={renderItem} />
      </div>
      {item.children?.length ? (
        <div className="min-w-0 ps-4">
          {item.children.map((child) => (
            <OverlayBranch key={child.id} item={child} renderItem={renderItem} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SortableNode<T>({ item, parentId, renderItem }: { item: SortableTreeItem<T>; parentId: string | null; renderItem?: SortableTreeProps<T>["renderItem"] }) {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { parentId },
    disabled: item.disabled ? { draggable: true } : false,
  });

  return (
    <div
      ref={setNodeRef}
      data-placeholder={isDragging ? "true" : undefined}
      className={cn("relative min-w-0 max-w-full", isDragging && "rounded-md bg-muted shadow-[inset_0_0_0_1px_var(--nonla-border)]")}
      style={{
        transform: verticalShift(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      <div className={cn("min-w-0", isDragging && "invisible")}>
        <RowFace
          item={item}
          renderItem={renderItem}
          disabled={item.disabled}
          activator={
            item.disabled
              ? undefined
              : {
                  setRef: setActivatorNodeRef,
                  props: { ...attributes, ...listeners },
                }
          }
        />
        {item.children?.length ? (
          <div className="min-w-0 ps-4">
            <SortableLevel items={item.children} parentId={item.id} renderItem={renderItem} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SortableLevel<T>({ items, parentId, renderItem }: { items: SortableTreeItem<T>[]; parentId: string | null; renderItem?: SortableTreeProps<T>["renderItem"] }) {
  return (
    <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
      <div className="flex min-w-0 flex-col gap-0.5">
        {items.map((item) => (
          <SortableNode key={item.id} item={item} parentId={parentId} renderItem={renderItem} />
        ))}
      </div>
    </SortableContext>
  );
}

export function SortableTree<T = unknown>({ items, onChange, renderItem, className }: SortableTreeProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  const itemsRef = useRef(items);
  onChangeRef.current = onChange;
  itemsRef.current = items;
  const portal = usePopupContainer();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const parentId = parentIdOf(active.data.current);
    if (parentId !== parentIdOf(over.data.current)) return;
    const next = reorderSiblings(itemsRef.current, parentId, String(active.id), String(over.id));
    if (next !== itemsRef.current) onChangeRef.current?.(next);
  };

  const onDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = activeId ? findItem(items, activeId) : null;
  const portalNode = typeof document === "undefined" ? null : portal();

  return (
    <div className={cn("w-full min-w-0 max-w-full overscroll-x-none", className)} style={{ overflowX: "clip" }}>
      <DndContext sensors={sensors} collisionDetection={siblingCollision} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
        <SortableLevel items={items} parentId={null} renderItem={renderItem} />
        {portalNode
          ? createPortal(
              <DragOverlay
                zIndex={1050}
                dropAnimation={DROP_ANIMATION}
                modifiers={[clampOverlayToWindow]}
                className="pointer-events-none overflow-hidden rounded-md bg-card shadow-(--nonla-card-shadow)"
              >
                {activeItem ? (
                  <div data-sortable-overlay="">
                    <OverlayBranch item={activeItem} renderItem={renderItem} />
                  </div>
                ) : null}
              </DragOverlay>,
              portalNode,
            )
          : null}
      </DndContext>
    </div>
  );
}
