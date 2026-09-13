import { type CSSProperties, useEffect, useRef } from "react";
import { type DayButtonProps, DayPicker, type DayPickerProps, getDefaultClassNames } from "react-day-picker";
import { cn } from "../lib/cn";

export type CalendarProps = DayPickerProps;

function Chevron({
  className,
  orientation,
  size = 16,
  ...props
}: {
  className?: string;
  orientation?: "left" | "right" | "up" | "down";
  size?: number;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const d =
    orientation === "left"
      ? "M15 18L9 12L15 6"
      : orientation === "right"
        ? "M9 18L15 12L9 6"
        : orientation === "up"
          ? "M6 15L12 9L18 15"
          : "M6 9L12 15L18 9";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={cn("opacity-70", className)} {...props}>
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarDayButton({ className, day, modifiers, children, ...props }: DayButtonProps) {
  const defaultClassNames = getDefaultClassNames();
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      type="button"
      {...props}
      data-day={day.date.toLocaleDateString()}
      data-today={modifiers.today ? "true" : undefined}
      data-selected-single={modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle ? "true" : undefined}
      data-range-start={modifiers.range_start ? "true" : undefined}
      data-range-end={modifiers.range_end ? "true" : undefined}
      data-range-middle={modifiers.range_middle ? "true" : undefined}
      className={cn(
        "relative flex aspect-square size-full min-w-8 items-center justify-center rounded-md bg-transparent text-sm font-normal leading-none",
        "transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "data-[selected-single=true]:bg-brand-200 data-[selected-single=true]:text-foreground data-[selected-single=true]:hover:bg-brand-200",
        "data-[range-start=true]:bg-brand-200 data-[range-start=true]:text-foreground data-[range-start=true]:hover:bg-brand-200 data-[range-start=true]:rounded-md",
        "data-[range-end=true]:bg-brand-200 data-[range-end=true]:text-foreground data-[range-end=true]:hover:bg-brand-200 data-[range-end=true]:rounded-md",
        "data-[range-middle=true]:bg-brand-50 data-[range-middle=true]:text-foreground data-[range-middle=true]:rounded-none",
        defaultClassNames.day_button,
        className,
      )}
    >
      {children}
      {modifiers.today ? <span aria-hidden className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand" /> : null}
    </button>
  );
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  components,
  formatters,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn("group/calendar w-fit bg-transparent p-0 [--cell-size:2.25rem]", className)}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 sm:flex-row sm:gap-6", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", defaultClassNames.nav),
        button_previous: cn(
          "inline-flex size-(--cell-size) items-center justify-center rounded-md p-0 text-foreground select-none",
          "hover:bg-brand-50 disabled:opacity-40",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          "inline-flex size-(--cell-size) items-center justify-center rounded-md p-0 text-foreground select-none",
          "hover:bg-brand-50 disabled:opacity-40",
          defaultClassNames.button_next,
        ),
        month_caption: cn("flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)", defaultClassNames.month_caption),
        caption_label: cn("select-none text-sm font-medium text-foreground", defaultClassNames.caption_label),
        dropdowns: cn("flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium", defaultClassNames.dropdowns),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn("flex-1 select-none rounded-md text-[0.8rem] font-normal text-muted-foreground", defaultClassNames.weekday),
        week: cn("mt-1.5 flex w-full", defaultClassNames.week),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none",
          "[&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day,
        ),
        today: cn(defaultClassNames.today),
        outside: cn("text-muted-foreground/60 aria-selected:text-muted-foreground", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-40", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        range_start: cn("rounded-l-md bg-brand-50", defaultClassNames.range_start),
        range_middle: cn("rounded-none bg-brand-50", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-brand-50", defaultClassNames.range_end),
        ...classNames,
      }}
      components={{
        Chevron,
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  );
}
