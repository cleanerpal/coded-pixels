import type { EditorPanelProps } from '../types';
import type { TestimonialsProps } from '../schemas/testimonials';
import { TextAreaField, TextField } from './fields';

export function TestimonialsEditorPanel({ props, onChange }: EditorPanelProps) {
  const testimonials = props as TestimonialsProps;
  const itemsText = testimonials.items
    .map((item) => `${item.quote}|${item.author}|${item.role ?? ''}`)
    .join('\n');

  return (
    <div className="space-y-4">
      <TextField
        id="testimonials-headline"
        label="Headline"
        value={testimonials.headline ?? ''}
        onChange={(event) =>
          onChange({ ...testimonials, headline: event.target.value || undefined })
        }
      />
      <TextAreaField
        id="testimonials-items"
        label="Testimonials (quote|author|role per line)"
        value={itemsText}
        onChange={(event) => {
          const items = event.target.value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [quote, author, role] = line.split('|');
              return {
                quote: quote?.trim() ?? '',
                author: author?.trim() ?? 'Anonymous',
                role: role?.trim() || undefined,
              };
            })
            .filter((item) => item.quote);
          onChange({ ...testimonials, items: items.length ? items : testimonials.items });
        }}
      />
    </div>
  );
}
