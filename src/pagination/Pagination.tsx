import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { type ComponentType, type CSSProperties, cloneElement, isValidElement, type KeyboardEvent, type ReactElement, type ReactNode, useEffect, useState } from "react";
import { cn } from "../lib/cn";
import { type CanonicalSize, type ControlSize, controlFieldFocusBorder, controlFieldSurface, controlFieldTransition, controlHeightVar, controlRadiusVar, getSizeTokens, useControlSize } from "../lib/sizes";
import { Select, type SelectProps } from "../select/Select";

export type PaginationItemType = "page" | "prev" | "next" | "jump-prev" | "jump-next";
export type PaginationAlign = "start" | "center" | "end";
export type PaginationSemanticSlot = "root" | "item";

export type PaginationSizeChangerProps = {
  disabled?: boolean;
  size?: ControlSize;
  value: number;
  onChange: (pageSize: number) => void;
  className?: string;
  options: number[];
};

type SemanticMap<T> = Partial<Record<PaginationSemanticSlot, T>>;
type SemanticProp<T> = SemanticMap<T> | ((info: { props: PaginationProps }) => SemanticMap<T>);

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const TOTAL_BOUNDARY_SHOW_SIZE_CHANGER = 50;

export type PaginationProps = {
  align?: PaginationAlign;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticProp<string>;
  styles?: SemanticProp<CSSProperties>;
  components?: { sizeChanger?: ComponentType<PaginationSizeChangerProps> };
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  total?: number;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  itemRender?: (page: number, type: PaginationItemType, originalElement: ReactNode) => ReactNode;
  pageSizeOptions?: Array<number | string>;
  responsive?: boolean;
  showLessItems?: boolean;
  showQuickJumper?: boolean | { goButton?: ReactNode };
  showSizeChanger?: boolean | SelectProps;
  showTitle?: boolean;
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  simple?: boolean | { readOnly?: boolean };
  size?: ControlSize;
  totalBoundaryShowSizeChanger?: number;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
};

function toSizes(opts?: Array<number | string>): number[] {
  const raw = opts?.length ? opts : DEFAULT_PAGE_SIZE_OPTIONS;
  const nums = [...new Set(raw.map(Number).filter((n) => Number.isFinite(n) && n > 0))];
  return nums.length ? nums : DEFAULT_PAGE_SIZE_OPTIONS;
}

function resolveSemantic<T>(value: SemanticProp<T> | undefined, props: PaginationProps): SemanticMap<T> {
  if (!value) return {};
  if (typeof value === "function") return value({ props }) ?? {};
  return value;
}

/** Visible page numbers + jump ellipses. Buffer 2 (1 when `showLessItems`). */
function pageItems(current: number, pages: number, less: boolean): Array<number | "jump-prev" | "jump-next"> {
  const buffer = less ? 1 : 2;
  if (pages <= buffer * 2 + 5) return Array.from({ length: pages }, (_, i) => i + 1);
  const left = Math.max(2, current - buffer);
  const right = Math.min(pages - 1, current + buffer);
  const out: Array<number | "jump-prev" | "jump-next"> = [1];
  if (left > 2) out.push("jump-prev");
  else for (let n = 2; n < left; n++) out.push(n);
  for (let n = left; n <= right; n++) out.push(n);
  if (right < pages - 1) out.push("jump-next");
  else for (let n = right + 1; n < pages; n++) out.push(n);
  out.push(pages);
  return out;
}

function ItemBtn({
  children,
  active,
  disabled,
  onClick,
  className,
  style,
  title,
  size,
  ariaLabel,
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  title?: string;
  size: CanonicalSize;
  ariaLabel?: string;
}) {
  const tok = getSizeTokens(size);
  return (
    <button
      type="button"
      data-slot="pagination-item"
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "group inline-flex min-w-0 cursor-pointer items-center justify-center px-1.5 tabular-nums select-none",
        "transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active ? "bg-brand font-medium text-(--nonla-solid-fg)" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
        className,
      )}
      style={{
        minWidth: controlHeightVar(size),
        height: controlHeightVar(size),
        fontSize: tok.fontSize,
        lineHeight: `${tok.lineHeight}px`,
        borderRadius: controlRadiusVar(size),
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function JumpInner({ dir, icon }: { dir: "prev" | "next"; icon: number }) {
  return (
    <span className="relative inline-flex size-full items-center justify-center">
      <span className="leading-none group-hover:opacity-0 group-focus-visible:opacity-0">…</span>
      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
        {dir === "prev" ? <ChevronsLeft size={icon} strokeWidth={2} /> : <ChevronsRight size={icon} strokeWidth={2} />}
      </span>
    </span>
  );
}

function MiniField({
  value,
  disabled,
  size,
  width,
  ariaLabel,
  onSubmit,
}: {
  value: string;
  disabled?: boolean;
  size: CanonicalSize;
  width: number;
  ariaLabel: string;
  onSubmit: (raw: string) => void;
}) {
  const [text, setText] = useState(value);
  const tok = getSizeTokens(size);

  useEffect(() => {
    setText(value);
  }, [value]);

  const commit = () => {
    onSubmit(text);
    if (!Number.isFinite(Number(text))) setText(value);
  };

  return (
    <input
      aria-label={ariaLabel}
      disabled={disabled}
      inputMode="numeric"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      }}
      className={cn(
        "text-center tabular-nums text-foreground placeholder:text-quaternary-foreground",
        controlFieldSurface,
        controlFieldTransition,
        controlFieldFocusBorder,
        "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45",
      )}
      style={{
        width,
        height: controlHeightVar(size),
        fontSize: tok.fontSize,
        lineHeight: `${tok.lineHeight}px`,
        borderRadius: controlRadiusVar(size),
        paddingLeft: 4,
        paddingRight: 4,
      }}
    />
  );
}

function DefaultSizeChanger({ disabled, size, value, onChange, className, options, selectProps }: PaginationSizeChangerProps & { selectProps?: SelectProps }) {
  const opts = options.includes(value) ? options : [value, ...options];
  return (
    <Select
      {...selectProps}
      disabled={disabled || selectProps?.disabled}
      size={selectProps?.size ?? size}
      value={value}
      className={cn("w-[8.5rem]", className, selectProps?.className)}
      onChange={(v) => {
        const n = Number(v);
        if (Number.isFinite(n)) onChange(n);
      }}
      options={selectProps?.options ?? opts.map((n) => ({ value: n, label: `${n} / page` }))}
    />
  );
}

function GoButton({
  goButton,
  disabled,
  size,
  onGo,
}: {
  goButton: ReactNode;
  disabled?: boolean;
  size: CanonicalSize;
  onGo: () => void;
}) {
  if (isValidElement(goButton)) {
    return cloneElement(goButton as ReactElement<{ onClick?: () => void; disabled?: boolean }>, { onClick: onGo, disabled });
  }
  const tok = getSizeTokens(size);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onGo}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center px-2 text-foreground",
        controlFieldSurface,
        controlFieldTransition,
        "hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-45",
      )}
      style={{
        height: controlHeightVar(size),
        fontSize: tok.fontSize,
        borderRadius: controlRadiusVar(size),
      }}
    >
      {goButton === true ? "Go" : goButton}
    </button>
  );
}

export function Pagination(props: PaginationProps) {
  const {
    align,
    className,
    style,
    classNames,
    styles,
    components,
    current,
    defaultCurrent = 1,
    pageSize,
    defaultPageSize = 10,
    total = 0,
    disabled,
    hideOnSinglePage = false,
    itemRender,
    pageSizeOptions,
    responsive,
    showLessItems = false,
    showQuickJumper = false,
    showSizeChanger,
    showTitle = true,
    showTotal,
    simple,
    size,
    totalBoundaryShowSizeChanger = TOTAL_BOUNDARY_SHOW_SIZE_CHANGER,
    onChange,
    onShowSizeChange,
  } = props;

  const pageControlled = current !== undefined;
  const sizeControlled = pageSize !== undefined;
  const [innerPage, setInnerPage] = useState(defaultCurrent);
  const [innerSize, setInnerSize] = useState(defaultPageSize);
  const [narrow, setNarrow] = useState(false);
  const [jumpRaw, setJumpRaw] = useState("");

  const appSize = useControlSize(size);
  const resolvedSize: CanonicalSize = size == null && responsive && narrow ? "small" : appSize;
  const tok = getSizeTokens(resolvedSize);
  const icon = tok.icon;

  const simpleCfg = simple === true ? { readOnly: false } : simple || null;
  const isSimple = Boolean(simpleCfg);
  const simpleReadOnly = Boolean(simpleCfg?.readOnly);

  const jumperCfg = showQuickJumper === true ? {} : typeof showQuickJumper === "object" && showQuickJumper ? showQuickJumper : null;
  const showJumper = Boolean(jumperCfg) && !isSimple;
  const goButton = jumperCfg?.goButton;

  const sizeChangerOn =
    showSizeChanger === false
      ? false
      : showSizeChanger === true || (typeof showSizeChanger === "object" && showSizeChanger != null)
        ? true
        : !isSimple && total > totalBoundaryShowSizeChanger;
  const sizeChangerSelectProps = typeof showSizeChanger === "object" && showSizeChanger != null ? showSizeChanger : undefined;

  const mergedSize = Math.max(1, sizeControlled ? (pageSize ?? defaultPageSize) : innerSize);
  const mergedPage = pageControlled ? (current ?? defaultCurrent) : innerPage;
  const pages = Math.max(1, Math.ceil(total / mergedSize));
  const page = Math.min(Math.max(1, mergedPage), pages);

  useEffect(() => {
    if (!responsive || size != null) {
      setNarrow(false);
      return;
    }
    const mq = window.matchMedia("(max-width: 575px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [responsive, size]);

  useEffect(() => {
    if (pageControlled) return;
    if (innerPage > pages) {
      setInnerPage(pages);
      onChange?.(pages, mergedSize);
    }
  }, [pages, innerPage, pageControlled, mergedSize, onChange]);

  const goTo = (nextPage: number, nextSize: number, sizeChanged = false) => {
    if (disabled) return;
    const nextSz = Math.max(1, nextSize);
    const nextPages = Math.max(1, Math.ceil(total / nextSz));
    const raw = Number(nextPage);
    const next = Math.min(Math.max(1, Number.isFinite(raw) ? Math.floor(raw) : 1), nextPages);
    if (sizeChanged) onShowSizeChange?.(page, nextSz);
    if (next === page && nextSz === mergedSize) return;
    if (!pageControlled) setInnerPage(next);
    if (!sizeControlled) setInnerSize(nextSz);
    onChange?.(next, nextSz);
  };

  if (hideOnSinglePage && pages <= 1) return null;

  const wrap = (p: number, type: PaginationItemType, node: ReactNode) => (itemRender ? itemRender(p, type, node) : node);
  const jumpStep = showLessItems ? 3 : 5;
  const semanticClass = resolveSemantic(classNames, props);
  const semanticStyle = resolveSemantic(styles, props);
  const itemClass = semanticClass.item;
  const itemStyle = semanticStyle.item;

  const start = total === 0 ? 0 : (page - 1) * mergedSize + 1;
  const end = Math.min(page * mergedSize, total);

  const sizeOptions = toSizes(pageSizeOptions);

  const prevInner = wrap(page - 1, "prev", <ChevronLeft size={icon} strokeWidth={2} />);
  const nextInner = wrap(page + 1, "next", <ChevronRight size={icon} strokeWidth={2} />);

  const pager = isSimple ? (
    <>
      <ItemBtn size={resolvedSize} disabled={disabled || page <= 1} title={showTitle ? "Previous Page" : undefined} ariaLabel="Previous Page" className={itemClass} style={itemStyle} onClick={() => goTo(page - 1, mergedSize)}>
        {prevInner}
      </ItemBtn>
      {simpleReadOnly ? (
        <span className="px-1.5 text-sm tabular-nums text-foreground">
          {page}
          <span className="text-muted-foreground">/{pages}</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-sm tabular-nums text-muted-foreground">
          <MiniField
            value={String(page)}
            disabled={disabled}
            size={resolvedSize}
            width={Math.max(36, String(pages).length * 10 + 16)}
            ariaLabel="Page"
            onSubmit={(raw) => {
              const n = Number(raw);
              if (Number.isFinite(n)) goTo(n, mergedSize);
            }}
          />
          <span>/{pages}</span>
        </span>
      )}
      <ItemBtn size={resolvedSize} disabled={disabled || page >= pages} title={showTitle ? "Next Page" : undefined} ariaLabel="Next Page" className={itemClass} style={itemStyle} onClick={() => goTo(page + 1, mergedSize)}>
        {nextInner}
      </ItemBtn>
    </>
  ) : (
    <>
      <ItemBtn size={resolvedSize} disabled={disabled || page <= 1} title={showTitle ? "Previous Page" : undefined} ariaLabel="Previous Page" className={itemClass} style={itemStyle} onClick={() => goTo(page - 1, mergedSize)}>
        {prevInner}
      </ItemBtn>
      {pageItems(page, pages, showLessItems).map((item) => {
        if (item === "jump-prev" || item === "jump-next") {
          const dir = item === "jump-prev" ? "prev" : "next";
          const target = item === "jump-prev" ? Math.max(1, page - jumpStep) : Math.min(pages, page + jumpStep);
          const title = item === "jump-prev" ? `Previous ${jumpStep} Pages` : `Next ${jumpStep} Pages`;
          const inner = wrap(target, item, <JumpInner dir={dir} icon={icon} />);
          return (
            <ItemBtn key={item} size={resolvedSize} disabled={disabled} title={showTitle ? title : undefined} ariaLabel={title} className={itemClass} style={itemStyle} onClick={() => goTo(target, mergedSize)}>
              {inner}
            </ItemBtn>
          );
        }
        const inner = wrap(item, "page", item);
        return (
          <ItemBtn
            key={item}
            size={resolvedSize}
            active={item === page}
            disabled={disabled}
            title={showTitle ? String(item) : undefined}
            ariaLabel={`Page ${item}`}
            className={itemClass}
            style={itemStyle}
            onClick={() => goTo(item, mergedSize)}
          >
            {inner}
          </ItemBtn>
        );
      })}
      <ItemBtn size={resolvedSize} disabled={disabled || page >= pages} title={showTitle ? "Next Page" : undefined} ariaLabel="Next Page" className={itemClass} style={itemStyle} onClick={() => goTo(page + 1, mergedSize)}>
        {nextInner}
      </ItemBtn>
    </>
  );

  const jumperLive = showJumper ? (
    <Jumper
      disabled={disabled}
      size={resolvedSize}
      pages={pages}
      goButton={goButton}
      jumpRaw={jumpRaw}
      setJumpRaw={setJumpRaw}
      onGo={(n) => goTo(n, mergedSize)}
    />
  ) : null;

  return (
    <nav
      data-slot="pagination"
      aria-label="Pagination"
      className={cn(
        "inline-flex flex-wrap items-center gap-3",
        align && "flex w-full",
        align === "start" && "justify-start",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
        semanticClass.root,
        className,
      )}
      style={{ ...semanticStyle.root, ...style }}
    >
      {showTotal ? <span className="text-sm text-muted-foreground">{showTotal(total, [start, end])}</span> : null}
      <div className="inline-flex flex-wrap items-center gap-0.5">{pager}</div>
      {sizeChangerOn ? (
        components?.sizeChanger ? (
          <components.sizeChanger
            disabled={disabled}
            size={resolvedSize}
            value={mergedSize}
            options={sizeOptions}
            className={sizeChangerSelectProps?.className}
            onChange={(next) => goTo(page, next, true)}
          />
        ) : (
          <DefaultSizeChanger
            disabled={disabled}
            size={resolvedSize}
            value={mergedSize}
            options={sizeOptions}
            className={sizeChangerSelectProps?.className}
            selectProps={sizeChangerSelectProps}
            onChange={(next) => goTo(page, next, true)}
          />
        )
      ) : null}
      {jumperLive}
    </nav>
  );
}

function Jumper({
  disabled,
  size,
  pages,
  goButton,
  jumpRaw,
  setJumpRaw,
  onGo,
}: {
  disabled?: boolean;
  size: CanonicalSize;
  pages: number;
  goButton?: ReactNode;
  jumpRaw: string;
  setJumpRaw: (v: string) => void;
  onGo: (page: number) => void;
}) {
  const submit = (raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    onGo(n);
    setJumpRaw("");
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <span>Go to</span>
      <JumperField disabled={disabled} size={size} width={Math.max(40, String(pages).length * 10 + 18)} value={jumpRaw} onChange={setJumpRaw} onSubmit={submit} />
      <span>Page</span>
      {goButton != null && goButton !== false ? <GoButton goButton={goButton} disabled={disabled} size={size} onGo={() => submit(jumpRaw)} /> : null}
    </span>
  );
}

function JumperField({
  value,
  onChange,
  onSubmit,
  disabled,
  size,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (raw: string) => void;
  disabled?: boolean;
  size: CanonicalSize;
  width: number;
}) {
  const tok = getSizeTokens(size);
  return (
    <input
      aria-label="Go to page"
      disabled={disabled}
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSubmit(value);
        }
      }}
      className={cn(
        "text-center tabular-nums text-foreground placeholder:text-quaternary-foreground",
        controlFieldSurface,
        controlFieldTransition,
        controlFieldFocusBorder,
        "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45",
      )}
      style={{
        width,
        height: controlHeightVar(size),
        fontSize: tok.fontSize,
        lineHeight: `${tok.lineHeight}px`,
        borderRadius: controlRadiusVar(size),
        paddingLeft: 4,
        paddingRight: 4,
      }}
    />
  );
}
