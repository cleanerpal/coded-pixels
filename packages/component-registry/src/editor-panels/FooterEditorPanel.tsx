import type { EditorPanelProps } from '../types';
import type { FooterProps } from '../schemas/footer';
import { CheckboxField, TextField } from './fields';

export function FooterEditorPanel({ props, onChange }: EditorPanelProps) {
  const footer = props as FooterProps;
  return (
    <div className="space-y-4">
      <TextField
        id="footer-business-name"
        label="Business name"
        value={footer.businessName}
        onChange={(event) => onChange({ ...footer, businessName: event.target.value })}
      />
      <TextField
        id="footer-tagline"
        label="Tagline"
        value={footer.tagline ?? ''}
        onChange={(event) => onChange({ ...footer, tagline: event.target.value || undefined })}
      />
      <CheckboxField
        id="footer-social"
        label="Show social links"
        checked={footer.showSocialLinks}
        onChange={(event) => onChange({ ...footer, showSocialLinks: event.target.checked })}
      />
      <TextField
        id="footer-copyright"
        label="Copyright override"
        value={footer.copyright ?? ''}
        onChange={(event) => onChange({ ...footer, copyright: event.target.value || undefined })}
      />
    </div>
  );
}
