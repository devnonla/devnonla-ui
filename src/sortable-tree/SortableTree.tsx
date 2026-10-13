import {
  type Collision,
  type CollisionDetection,
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
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

/** A row that needs a new position. `index` is the new index in the list it landed in. */
export type SortableTreeChange = {
  id: string;
  index: number;
};

export type SortableTreeProps<T = unknown> = {
  items: SortableTreeItem<T>[];
  /** Next tree after a drop that changed order. */
  onChange?: (items: SortableTreeItem<T>[]) => void;
  /** Rows whose index changed. Rows that stayed put are omitted. */
  onDragEnd?: (updates: SortableTreeChange[]) => void;
  renderItem?: (item: SortableTreeItem<T>) => ReactNode;
  className?: string;
};

const DROP_ANIMATION = { duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" };

type OverlayOrigin = { key: string; left: number; top: number; width: number; height: number };

/**
 * The overlay is `position: fixed` at the rect from drag start, then translated.
 * `activeNodeRect` keeps moving as the list scrolls, so clamping against it
 * walks the preview off the pointer. Lock the origin for the whole drag.
 */
let overlayOrigin: OverlayOrigin | null = null;

const clampOverlayToWindow: Modifier = ({ transform, active, activeNodeRect, windowRect }) => {
  if (!active) {
    overlayOrigin = null;
    return transform;
  }
  if (!activeNodeRect || !windowRect) return transform;
  const key = String(active.id);
  if (!overlayOrigin || overlayOrigin.key !== key) {
    overlayOrigin = { key, left: activeNodeRect.left, top: activeNodeRect.top, width: activeNodeRect.width, height: activeNodeRect.height };
  }
  const next = { ...transform };
  const left = overlayOrigin.left + transform.x;
  const top = overlayOrigin.top + transform.y;
  const maxLeft = windowRect.left + windowRect.width - overlayOrigin.width;
  const maxTop = windowRect.top + windowRect.height - overlayOrigin.height;
  if (left < windowRect.left) next.x = windowRect.left - overlayOrigin.left;
  else if (left > maxLeft) next.x = maxLeft - overlayOrigin.left;
  if (top < windowRect.top) next.y = windowRect.top - overlayOrigin.top;
  else if (top > maxTop) next.y = maxTop - overlayOrigin.top;
  return next;
};

function parentIdOf(data: { parentId?: unknown } | undefined): string | null {
  return typeof data?.parentId === "string" ? data.parentId : null;
}

type FlatRow = { id: string; parentId: string | null; depth: number };

type DropHint = { overId: string; edge: "top" | "bottom" };

type Placement = { parentId: string | null; index: number; lineId: string; edge: "top" | "bottom" } | "reorder" | null;

function flatten<T>(items: SortableTreeItem<T>[], parentId: string | null = null, depth = 0, rows: FlatRow[] = []): FlatRow[] {
  for (const item of items) {
    rows.push({ id: item.id, parentId, depth });
    if (item.children?.length) flatten(item.children, item.id, depth + 1, rows);
  }
  return rows;
}

function faceRect(root: HTMLElement | null, id: string): DOMRect | null {
  const cssEscape = globalThis.CSS?.escape;
  if (!root || typeof cssEscape !== "function") return null;
  const node = root.querySelector(`[data-tree-face="${cssEscape(id)}"]`);
  return node instanceof HTMLElement ? node.getBoundingClientRect() : null;
}

/** Only the last few pixels of a trailing child belong to the next parent. The rest of the row stays with that child. */
const PARENT_SEAM = 6;

function gapTarget<T>(items: SortableTreeItem<T>[], hitId: string, pointerY: number | null, root: HTMLElement | null, blocked: Set<string>): string {
  if (pointerY == null) return hitId;
  const flat = flatten(items);
  const start = flat.findIndex((row) => row.id === hitId);
  if (start < 0) return hitId;
  const hit = flat[start];
  let scan = start + 1;
  for (; scan < flat.length; scan += 1) {
    const row = flat[scan];
    if (row.depth < hit.depth) break;
    if (row.depth === hit.depth && row.parentId === hit.parentId) return hitId;
  }
  const following = flat[scan];
  if (!following || following.depth >= hit.depth || blocked.has(following.id)) return hitId;
  const rect = faceRect(root, hitId);
  if (!rect || pointerY < rect.bottom - PARENT_SEAM) return hitId;
  return following.id;
}

/** Distance from the pointer. `closestCenter` measures the overlay rect, which already includes the drag delta, so it drifts off the cursor. */
function closestToPointer(containers: Parameters<CollisionDetection>[0]["droppableContainers"], rects: Parameters<CollisionDetection>[0]["droppableRects"], pointer: { x: number; y: number }): Collision | undefined {
  let best: Collision | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const container of containers) {
    const rect = rects.get(container.id);
    if (!rect) continue;
    const dx = rect.left + rect.width / 2 - pointer.x;
    const dy = rect.top + rect.height / 2 - pointer.y;
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = { id: container.id };
    }
  }
  return best;
}

function smallestHit(hits: Collision[], rects: Parameters<CollisionDetection>[0]["droppableRects"]): Collision {
  let best = hits[0];
  let bestArea = Number.POSITIVE_INFINITY;
  for (const hit of hits) {
    const rect = rects.get(hit.id);
    const area = rect ? rect.width * rect.height : Number.POSITIVE_INFINITY;
    if (area < bestArea) {
      best = hit;
      bestArea = area;
    }
  }
  return best;
}

function isAncestor<T>(items: SortableTreeItem<T>[], activeId: string, hitId: string): boolean {
  const byId = new Map(flatten(items).map((row) => [row.id, row]));
  let current = byId.get(activeId);
  while (current?.parentId) {
    if (current.parentId === hitId) return true;
    current = byId.get(current.parentId);
  }
  return false;
}

function pointerInside(rect: { left: number; right: number; top: number; bottom: number } | null | undefined, pointer: { x: number; y: number } | null): boolean {
  if (!rect || !pointer) return false;
  return pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom;
}

function collideTree<T>(args: Parameters<CollisionDetection>[0], items: SortableTreeItem<T>[], blocked: Set<string>, root: HTMLElement | null): Collision[] {
  const pointer = args.pointerCoordinates;
  const activeRect = args.droppableRects.get(args.active.id);
  if (pointerInside(activeRect, pointer)) return [{ id: args.active.id }];

  const containers = args.droppableContainers.filter((container) => !blocked.has(String(container.id)));
  const scoped = { ...args, droppableContainers: containers };
  const inside = pointerWithin(scoped);
  let hit = inside.length > 0 ? smallestHit(inside, args.droppableRects) : pointer ? closestToPointer(containers, args.droppableRects, pointer) : closestCenter(scoped)[0];
  if (!hit) return [];

  const activeId = String(args.active.id);
  if (isAncestor(items, activeId, String(hit.id)) && !pointerInside(faceRect(root, String(hit.id)), pointer)) {
    const parentId = parentIdOf(args.active.data.current);
    const siblings = containers.filter((container) => parentIdOf(container.data.current) === parentId);
    const siblingHit = pointer ? closestToPointer(siblings, args.droppableRects, pointer) : closestCenter({ ...scoped, droppableContainers: siblings })[0];
    if (siblingHit) hit = siblingHit;
  }

  const nextId = gapTarget(items, String(hit.id), pointer?.y ?? null, root, blocked);
  if (nextId === String(hit.id)) return [hit];
  const redirected = containers.find((container) => String(container.id) === nextId);
  return redirected ? [{ id: redirected.id }] : [hit];
}

function findLocation<T>(items: SortableTreeItem<T>[], id: string, parentId: string | null = null): { parentId: string | null; index: number; node: SortableTreeItem<T> } | null {
  for (let index = 0; index < items.length; index += 1) {
    const node = items[index];
    if (node.id === id) return { parentId, index, node };
    if (node.children?.length) {
      const found = findLocation(node.children, id, node.id);
      if (found) return found;
    }
  }
  return null;
}

function contains<T>(item: SortableTreeItem<T>, id: string): boolean {
  if (item.id === id) return true;
  for (const child of item.children ?? []) {
    if (contains(child, id)) return true;
  }
  return false;
}

function removeNode<T>(items: SortableTreeItem<T>[], id: string): { items: SortableTreeItem<T>[]; node: SortableTreeItem<T> | null } {
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (item.id === id) return { items: items.filter((entry) => entry.id !== id), node: item };
    if (item.children?.length) {
      const child = removeNode(item.children, id);
      if (child.node) {
        const next = items.slice();
        next[index] = { ...item, children: child.items.length > 0 ? child.items : undefined };
        return { items: next, node: child.node };
      }
    }
  }
  return { items, node: null };
}

function insertNode<T>(items: SortableTreeItem<T>[], parentId: string | null, index: number, node: SortableTreeItem<T>): SortableTreeItem<T>[] {
  if (parentId == null) {
    const next = items.slice();
    next.splice(Math.max(0, Math.min(index, next.length)), 0, node);
    return next;
  }
  let changed = false;
  const next = items.map((item) => {
    if (item.id === parentId) {
      changed = true;
      const children = (item.children ?? []).slice();
      children.splice(Math.max(0, Math.min(index, children.length)), 0, node);
      return { ...item, children };
    }
    if (!item.children?.length) return item;
    const children = insertNode(item.children, parentId, index, node);
    if (children === item.children) return item;
    changed = true;
    return { ...item, children };
  });
  return changed ? next : items;
}

function relocate<T>(items: SortableTreeItem<T>[], activeId: string, parentId: string | null, index: number): SortableTreeItem<T>[] {
  const from = findLocation(items, activeId);
  if (!from) return items;
  if (parentId != null && (parentId === activeId || contains(from.node, parentId))) return items;
  let target = index;
  if (from.parentId === parentId && from.index < target) target -= 1;
  if (from.parentId === parentId && from.index === target) return items;
  const removed = removeNode(items, activeId);
  if (!removed.node) return items;
  return insertNode(removed.items, parentId, target, removed.node);
}

function pointerY(event: DragMoveEvent | DragEndEvent): number | null {
  const source = event.activatorEvent;
  if (!(source instanceof MouseEvent)) return null;
  return source.clientY + event.delta.y;
}

function rowEdge(root: HTMLElement | null, overId: string, clientY: number | null): "top" | "bottom" {
  if (clientY == null) return "top";
  const rect = faceRect(root, overId);
  if (!rect) return "top";
  return clientY < rect.top + rect.height / 2 ? "top" : "bottom";
}

/** Where a dragged row will land. A shallower row means "just in front of this parent". */
function placement<T>(items: SortableTreeItem<T>[], activeId: string, overId: string, activeParent: string | null, overParent: string | null, activeDepth: number, overDepth: number, edge: "top" | "bottom"): Placement {
  if (activeId === overId) return null;
  if (activeParent === overParent) return "reorder";
  const activeLoc = findLocation(items, activeId);
  const overLoc = findLocation(items, overId);
  if (!activeLoc || !overLoc) return null;

  let parentId = overLoc.parentId;
  let index = edge === "top" ? overLoc.index : overLoc.index + 1;
  let line: "top" | "bottom" = edge;
  if (overDepth < activeDepth) {
    if (edge === "bottom" && !overLoc.node.children?.length) {
      parentId = overId;
      index = 0;
      line = "bottom";
    } else {
      index = overLoc.index;
      line = "top";
    }
  }
  if (parentId != null && (parentId === activeId || contains(activeLoc.node, parentId))) return null;
  return { parentId, index, lineId: overId, edge: line };
}

function describe<T>(items: SortableTreeItem<T>[], id: string): { parentId: string | null; depth: number } | null {
  const row = flatten(items).find((entry) => entry.id === id);
  return row ? { parentId: row.parentId, depth: row.depth } : null;
}

function descendantIds<T>(item: SortableTreeItem<T>): string[] {
  const ids: string[] = [];
  for (const child of item.children ?? []) {
    ids.push(child.id);
    ids.push(...descendantIds(child));
  }
  return ids;
}

function siblingIds<T>(items: SortableTreeItem<T>[], parentId: string | null): string[] {
  if (parentId == null) return items.map((item) => item.id);
  return (findItem(items, parentId)?.children ?? []).map((item) => item.id);
}

function changedIndexes(before: string[], after: string[]): { id: string; index: number }[] {
  const previous = new Map(before.map((id, index) => [id, index]));
  const updates: { id: string; index: number }[] = [];
  after.forEach((id, index) => {
    if (previous.get(id) !== index) updates.push({ id, index });
  });
  return updates;
}

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
      data-tree-face={item.id}
      className={cn(
        "flex min-h-8 min-w-0 items-center rounded-md px-1.5 text-sm text-foreground",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-grab touch-none hover:bg-ink-hover active:cursor-grabbing",
      )}
      {...(disabled ? undefined : activator?.props)}
    >
      <RowLabel item={item} renderItem={renderItem} />
    </div>
  );
}

function OverlayBranch<T>({ item, renderItem }: { item: SortableTreeItem<T>; renderItem?: SortableTreeProps<T>["renderItem"] }) {
  return (
    <div className="min-w-0">
      <div className="flex min-h-8 min-w-0 items-center px-1.5 text-sm text-foreground">
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

/** Insertion edge, painted above the drag preview so the ghost cannot hide it. */
function FloatingDropLine({ root, hint }: { root: HTMLElement | null; hint: DropHint }) {
  const rect = faceRect(root, hint.overId);
  if (!rect) return null;
  const top = hint.edge === "top" ? rect.top : rect.bottom;
  return <span aria-hidden className="pointer-events-none fixed z-1100 h-0.5 rounded-full bg-foreground" style={{ top: top - 1, left: rect.left + 6, width: Math.max(0, rect.width - 12) }} />;
}

function SortableNode<T>({
  item,
  parentId,
  depth,
  renderItem,
  sorting,
}: {
  item: SortableTreeItem<T>;
  parentId: string | null;
  depth: number;
  renderItem?: SortableTreeProps<T>["renderItem"];
  sorting: boolean;
}) {
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
        transition: sorting ? undefined : transition,
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
            <SortableLevel items={item.children} parentId={item.id} depth={depth + 1} renderItem={renderItem} sorting={sorting} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SortableLevel<T>({
  items,
  parentId,
  depth,
  renderItem,
  sorting,
}: {
  items: SortableTreeItem<T>[];
  parentId: string | null;
  depth: number;
  renderItem?: SortableTreeProps<T>["renderItem"];
  sorting: boolean;
}) {
  return (
    <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
      <div className="flex min-w-0 flex-col gap-0.5">
        {items.map((item) => (
          <SortableNode key={item.id} item={item} parentId={parentId} depth={depth} renderItem={renderItem} sorting={sorting} />
        ))}
      </div>
    </SortableContext>
  );
}

export function SortableTree<T = unknown>({ items, onChange, onDragEnd, renderItem, className }: SortableTreeProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hint, setHint] = useState<DropHint | null>(null);
  const hintRef = useRef<DropHint | null>(null);
  const overRef = useRef<string | null>(null);
  const blockedRef = useRef<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const onChangeRef = useRef(onChange);
  const onDragEndRef = useRef(onDragEnd);
  const itemsRef = useRef(items);
  onChangeRef.current = onChange;
  onDragEndRef.current = onDragEnd;
  itemsRef.current = items;
  const portal = usePopupContainer();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const collisionDetection: CollisionDetection = (args) => {
    if (args.pointerCoordinates) pointerRef.current = args.pointerCoordinates;
    return collideTree(args, itemsRef.current, blockedRef.current, rootRef.current);
  };

  const cursorY = (event: DragMoveEvent | DragEndEvent) => pointerRef.current?.y ?? pointerY(event);

  const assignHint = (next: DropHint | null) => {
    const prev = hintRef.current;
    if (prev?.overId === next?.overId && prev?.edge === next?.edge) return;
    hintRef.current = next;
    setHint(next);
  };

  const placeFor = (activeId: string, overId: string | null, clientY: number | null) => {
    if (!overId) return null;
    const active = describe(itemsRef.current, activeId);
    const over = describe(itemsRef.current, overId);
    if (!active || !over) return null;
    return placement(itemsRef.current, activeId, overId, active.parentId, over.parentId, active.depth, over.depth, rowEdge(rootRef.current, overId, clientY));
  };

  const showPlace = (activeId: string, overId: string | null, clientY: number | null) => {
    const place = placeFor(activeId, overId, clientY);
    assignHint(place && place !== "reorder" ? { overId: place.lineId, edge: place.edge } : null);
    return place;
  };

  const onDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    overlayOrigin = null;
    pointerRef.current = null;
    setActiveId(id);
    overRef.current = null;
    const node = findItem(itemsRef.current, id);
    blockedRef.current = new Set(node ? [id, ...descendantIds(node)] : [id]);
  };

  const onDragOver = (event: DragMoveEvent) => {
    const id = event.over ? String(event.over.id) : null;
    overRef.current = id;
    showPlace(String(event.active.id), id, cursorY(event));
  };

  const onDragMove = (event: DragMoveEvent) => {
    const id = event.over ? String(event.over.id) : overRef.current;
    if (!id) return;
    if (event.over) overRef.current = id;
    showPlace(String(event.active.id), id, cursorY(event));
  };

  const stopDrag = () => {
    setActiveId(null);
    overRef.current = null;
    blockedRef.current = new Set();
    pointerRef.current = null;
    assignHint(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeDragId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : overRef.current;
    const place = placeFor(activeDragId, overId, cursorY(event));
    stopDrag();
    if (!place || !overId) return;
    const current = itemsRef.current;
    const parentId = place === "reorder" ? parentIdOf(event.active.data.current) : place.parentId;
    const next = place === "reorder" ? reorderSiblings(current, parentId, activeDragId, overId) : relocate(current, activeDragId, place.parentId, place.index);
    const updates = changedIndexes(siblingIds(current, parentId), siblingIds(next, parentId));
    if (updates.length === 0) return;
    onChangeRef.current?.(next);
    onDragEndRef.current?.(updates);
  };

  const onDragCancel = () => {
    stopDrag();
  };

  const activeItem = activeId ? findItem(items, activeId) : null;
  const portalNode = typeof document === "undefined" ? null : portal();

  return (
    <div ref={rootRef} className={cn("w-full min-w-0 max-w-full overscroll-x-none", className)} style={{ overflowX: "clip" }}>
      <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={onDragStart} onDragOver={onDragOver} onDragMove={onDragMove} onDragEnd={handleDragEnd} onDragCancel={onDragCancel}>
        <SortableLevel items={items} parentId={null} depth={0} renderItem={renderItem} sorting={activeId != null} />
        {portalNode
          ? createPortal(
              <>
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
                </DragOverlay>
                {hint ? <FloatingDropLine root={rootRef.current} hint={hint} /> : null}
              </>,
              portalNode,
            )
          : null}
      </DndContext>
    </div>
  );
}
