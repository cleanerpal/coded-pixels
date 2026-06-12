import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type FieldProps = {
  label: string;
  id: string;
};

export function TextField({
  label,
  id,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className="block space-y-1">
      <span className="text-sm font-medium text-primary">{label}</span>
      <input
        id={id}
        className="w-full rounded-card border border-border bg-background px-3 py-2 text-sm"
        {...props}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  id,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label htmlFor={id} className="block space-y-1">
      <span className="text-sm font-medium text-primary">{label}</span>
      <textarea
        id={id}
        className="w-full rounded-card border border-border bg-background px-3 py-2 text-sm"
        rows={4}
        {...props}
      />
    </label>
  );
}

export function SelectField({
  label,
  id,
  options,
  ...props
}: FieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: Array<{ value: string; label: string }>;
  }) {
  return (
    <label htmlFor={id} className="block space-y-1">
      <span className="text-sm font-medium text-primary">{label}</span>
      <select
        id={id}
        className="w-full rounded-card border border-border bg-background px-3 py-2 text-sm"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxField({
  label,
  id,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className="flex items-center gap-2">
      <input id={id} type="checkbox" {...props} />
      <span className="text-sm font-medium text-primary">{label}</span>
    </label>
  );
}
