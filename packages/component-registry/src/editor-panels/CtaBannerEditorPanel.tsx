import type { EditorPanelProps } from '../types';
import type { CtaBannerProps } from '../schemas/cta-banner';
import { TextField } from './fields';

export function CtaBannerEditorPanel({ props, onChange }: EditorPanelProps) {
  const cta = props as CtaBannerProps;
  return (
    <div className="space-y-4">
      <TextField
        id="cta-headline"
        label="Headline"
        value={cta.headline}
        onChange={(event) => onChange({ ...cta, headline: event.target.value })}
      />
      <TextField
        id="cta-subheadline"
        label="Subheadline"
        value={cta.subheadline ?? ''}
        onChange={(event) => onChange({ ...cta, subheadline: event.target.value || undefined })}
      />
      <TextField
        id="cta-text"
        label="Button text"
        value={cta.ctaText ?? ''}
        onChange={(event) => onChange({ ...cta, ctaText: event.target.value || undefined })}
      />
      <TextField
        id="cta-link"
        label="Button link"
        value={cta.ctaLink ?? ''}
        onChange={(event) => onChange({ ...cta, ctaLink: event.target.value || undefined })}
      />
    </div>
  );
}
