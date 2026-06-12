import type { SectionComponentProps } from '../types';
import type { TextBlockProps } from '../schemas/text-block';

function renderBody(body: TextBlockProps['body']): string {
  if (typeof body === 'string') {
    return body;
  }
  return JSON.stringify(body);
}

export function TextBlock({ props }: SectionComponentProps) {
  const text = props as TextBlockProps;
  return (
    <section className="bg-surface px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {text.headline ? (
          <h2 className="mb-4 text-2xl font-semibold text-primary">{text.headline}</h2>
        ) : null}
        <p className="whitespace-pre-wrap text-base leading-relaxed text-muted">
          {renderBody(text.body)}
        </p>
      </div>
    </section>
  );
}
