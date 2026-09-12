import type { ControllerRenderProps, FieldValues } from "react-hook-form";
import { ColorPicker, type PresetColorType } from "../../colorpicker/ColorPicker";
import type { ControlSize } from "../../lib/sizes";

type Props = {
  field: ControllerRenderProps<FieldValues, string>;
  options?: Record<string, unknown>;
  status?: "error" | "warning";
};

export function FieldColor({ field, options, status }: Props) {
  const opts = options ?? {};
  const raw = typeof field.value === "string" ? field.value : field.value != null ? String(field.value) : "";
  return (
    <ColorPicker
      value={raw || null}
      onChange={(color) => field.onChange(color.toHexString())}
      onClear={() => field.onChange("")}
      showText
      allowClear={opts.allowClear !== false}
      disabled={opts.disabled as boolean | undefined}
      disabledAlpha={opts.disabledAlpha as boolean | undefined}
      size={opts.size as ControlSize | undefined}
      status={status}
      presets={opts.presets as PresetColorType[] | undefined}
    />
  );
}
