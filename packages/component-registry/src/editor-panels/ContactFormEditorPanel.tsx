import type { EditorPanelProps } from '../types';
import type { ContactFormProps } from '../schemas/contact-form';
import { TextAreaField, TextField } from './fields';

export function ContactFormEditorPanel({ props, onChange }: EditorPanelProps) {
  const form = props as ContactFormProps;
  const fieldsText = form.fields
    .map((field) => `${field.id}|${field.type}|${field.label}|${field.required ? '1' : '0'}`)
    .join('\n');

  return (
    <div className="space-y-4">
      <TextField
        id="contact-headline"
        label="Headline"
        value={form.headline ?? ''}
        onChange={(event) => onChange({ ...form, headline: event.target.value || undefined })}
      />
      <TextAreaField
        id="contact-fields"
        label="Fields (id|type|label|required per line)"
        value={fieldsText}
        onChange={(event) => {
          const fields = event.target.value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [id, type, label, required] = line.split('|');
              return {
                id: id?.trim() ?? 'field',
                type: (type?.trim() ?? 'text') as ContactFormProps['fields'][number]['type'],
                label: label?.trim() ?? 'Field',
                required: required?.trim() === '1',
              };
            });
          onChange({ ...form, fields: fields.length ? fields : form.fields });
        }}
      />
      <TextField
        id="contact-submit"
        label="Submit label"
        value={form.submitLabel}
        onChange={(event) => onChange({ ...form, submitLabel: event.target.value })}
      />
      <TextAreaField
        id="contact-success"
        label="Success message"
        value={form.successMessage}
        onChange={(event) => onChange({ ...form, successMessage: event.target.value })}
      />
    </div>
  );
}
