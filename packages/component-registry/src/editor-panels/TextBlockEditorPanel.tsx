import type { EditorPanelProps } from '../types';
import type { TextBlockProps } from '../schemas/text-block';
import { TextAreaField, TextField } from './fields';

export function TextBlockEditorPanel({ props, onChange }: EditorPanelProps) {
  const text = props as TextBlockProps;
  const body =
    typeof text.body === 'string' ? text.body : JSON.stringify(text.body, null, 2);

  return (
    <div className="space-y-4">
      <TextField
        id="text-block-headline"
        label="Headline"
        value={text.headline ?? ''}
        onChange={(event) => onChange({ ...text, headline: event.target.value || undefined })}
      />
      <TextAreaField
        id="text-block-body"
        label="Body"
        value={body}
        onChange={(event) => onChange({ ...text, body: event.target.value })}
      />
    </div>
  );
}
