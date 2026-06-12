import type { EditorPanelProps } from '../types';
import type { FeaturesGridProps } from '../schemas/features-grid';
import { SelectField, TextAreaField, TextField } from './fields';

export function FeaturesGridEditorPanel({ props, onChange }: EditorPanelProps) {
  const grid = props as FeaturesGridProps;
  const itemsText = grid.items
    .map((item) => `${item.title}|${item.description}`)
    .join('\n');

  return (
    <div className="space-y-4">
      <TextField
        id="features-headline"
        label="Headline"
        value={grid.headline ?? ''}
        onChange={(event) => onChange({ ...grid, headline: event.target.value || undefined })}
      />
      <SelectField
        id="features-columns"
        label="Columns"
        value={String(grid.columns ?? 3)}
        options={[
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
        ]}
        onChange={(event) =>
          onChange({ ...grid, columns: Number(event.target.value) as FeaturesGridProps['columns'] })
        }
      />
      <TextAreaField
        id="features-items"
        label="Items (title|description per line)"
        value={itemsText}
        onChange={(event) => {
          const items = event.target.value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [title, ...rest] = line.split('|');
              return {
                title: title?.trim() ?? 'Feature',
                description: rest.join('|').trim() || 'Description',
              };
            });
          onChange({ ...grid, items: items.length ? items : grid.items });
        }}
      />
    </div>
  );
}
