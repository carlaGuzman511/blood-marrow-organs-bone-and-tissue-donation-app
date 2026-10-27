import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import TextField from "../TextField";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address";
  multiline?: boolean;
  numberOfLines?: number;
};

/** `TextField` bound to react-hook-form: shows the field's validation message. */
export default function FormInput<T extends FieldValues>({ control, name, ...fieldProps }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <TextField
          {...fieldProps}
          value={(value as string | undefined) ?? ""}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
        />
      )}
    />
  );
}
