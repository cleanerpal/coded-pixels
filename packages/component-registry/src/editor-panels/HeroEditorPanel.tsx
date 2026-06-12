import type { EditorPanelProps } from '../types';
import type { HeroProps } from '../schemas/hero';
import { SelectField, TextField } from './fields';

export function HeroEditorPanel({ props, onChange }: EditorPanelProps) {
  const hero = props as HeroProps;
  return (
    <div className="space-y-4">
      <TextField
        id="hero-headline"
        label="Headline"
        value={hero.headline}
        onChange={(event) => onChange({ ...hero, headline: event.target.value })}
      />
      <TextField
        id="hero-subheadline"
        label="Subheadline"
        value={hero.subheadline ?? ''}
        onChange={(event) => onChange({ ...hero, subheadline: event.target.value })}
      />
      <TextField
        id="hero-cta-text"
        label="CTA text"
        value={hero.ctaText ?? ''}
        onChange={(event) => onChange({ ...hero, ctaText: event.target.value })}
      />
      <TextField
        id="hero-cta-link"
        label="CTA link"
        value={hero.ctaLink ?? ''}
        onChange={(event) => onChange({ ...hero, ctaLink: event.target.value })}
      />
      <TextField
        id="hero-background"
        label="Background image URL"
        value={hero.backgroundImage ?? ''}
        onChange={(event) => onChange({ ...hero, backgroundImage: event.target.value || undefined })}
      />
      <SelectField
        id="hero-alignment"
        label="Alignment"
        value={hero.alignment ?? 'center'}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
        onChange={(event) =>
          onChange({
            ...hero,
            alignment: event.target.value as HeroProps['alignment'],
          })
        }
      />
    </div>
  );
}
