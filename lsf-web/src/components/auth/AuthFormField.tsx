'use client';

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface AuthFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  type?: string;
}

export function AuthFormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
}: AuthFormFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="field-label text-ink">{label}</FormLabel>
          <FormControl>
            <input type={type} placeholder={placeholder} className="field" {...field} />
          </FormControl>
          <FormMessage className="text-sm font-bold text-tomato" />
        </FormItem>
      )}
    />
  );
}
