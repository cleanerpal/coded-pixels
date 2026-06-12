import { Button, DarkSection } from '@codedpixels/ui';
import type { SectionComponentProps } from '../types';
import type { CtaBannerProps } from '../schemas/cta-banner';

export function CtaBanner({ props }: SectionComponentProps) {
  const cta = props as CtaBannerProps;
  return (
    <DarkSection className="px-6 py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">{cta.headline}</h2>
        {cta.subheadline ? <p className="text-base opacity-90">{cta.subheadline}</p> : null}
        {cta.ctaText && cta.ctaLink ? (
          <a href={cta.ctaLink}>
            <Button variant="secondary">{cta.ctaText}</Button>
          </a>
        ) : null}
      </div>
    </DarkSection>
  );
}
