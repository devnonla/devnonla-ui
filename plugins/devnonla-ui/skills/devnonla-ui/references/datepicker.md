<!-- Generated from docs/pages/components/datepicker.md by .claude/scripts/sync-plugin-references.ts. Edit the docs page, not this file. -->
<!-- Live page with examples: https://devnonla.github.io/devnonla-ui/components/datepicker -->

# DatePicker

Popover + calendar — pick a date, time, or date range.

## API

### DatePicker

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `value` | Selected date, for a controlled picker | `Date` \| `string` \| `null` | — |
| `defaultValue` | Initial date, for an uncontrolled picker | `Date` \| `string` \| `null` | — |
| `onChange` | Fires with the date and its formatted string | `(date: Date \| null, dateString: string) => void` | — |
| `size` | Trigger height | `small` \| `default` \| `large` | `default` |
| `placeholder` | Text shown when no date is picked | `string` | `"Pick a date"` |
| `showTime` | Add hour and minute fields to the panel | `boolean` | `false` |
| `needConfirm` | Keep the panel open until OK | `boolean` | `false` |
| `format` | date-fns format for the label and `dateString` | `string` | `"MMM d, yyyy"` |
| `allowClear` | Show a clear button when a date is set | `boolean` | `true` |
| `disabled` | Blocks opening the panel | `boolean` | `false` |
| `status` | Validation outline on the trigger | `error` \| `warning` | — |
| `open` | Panel open state, for a controlled panel | `boolean` | — |
| `onOpenChange` | Fires when the panel opens or closes | `(open: boolean) => void` | — |
| `renderExtraFooter` | Extra content at the bottom of the panel | `() => ReactNode` | — |
| `autoFocus` | Focus the trigger on mount | `boolean` | `false` |
| `className` | Extra class on the trigger | `string` | — |
| `style` | Inline style on the trigger | `CSSProperties` | — |
| `popupClassName` | Extra class on the panel | `string` | — |

### DatePicker.RangePicker

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `value` | Selected start and end, for a controlled picker | `[Date \| null, Date \| null]` \| `null` | — |
| `defaultValue` | Initial start and end, for an uncontrolled picker | `[Date \| null, Date \| null]` \| `null` | — |
| `onChange` | Fires with both dates and their formatted strings | `(dates, dateStrings: [string, string]) => void` | — |
| `size` | Trigger height | `small` \| `default` \| `large` | `default` |
| `placeholder` | Start and end placeholders, or one for both | `[string, string]` \| `string` | `["Start date", "End date"]` |
| `format` | date-fns format for the labels and `dateStrings` | `string` | `"MMM d, yyyy"` |
| `numberOfMonths` | Months shown side by side | `number` | `2` |
| `separator` | Text between the start and end labels | `string` | `"–"` |
| `allowClear` | Show a clear button when a range is set | `boolean` | `true` |
| `disabled` | Blocks opening the panel | `boolean` | `false` |
| `status` | Validation outline on the trigger | `error` \| `warning` | — |
| `className` | Extra class on the trigger | `string` | — |
| `style` | Inline style on the trigger | `CSSProperties` | — |
| `popupClassName` | Extra class on the panel | `string` | — |
