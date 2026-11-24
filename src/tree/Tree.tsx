import { type KeyboardEvent, type ReactNode, useMemo, useRef, useState } from "react";
import { Icon, isIconName } from "../icon/Icon";
import { cn } from "../lib/cn";

export type TreeNode = {
  key: string;
  title: ReactNode;
  /** An `Icon` name, or a node. */
  icon?: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  /** `false` makes the row open and close (and fire `onExpand`) even without `children`, for lazy loading. */
  isLeaf?: boolean;
};

export type TreeSelectInfo = { node: TreeNode; selected: boolean };
export type TreeExpandInfo = { node: TreeNode; expanded: boolean };

export type TreeProps = {
  treeData: TreeNode[];
  /** Draw guide lines from each parent to its children. Default `true`. */
  showLine?: boolean;
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  /** Open every parent on first render (uncontrolled only). */
  defaultExpandAll?: boolean;
  onExpand?: (keys: string[], info: TreeExpandInfo) => void;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelect?: (keys: string[], info: TreeSelectInfo) => void;
  /** Allow picking rows. Default `true`. */
  selectable?: boolean;
  /** Pick several rows (click toggles). Default `false`. */
  multiple?: boolean;
  /** Custom row content. Defaults to `title`. */
  titleRender?: (node: TreeNode) => ReactNode;
  /** Row height and indent: `small` 24px, `default` 32px, `large` 40px (the control sizes). */
  size?: "small" | "default" | "large";
  className?: string;
  "aria-label"?: string;
};

/**
 * Row height, indent (one level's width) and icon slot per size. Guide lines run down the middle of the
 * parent's icon slot; the indent is wider than the slot, and that extra width is the length of each elbow.
 */
const SIZES = {
  small: { height: 24, indent: 24, slot: 20 },
  default: { height: 32, indent: 28, slot: 24 },
  large: { height: 40, indent: 28, slot: 24 },
} as const;
const ELBOW_RADIUS = 5;

type Row = {
  node: TreeNode;
  depth: number;
  last: boolean;
  /** Per ancestor column: does that branch continue below this row? */
  rails: boolean[];
  parentKey: string | null;
  hasChildren: boolean;
};

function collectParents(nodes: TreeNode[], out: string[] = []) {
  for (const n of nodes) {
    if (n.children?.length) {
      out.push(n.key);
      collectParents(n.children, out);
    }
  }
  return out;
}

function flatten(nodes: TreeNode[], open: Set<string>, depth = 0, rails: boolean[] = [], parentKey: string | null = null, out: Row[] = []) {
  nodes.forEach((node, i) => {
    const last = i === nodes.length - 1;
    const hasChildren = Boolean(node.children?.length) || node.isLeaf === false;
    out.push({ node, depth, last, rails, parentKey, hasChildren });
    if (node.children?.length && open.has(node.key)) flatten(node.children, open, depth + 1, [...rails, !last], node.key, out);
  });
  return out;
}

/**
 * The row's hover / selected box is inset this much top and bottom. Guide lines stay outside the box:
 * an elbow stops 1px before its left edge, a parent's stub starts at its bottom edge.
 */
const BOX_INSET = 2;

/** Left padding inside the row's box before the icon. Guide lines are shifted by the same amount, so they stay centered on the icon. */
const ICON_PAD = 2;

/**
 * One row's guide lines: a rail for every ancestor branch that continues, an elbow into this row
 * (`├` or a rounded `└` for the last child), and a stub down from an open parent.
 */
function Guides({ row, height, indent, slot, open }: { row: Row; height: number; indent: number; slot: number; open: boolean }) {
  const { depth, last, rails, hasChildren } = row;
  // Exactly on the icon's center and the row's middle (no half-pixel nudge: with a 1.25px stroke it only pushed the line off-center).
  const mid = height / 2;
  const cx = (c: number) => c * indent + ICON_PAD + slot / 2;
  const paths: string[] = [];
  // Ancestor rails (columns 0..depth-2 belong to ancestors; rails[c+1] says whether that ancestor has later siblings).
  for (let c = 0; c < depth - 1; c++) if (rails[c + 1]) paths.push(`M${cx(c)} 0V${height}`);
  if (depth > 0) {
    const x = cx(depth - 1);
    // The row's box starts at depth * indent; stop just short of it so the line never runs under the hover fill.
    const end = depth * indent - 1;
    paths.push(last ? `M${x} 0V${mid - ELBOW_RADIUS}Q${x} ${mid} ${x + ELBOW_RADIUS} ${mid}H${end}` : `M${x} 0V${height}M${x} ${mid}H${end}`);
  }
  // Stub from an open parent down to its first child, from the bottom edge of the parent's box.
  if (open && hasChildren) paths.push(`M${cx(depth)} ${height - BOX_INSET}V${height}`);
  if (!paths.length) return null;
  return (
    <svg aria-hidden width={(depth + 1) * indent} height={height} className="pointer-events-none absolute top-0 left-0 overflow-visible">
      {/* Butt caps: rails of stacked rows meet edge to edge. Round caps overlap by half a pixel and the translucent ink doubles there. */}
      <path d={paths.join("")} fill="none" stroke="var(--nonla-tree-line)" strokeWidth="1.25" strokeLinecap="butt" strokeLinejoin="round" />
    </svg>
  );
}

/** Hierarchical list with SVG guide lines, expand / collapse, selection, and arrow-key navigation (WAI-ARIA tree). */
export function Tree({
  treeData,
  showLine = true,
  expandedKeys,
  defaultExpandedKeys,
  defaultExpandAll = false,
  onExpand,
  selectedKeys,
  defaultSelectedKeys,
  onSelect,
  selectable = true,
  multiple = false,
  titleRender,
  size = "default",
  className,
  "aria-label": ariaLabel,
}: TreeProps) {
  const [innerOpen, setInnerOpen] = useState<string[]>(() => defaultExpandedKeys ?? (defaultExpandAll ? collectParents(treeData) : []));
  const openKeys = expandedKeys ?? innerOpen;
  const open = useMemo(() => new Set(openKeys), [openKeys]);
  const [innerSel, setInnerSel] = useState<string[]>(defaultSelectedKeys ?? []);
  const selKeys = selectedKeys ?? innerSel;
  const selected = useMemo(() => new Set(selKeys), [selKeys]);
  const rows = useMemo(() => flatten(treeData, open), [treeData, open]);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const { height, indent, slot } = SIZES[size];

  const toggle = (row: Row, next = !open.has(row.node.key)) => {
    if (!row.hasChildren || row.node.disabled || next === open.has(row.node.key)) return;
    const keys = next ? [...openKeys, row.node.key] : openKeys.filter((k) => k !== row.node.key);
    if (expandedKeys === undefined) setInnerOpen(keys);
    onExpand?.(keys, { node: row.node, expanded: next });
  };

  const pick = (row: Row) => {
    if (!selectable || row.node.disabled) return;
    const was = selected.has(row.node.key);
    const keys = multiple ? (was ? selKeys.filter((k) => k !== row.node.key) : [...selKeys, row.node.key]) : was ? [] : [row.node.key];
    if (selectedKeys === undefined) setInnerSel(keys);
    onSelect?.(keys, { node: row.node, selected: !was });
  };

  const focusRow = (key: string | undefined) => {
    if (!key) return;
    setFocusKey(key);
    rowRefs.current.get(key)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // The row the key event came from; falls back to the remembered focus.
    const fromKey = (e.target as HTMLElement).closest<HTMLElement>("[data-tree-key]")?.dataset.treeKey;
    const i = rows.findIndex((r) => r.node.key === (fromKey ?? focusKey ?? rows[0]?.node.key));
    const row = rows[i];
    if (!row) return;
    const isOpen = open.has(row.node.key);
    switch (e.key) {
      case "ArrowDown":
        focusRow(rows[i + 1]?.node.key);
        break;
      case "ArrowUp":
        focusRow(rows[i - 1]?.node.key);
        break;
      case "Home":
        focusRow(rows[0]?.node.key);
        break;
      case "End":
        focusRow(rows[rows.length - 1]?.node.key);
        break;
      case "ArrowRight":
        if (row.hasChildren && !isOpen) toggle(row, true);
        else if (isOpen) focusRow(rows[i + 1]?.node.key);
        break;
      case "ArrowLeft":
        if (row.hasChildren && isOpen) toggle(row, false);
        else focusRow(row.parentKey ?? undefined);
        break;
      case "Enter":
      case " ":
        pick(row);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const tabKey = focusKey && rows.some((r) => r.node.key === focusKey) ? focusKey : (rows.find((r) => selected.has(r.node.key)) ?? rows[0])?.node.key;

  return (
    <div role="tree" aria-label={ariaLabel} aria-multiselectable={multiple || undefined} onKeyDown={onKeyDown} className={cn("flex flex-col text-sm text-foreground", className)}>
      {rows.map((row) => {
        const { node, depth, hasChildren } = row;
        const isOpen = open.has(node.key);
        const isSel = selected.has(node.key);
        return (
          <div
            key={node.key}
            ref={(el) => {
              if (el) rowRefs.current.set(node.key, el);
              else rowRefs.current.delete(node.key);
            }}
            role="treeitem"
            data-tree-key={node.key}
            aria-level={depth + 1}
            aria-expanded={hasChildren ? isOpen : undefined}
            aria-selected={selectable ? isSel : undefined}
            aria-disabled={node.disabled || undefined}
            tabIndex={node.key === tabKey ? 0 : -1}
            onFocus={() => setFocusKey(node.key)}
            onClick={() => {
              setFocusKey(node.key);
              // The row is the toggle: a click opens or closes a parent, and picks it.
              toggle(row);
              pick(row);
            }}
            // Fast repeated clicks would otherwise select the title text.
            onMouseDown={(e) => {
              if (e.detail > 1) e.preventDefault();
            }}
            className={cn("group/tree-row relative flex shrink-0 select-none items-center outline-none", node.disabled ? "cursor-not-allowed" : "cursor-pointer")}
            style={{ height, paddingLeft: depth * indent }}
          >
            {showLine ? <Guides row={row} height={height} indent={indent} slot={slot} open={isOpen} /> : null}
            <span
              className={cn(
                "flex h-[calc(100%-4px)] min-w-0 flex-1 items-center rounded-md transition-colors duration-(--nonla-dur-fast)",
                // With an icon, its slot is centered on the guide line (no left padding). Without one, the text starts
                // right inside the box, so a tree with no icons is not pushed out by empty slots.
                node.icon == null ? "pr-1.5 pl-2" : "pr-1.5",
                size === "small" ? "gap-1.5" : "gap-2",
                isSel ? "bg-ink-active font-medium" : !node.disabled && "group-hover/tree-row:bg-ink-hover",
                // Dim only the content: the guide lines in this row belong to the whole branch and keep their ink.
                node.disabled && "opacity-45",
                "group-focus-visible/tree-row:ring-2 group-focus-visible/tree-row:ring-focus-ring",
              )}
            >
              {node.icon == null ? null : (
                <span className={cn("inline-flex h-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4", size === "small" ? "-mr-0.5" : "-mr-1.5")} style={{ width: slot, marginLeft: ICON_PAD }}>
                  {isIconName(node.icon) ? <Icon name={node.icon} size={16} /> : node.icon}
                </span>
              )}
              <span className="min-w-0 truncate">{titleRender ? titleRender(node) : node.title}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
