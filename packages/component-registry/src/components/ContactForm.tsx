import { Button } from '@codedpixels/ui';
import type { SectionComponentProps } from '../types';
import type { ContactFormProps } from '../schemas/contact-form';

export function ContactForm({ props }: SectionComponentProps) {
  const form = props as ContactFormProps;
  return (
    <section className="bg-surface px-6 py-12">
      <form className="mx-auto max-w-xl space-y-4" onSubmit={(event) => event.preventDefault()}>
        {form.headline ? (
          <h2 className="text-2xl font-semibold text-primary">{form.headline}</h2>
        ) : null}
        {form.fields.map((field) => (
          <label key={field.id} className="block space-y-1">
            <span className="text-sm font-medium text-primary">
              {field.label}
              {field.required ? ' *' : ''}
            </span>
            {field.type === 'textarea' ? (
              <textarea
                name={field.id}
                required={field.required}
                rows={4}
                className="w-full rounded-card border border-border bg-background px-3 py-2 text-sm"
              />
            ) : (
              <input
                type={field.type}
                name={field.id}
                required={field.required}
                className="w-full rounded-card border border-border bg-background px-3 py-2 text-sm"
              />
            )}
          </label>
        ))}
        <Button type="submit">{form.submitLabel}</Button>
        <p className="text-xs text-muted">{form.successMessage}</p>
      </form>
    </section>
  );
}
