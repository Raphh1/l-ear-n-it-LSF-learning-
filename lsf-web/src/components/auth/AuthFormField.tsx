'use client';

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const inputClass =
  'w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all';

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
          <FormLabel className="text-white/70 text-sm">{label}</FormLabel>
          <FormControl>
            <input type={type} placeholder={placeholder} className={inputClass} {...field} />
          </FormControl>
          <FormMessage className="text-rose-400 text-xs" />
        </FormItem>
      )}
    />
  );
}
