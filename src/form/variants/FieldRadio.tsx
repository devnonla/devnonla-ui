import type { ControllerRenderProps, FieldValues } from "react-hook-form";
import type { ISelectItemProps } from "../common/types";

type Props = {
  field: ControllerRenderProps<FieldValues, string>;
  choices?: ISelectItemProps[];
};

export function FieldRadio({ field, choices }: Props) {
  return (
    <div className="flex flex-col gap-2" role="radiogroup">
      {(choices ?? []).map((option) => {
        const id = `${field.name}-${option.value}`;
        const checked = String(field.value) === String(option.value);
        return (
          <label key={String(option.value)} htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <span className="relative inline-flex size-4 shrink-0">
              <input
                id={id}
                type="radio"
                name={field.name}
                value={String(option.value)}
                checked={checked}
                onChange={() => field.onChange(option.value)}
                onBlur={field.onBlur}
                className="peer absolute inset-0 z-1 m-0 size-4 cursor-pointer appearance-none rounded-full opacity-0"
              />
              <span
                aria-hidden
                className="pointer-events-none size-4 rounded-full border border-solid border-input bg-(--control-bg) peer-checked:border-brand"
              />
              <span aria-hidden className="pointer-events-none absolute inset-[3.5px] rounded-full bg-brand opacity-0 peer-checked:opacity-100" />
            </span>
            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
