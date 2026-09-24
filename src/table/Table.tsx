import { type CSSProperties, type Key, type ReactNode, type Ref, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "../checkbox/Checkbox";
import { Empty } from "../empty/Empty";
import { cn } from "../lib/cn";
import { type CanonicalSize, type ControlSize, useControlSize } from "../lib/sizes";
import { Pagination, type PaginationProps } from "../pagination/Pagination";
import { OverlayScroll } from "../scroll/OverlayScroll";
import { Spin } from "../spin/Spin";

export type SortOrder = "ascend" | "descend" | null;

export type ColumnType<T> = {
  title?: ReactNode;
  dataIndex?: keyof T | string | (string | number)[];
  key?: string;
  width?: number | string;
  minWidth?: number | string;
  align?: "left" | "center" | "right";
  /** Custom cell — `(value, record, index) => ReactNode`. */
  render?: (value: any, record: T, index: number) => ReactNode;
  className?: string;
  /**
   * Take leftover container width (measured). `true` shares equally with other flex columns.
   * Text wraps inside that width so the table does not scroll horizontally.
   */
  flex?: boolean | number;
  ellipsis?: boolean;
  fixed?: "left" | "right";
  /** `true` = default compare on `dataIndex`; or pass a compare fn. */
  sorter?: boolean | ((a: T, b: T) => number);
  sortOrder?: SortOrder;
  defaultSortOrder?: SortOrder;
  onHeaderCell?: () => { className?: string; style?: CSSProperties };
};

export type ColumnsType<T> = ColumnType<T>[];

export type TablePaginationConfig = Pick<
  PaginationProps,
  | "align"
  | "current"
  | "defaultCurrent"
  | "pageSize"
  | "defaultPageSize"
  | "total"
  | "onChange"
  | "onShowSizeChange"
  | "hideOnSinglePage"
  | "className"
  | "showSizeChanger"
  | "showQuickJumper"
  | "showTotal"
  | "simple"
  | "disabled"
  | "size"
  | "pageSizeOptions"
  | "showLessItems"
  | "showTitle"
  | "itemRender"
>;

export type TableRowSelection<T> = {
  selectedRowKeys?: Key[];
  defaultSelectedRowKeys?: Key[];
  onChange?: (selectedRowKeys: Key[], selectedRows: T[]) => void;
  getCheckboxProps?: (record: T) => { disabled?: boolean };
  columnWidth?: number | string;
  type?: "checkbox" | "radio";
};

export type TableProps<T extends object = Record<string, unknown>> = {
  columns?: ColumnType<T>[];
  dataSource?: T[];
  rowKey?: keyof T | ((record: T) => Key);
  loading?: boolean;
  /** `false` disables; object enables (client-side slice when `total` omitted). */
  pagination?: false | TablePaginationConfig;
  className?: string;
  size?: ControlSize;
  bordered?: boolean;
  scroll?: { x?: number | string; y?: number | string };
  onRow?: (
    record: T,
    index: number,
  ) => {
    onClick?: () => void;
    className?: string;
    style?: CSSProperties;
  };
  locale?: { emptyText?: ReactNode };
  showHeader?: boolean;
  title?: ReactNode | ((data: readonly T[]) => ReactNode);
  footer?: ReactNode | ((data: readonly T[]) => ReactNode);
  rowSelection?: TableRowSelection<T>;
  rowClassName?: string | ((record: T, index: number) => string);
  onChange?: (pagination: TablePaginationConfig | false, _filters: Record<string, unknown>, sorter: { columnKey?: string; field?: string; order?: SortOrder }) => void;
};

function getRowKey<T extends object>(record: T, index: number, rowKey?: TableProps<T>["rowKey"]): Key {
  if (typeof rowKey === "function") return rowKey(record);
  if (typeof rowKey === "string" || typeof rowKey === "number") {
    return String(record[rowKey as keyof T] ?? index);
  }
  if ("id" in record) return String((record as { id: unknown }).id);
  if ("key" in record) return String((record as { key: unknown }).key);
  return index;
}

function getCellValue<T>(record: T, dataIndex?: ColumnType<T>["dataIndex"]): unknown {
  if (dataIndex == null) return undefined;
  if (Array.isArray(dataIndex)) {
    let cur: unknown = record;
    for (const part of dataIndex) {
      if (cur == null || typeof cur !== "object") return undefined;
      cur = (cur as Record<string | number, unknown>)[part];
    }
    return cur;
  }
  return (record as Record<string, unknown>)[dataIndex as string];
}

function getColumnKey<T>(col: ColumnType<T>, index: number): string {
  if (col.key != null) return col.key;
  if (Array.isArray(col.dataIndex)) return col.dataIndex.join(".");
  if (col.dataIndex != null) return String(col.dataIndex);
  return String(index);
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/** Dual filled carets with a clear gap (stroke chevrons merge into a ◇). */
function SortIcon({ order }: { order: SortOrder | undefined }) {
  return (
    <span className="ml-1.5 inline-flex shrink-0 flex-col items-center gap-0.5" aria-hidden>
      <svg width="7" height="4" viewBox="0 0 7 4" className={cn(order === "ascend" ? "text-foreground" : "text-muted-foreground/45")}>
        <path d="M3.5 0 7 4H0z" fill="currentColor" />
      </svg>
      <svg width="7" height="4" viewBox="0 0 7 4" className={cn(order === "descend" ? "text-foreground" : "text-muted-foreground/45")}>
        <path d="M3.5 4 0 0h7z" fill="currentColor" />
      </svg>
    </span>
  );
}

type FlexLayout = { selection?: number; cols: Record<string, number> };

function flexWeight<T>(col: ColumnType<T>): number {
  if (col.width != null) return 0;
  if (col.flex === true) return 1;
  if (typeof col.flex === "number" && col.flex > 0) return col.flex;
  return 0;
}

function layoutsClose(prev: FlexLayout | null, next: FlexLayout): boolean {
  if (!prev) return false;
  if (Math.abs((prev.selection ?? 0) - (next.selection ?? 0)) > 0.5) return false;
  const keys = Object.keys(next.cols);
  if (keys.length !== Object.keys(prev.cols).length) return false;
  return keys.every((key) => Math.abs((prev.cols[key] ?? -1) - next.cols[key]) <= 0.5);
}

function TableBodyScroll({ x, y, scrollRef, insetTop = 0, children }: { x?: number | string; y?: number | string; scrollRef: Ref<HTMLDivElement>; insetTop?: number; children: ReactNode }) {
  if (y == null) return <div ref={scrollRef}>{children}</div>;
  return (
    <OverlayScroll autoHeight visibility="hover" scrollRef={scrollRef} insetTop={insetTop} style={{ maxHeight: y }} innerClassName={x != null ? "overflow-x-auto" : undefined}>
      {children}
    </OverlayScroll>
  );
}

function sizeClasses(s: CanonicalSize) {
  if (s === "small") {
    return {
      head: "h-9 px-2 text-xs",
      cell: "px-2 py-1.5 text-xs",
      check: "w-9 px-2",
    };
  }
  if (s === "large") {
    return {
      head: "h-12 px-3 text-base",
      cell: "px-3 py-3 text-base",
      check: "w-12 px-3",
    };
  }
  // default — text-base is 14px (`--text-sm` in this theme is 13px)
  return {
    head: "h-10 px-2 text-base",
    cell: "p-2 text-base",
    check: "w-10 px-2",
  };
}

export function Table<T extends object = Record<string, unknown>>({ columns = [], dataSource = [], rowKey, loading, pagination, className, size, bordered, scroll, onRow, locale, showHeader = true, title, footer, rowSelection, rowClassName, onChange }: TableProps<T>) {
  const sz = sizeClasses(useControlSize(size));

  const selectionControlled = rowSelection?.selectedRowKeys !== undefined;
  const [innerSelected, setInnerSelected] = useState<Key[]>(() => rowSelection?.defaultSelectedRowKeys ?? []);
  const selectedKeys = selectionControlled ? (rowSelection?.selectedRowKeys ?? []) : innerSelected;

  const [innerPage, setInnerPage] = useState(() => (typeof pagination === "object" && pagination?.defaultCurrent) || 1);
  const [innerPageSize, setInnerPageSize] = useState(() => (typeof pagination === "object" && pagination?.defaultPageSize) || 10);

  const initialSort = useMemo(() => {
    const col = columns.find((c) => c.defaultSortOrder);
    if (!col) return { key: null as string | null, order: null as SortOrder };
    return { key: getColumnKey(col, columns.indexOf(col)), order: col.defaultSortOrder ?? null };
  }, [columns]);

  const [innerSort, setInnerSort] = useState(initialSort);

  const controlledSortCol = columns.find((c) => c.sortOrder !== undefined);
  const sortState = controlledSortCol
    ? {
        key: getColumnKey(controlledSortCol, columns.indexOf(controlledSortCol)),
        order: controlledSortCol.sortOrder ?? null,
      }
    : innerSort;

  const paginationOff = pagination === false;
  const pageConfig: TablePaginationConfig = paginationOff ? {} : (pagination ?? {});
  const pageControlled = pageConfig.current !== undefined;
  const pageSizeControlled = pageConfig.pageSize !== undefined;
  const current = pageControlled ? (pageConfig.current ?? 1) : innerPage;
  const pageSize = pageSizeControlled ? (pageConfig.pageSize ?? 10) : innerPageSize;
  const serverSide = pageConfig.total !== undefined;

  const sortedData = useMemo(() => {
    if (!sortState.key || !sortState.order) return dataSource;
    const colIndex = columns.findIndex((c, i) => getColumnKey(c, i) === sortState.key);
    const col = colIndex >= 0 ? columns[colIndex] : undefined;
    if (!col?.sorter) return dataSource;
    const dir = sortState.order === "ascend" ? 1 : -1;
    const cmp = typeof col.sorter === "function" ? col.sorter : (a: T, b: T) => defaultCompare(getCellValue(a, col.dataIndex), getCellValue(b, col.dataIndex));
    return [...dataSource].sort((a, b) => cmp(a, b) * dir);
  }, [columns, dataSource, sortState.key, sortState.order]);

  const total = serverSide ? (pageConfig.total ?? sortedData.length) : sortedData.length;

  const pageData = useMemo(() => {
    if (paginationOff || serverSide) return sortedData;
    const start = (current - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, paginationOff, serverSide, current, pageSize]);

  const showPagination = !paginationOff && !(pageConfig.hideOnSinglePage && total <= pageSize) && (total > 0 || serverSide);

  const emitSelection = (keys: Key[]) => {
    if (!selectionControlled) setInnerSelected(keys);
    const rows = dataSource.filter((r, i) => keys.includes(getRowKey(r, i, rowKey)));
    rowSelection?.onChange?.(keys, rows);
  };

  /** Two modes only: ascend ↔ descend. */
  const toggleSort = (col: ColumnType<T>, index: number) => {
    if (!col.sorter) return;
    const key = getColumnKey(col, index);
    const next: SortOrder = sortState.key === key && sortState.order === "ascend" ? "descend" : "ascend";
    if (!controlledSortCol) setInnerSort({ key, order: next });
    onChange?.(
      paginationOff ? false : { current, pageSize, total },
      {},
      {
        columnKey: key,
        field: Array.isArray(col.dataIndex) ? col.dataIndex.join(".") : String(col.dataIndex ?? key),
        order: next,
      },
    );
  };

  const handlePageChange = (page: number, nextSize: number) => {
    if (!pageControlled) setInnerPage(page);
    if (!pageSizeControlled) setInnerPageSize(nextSize);
    pageConfig.onChange?.(page, nextSize);
    onChange?.({ current: page, pageSize: nextSize, total }, {}, { columnKey: sortState.key ?? undefined, order: sortState.order });
  };

  const pageKeys = pageData.map((r, i) => getRowKey(r, (current - 1) * pageSize + i, rowKey));
  const enabledPageKeys = pageData
    .map((r, i) => ({ key: pageKeys[i]!, disabled: rowSelection?.getCheckboxProps?.(r)?.disabled }))
    .filter((x) => !x.disabled)
    .map((x) => x.key);
  const allPageSelected = enabledPageKeys.length > 0 && enabledPageKeys.every((k) => selectedKeys.includes(k));
  const somePageSelected = enabledPageKeys.some((k) => selectedKeys.includes(k));

  const titleNode = typeof title === "function" ? title(pageData) : title;
  const footerNode = typeof footer === "function" ? footer(pageData) : footer;
  const selectionColWidth = rowSelection?.columnWidth;
  const colCount = (columns.length || 1) + (rowSelection ? 1 : 0);

  const alignClass = (align?: "left" | "center" | "right") => (align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left");

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const [flexLayout, setFlexLayout] = useState<FlexLayout | null>(null);
  const flexSig = `${scroll?.x ?? ""}|${scroll?.y ?? ""}|${rowSelection ? 1 : 0}|${showHeader ? 1 : 0}|${dataSource.length}|${columns.map((col, i) => `${getColumnKey(col, i)}:${col.flex ?? ""}:${col.width ?? ""}`).join(",")}`;
  const flexSigRef = useRef(flexSig);
  if (flexSigRef.current !== flexSig) {
    flexSigRef.current = flexSig;
    if (flexLayout) setFlexLayout(null);
  }

  useLayoutEffect(() => {
    const container = containerRef.current;
    const cols = columnsRef.current;
    const wantsFlex = scroll?.x == null && cols.some((col) => flexWeight(col) > 0);
    if (!container || !wantsFlex) {
      setFlexLayout((prev) => (prev ? null : prev));
      return;
    }

    let locked: { selection?: number; fixed: Record<string, number>; weights: { key: string; weight: number }[] } | null = null;

    const apply = () => {
      const scroller = scrollBodyRef.current;
      const scrollbar = scroller && scroller.scrollHeight > scroller.clientHeight + 1 ? scroller.offsetWidth - scroller.clientWidth : 0;
      const client = container.clientWidth - Math.max(0, scrollbar);
      if (client <= 0) return;
      if (!locked) {
        const table = container.querySelector("table");
        const row = table?.querySelector("thead > tr") ?? table?.querySelector("tbody > tr");
        if (!row) return;
        const cells = [...row.children] as HTMLElement[];
        const start = rowSelection ? 1 : 0;
        const fixed: Record<string, number> = {};
        const weights: { key: string; weight: number }[] = [];
        cols.forEach((col, i) => {
          const key = getColumnKey(col, i);
          const weight = flexWeight(col);
          if (weight > 0) weights.push({ key, weight });
          else fixed[key] = cells[start + i]?.getBoundingClientRect().width ?? 0;
        });
        if (!weights.length) return;
        locked = {
          selection: rowSelection ? cells[0]?.getBoundingClientRect().width : undefined,
          fixed,
          weights,
        };
      }
      const used = (locked.selection ?? 0) + Object.values(locked.fixed).reduce((sum, n) => sum + n, 0);
      if (used > client + 1) {
        setFlexLayout((prev) => (prev ? null : prev));
        return;
      }
      const leftover = Math.max(0, client - used);
      const weightSum = locked.weights.reduce((sum, item) => sum + item.weight, 0);
      const colsWidth = { ...locked.fixed };
      for (const item of locked.weights) colsWidth[item.key] = (leftover * item.weight) / weightSum;
      const next: FlexLayout = { selection: locked.selection, cols: colsWidth };
      setFlexLayout((prev) => (layoutsClose(prev, next) ? prev : next));
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(container);
    if (scrollBodyRef.current) observer.observe(scrollBodyRef.current);
    return () => observer.disconnect();
  }, [flexSig, rowSelection, scroll?.x, scroll?.y, showHeader]);

  const wantsFlex = scroll?.x == null && columns.some((col) => flexWeight(col) > 0);

  const headSticky = scroll?.y != null;
  const [thumbInset, setThumbInset] = useState(0);
  useLayoutEffect(() => {
    if (!headSticky || !showHeader) {
      setThumbInset(0);
      return;
    }
    const head = scrollBodyRef.current?.querySelector("thead");
    const next = head ? Math.ceil(head.getBoundingClientRect().height) + 4 : 0;
    setThumbInset((prev) => (prev === next ? prev : next));
  }, [headSticky, showHeader, size, flexLayout]);
  /** Opaque fill. `bg-foreground/4` is 4% alpha, so body text shows through a sticky header. */
  const headBg: CSSProperties | undefined = headSticky ? { backgroundColor: "var(--nonla-bg)" } : undefined;

  const colStyle = (col: ColumnType<T>, key: string): CSSProperties => {
    const measured = flexLayout?.cols[key];
    if (measured != null) return { width: measured, maxWidth: measured, minWidth: 0 };
    return { width: col.width, minWidth: col.minWidth };
  };

  return (
    <div className={cn("relative w-full", className)}>
      {titleNode != null ? <div className="mb-3 text-sm font-medium text-foreground">{titleNode}</div> : null}

      <Spin spinning={Boolean(loading)}>
        <div ref={containerRef} data-slot="table-container" className={cn("relative w-full", flexLayout ? "overflow-x-hidden" : "overflow-x-auto", bordered && "rounded-md border border-border")} style={scroll?.x != null ? { overflowX: "auto" } : undefined}>
          <TableBodyScroll y={scroll?.y} x={scroll?.x} scrollRef={scrollBodyRef} insetTop={thumbInset}>
            <table data-slot="table" className={cn("caption-bottom text-base", headSticky ? "border-separate border-spacing-0" : "border-collapse", flexLayout ? "w-full table-fixed" : wantsFlex ? "w-max" : "w-full")}>
              {flexLayout ? (
                <colgroup>
                  {rowSelection ? <col style={{ width: flexLayout.selection }} /> : null}
                  {columns.map((col, i) => {
                    const key = getColumnKey(col, i);
                    return <col key={key} style={{ width: flexLayout.cols[key] }} />;
                  })}
                </colgroup>
              ) : null}
              {showHeader ? (
                <thead data-slot="table-header" className={cn("[&_tr]:border-b [&_tr]:border-border", headSticky && "relative z-20")}>
                  <tr data-slot="table-row" className="border-b border-border transition-colors hover:bg-transparent">
                    {rowSelection ? (
                      <th data-slot="table-head" className={cn(sz.head, sz.check, "align-middle font-medium text-foreground", headSticky ? "sticky top-0 z-10 border-b border-border" : "bg-foreground/4", bordered && "border-b border-border")} style={{ ...(selectionColWidth != null ? { width: selectionColWidth } : undefined), ...headBg }}>
                        <div className="flex items-center justify-center">
                          {rowSelection.type === "radio" ? null : (
                            <Checkbox
                              checked={allPageSelected}
                              indeterminate={somePageSelected && !allPageSelected}
                              onChange={(checked) => {
                                if (checked) emitSelection(Array.from(new Set([...selectedKeys, ...enabledPageKeys])));
                                else emitSelection(selectedKeys.filter((k: Key) => !enabledPageKeys.includes(k)));
                              }}
                              aria-label="Select all"
                            />
                          )}
                        </div>
                      </th>
                    ) : null}
                    {columns.map((col, i) => {
                      const key = getColumnKey(col, i);
                      const order = sortState.key === key ? sortState.order : undefined;
                      const headerExtra = col.onHeaderCell?.();
                      const sortable = Boolean(col.sorter);
                      return (
                        <th
                          key={key}
                          data-slot="table-head"
                          className={cn(sz.head, "align-middle font-medium text-foreground", headSticky ? "sticky top-0 z-10 border-b border-border" : "bg-foreground/4", flexLayout && flexWeight(col) > 0 ? "min-w-0" : "whitespace-nowrap", alignClass(col.align), bordered && "border-b border-border", sortable && "cursor-pointer select-none", col.className, headerExtra?.className)}
                          style={{
                            ...colStyle(col, key),
                            ...headBg,
                            ...headerExtra?.style,
                          }}
                          onClick={sortable ? () => toggleSort(col, i) : undefined}
                        >
                          <span className={cn("inline-flex max-w-full items-center", col.align === "center" && "justify-center", col.align === "right" && "w-full justify-end")}>
                            <span className="min-w-0 truncate">{col.title}</span>
                            {sortable ? <SortIcon order={order ?? undefined} /> : null}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
              ) : null}

              <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", headSticky && "relative z-0")}>
                {pageData.length === 0 ? (
                  <tr data-slot="table-row" className="border-b border-border">
                    <td data-slot="table-cell" colSpan={colCount} className={cn(sz.cell, "text-center align-middle")}>
                      {locale?.emptyText ?? <Empty description="No data" className="py-10" />}
                    </td>
                  </tr>
                ) : (
                  pageData.map((record, index) => {
                    const absoluteIndex = paginationOff || serverSide ? index : (current - 1) * pageSize + index;
                    const key = getRowKey(record, absoluteIndex, rowKey);
                    const rowProps = onRow?.(record, absoluteIndex);
                    const extraClass = typeof rowClassName === "function" ? rowClassName(record, absoluteIndex) : rowClassName;
                    const selected = selectedKeys.includes(key);
                    const inSelectionMode = Boolean(rowSelection) && selectedKeys.length > 0;
                    const rowDisabled = Boolean(rowSelection?.getCheckboxProps?.(record)?.disabled);
                    return (
                      <tr
                        key={key}
                        data-slot="table-row"
                        data-state={selected ? "selected" : undefined}
                        className={cn("border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", inSelectionMode && !rowDisabled && "cursor-pointer", rowProps?.className, extraClass)}
                        style={rowProps?.style}
                        onClick={inSelectionMode ? undefined : rowProps?.onClick}
                        onClickCapture={
                          inSelectionMode && !rowDisabled
                            ? (e) => {
                                if (e.target instanceof Element && e.target.closest("[data-row-select]")) return;
                                e.preventDefault();
                                e.stopPropagation();
                                if (rowSelection?.type === "radio") emitSelection([key]);
                                else if (selected) emitSelection(selectedKeys.filter((k) => k !== key));
                                else emitSelection([...selectedKeys, key]);
                              }
                            : undefined
                        }
                      >
                        {rowSelection ? (
                          <td data-row-select data-slot="table-cell" className={cn(sz.cell, sz.check, "align-middle", headSticky && "border-b border-border")} style={selectionColWidth != null ? { width: selectionColWidth } : undefined} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center">
                              {rowSelection.type === "radio" ? (
                                <input type="radio" name="nonla-table-row-select" checked={selected} disabled={rowSelection.getCheckboxProps?.(record)?.disabled} aria-label="Select row" className="size-3.5 accent-foreground" onChange={() => emitSelection([key])} />
                              ) : (
                                <Checkbox
                                  checked={selected}
                                  disabled={rowSelection.getCheckboxProps?.(record)?.disabled}
                                  aria-label="Select row"
                                  onChange={(next) => {
                                    if (next) emitSelection([...selectedKeys, key]);
                                    else emitSelection(selectedKeys.filter((k: Key) => k !== key));
                                  }}
                                />
                              )}
                            </div>
                          </td>
                        ) : null}
                        {columns.map((col, i) => {
                          const raw = getCellValue(record, col.dataIndex);
                          const content = col.render ? col.render(raw, record, absoluteIndex) : (raw as ReactNode);
                          return (
                            <td
                              key={getColumnKey(col, i)}
                              data-slot="table-cell"
                              className={cn(sz.cell, "align-middle", headSticky && "border-b border-border", alignClass(col.align), flexLayout && flexWeight(col) > 0 ? (col.ellipsis ? "max-w-0 truncate" : "min-w-0 whitespace-normal wrap-break-word") : col.ellipsis ? "max-w-0 truncate" : "whitespace-nowrap", col.className)}
                              style={colStyle(col, getColumnKey(col, i))}
                              title={col.ellipsis && (typeof content === "string" || typeof content === "number") ? String(content) : undefined}
                            >
                              {content}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>

              {footerNode != null ? (
                <tfoot data-slot="table-footer" className="border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0">
                  <tr>
                    <td colSpan={colCount} className={cn(sz.cell, "align-middle text-muted-foreground")}>
                      {footerNode}
                    </td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </TableBodyScroll>
        </div>
      </Spin>

      {showPagination ? (
        <div className={cn("mt-4", pageConfig.className)}>
          <Pagination
            {...pageConfig}
            className={undefined}
            hideOnSinglePage={false}
            align={pageConfig.align ?? "end"}
            current={current}
            pageSize={pageSize}
            total={total}
            size={pageConfig.size ?? "small"}
            showSizeChanger={pageConfig.showSizeChanger ?? false}
            onChange={handlePageChange}
          />
        </div>
      ) : null}
    </div>
  );
}
