/** Schema-driven form (react-hook-form). Prefer this name over layout `Form`. */

export type { FormFetcher } from "./common/context";
export { EFormItemType } from "./common/enum";
export { fieldNameOf, hydrateRules, isRuleRequired } from "./common/rules";
export type {
  IFormItemHelpProps,
  ISelectItemProps,
  TForm,
  TFormItemCheckbox,
  TFormItemColor,
  TFormItemCustom,
  TFormItemDateTime,
  TFormItemHidden,
  TFormItemInput,
  TFormItemNumber,
  TFormItemObject,
  TFormItemProps,
  TFormItemRadio,
  TFormItemRenderCtx,
  TFormItemRepeater,
  TFormItemSelect,
  TFormItemSelectMultiple,
  TFormItemSelectRemote,
  TFormItemSwitch,
  TFormItemTextarea,
  TFormItemTime,
  TFormRule,
  TRuleValueMessage,
} from "./common/types";
export type { FormProps as SchemaFormProps } from "./Form";
export { Form as SchemaForm, Form as FormSchema } from "./Form";
export type { FormItemProps } from "./FormItem";
export { FormItem } from "./FormItem";
