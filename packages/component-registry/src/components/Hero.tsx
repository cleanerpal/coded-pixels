import { Button } from '@codedpixels/ui';
import type { SectionComponentProps } from '../types';
import type { HeroProps } from '../schemas/hero';

const alignmentClasses: Record<NonNullable<HeroProps['alignment']>, string> = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

export function Hero({ props }: SectionComponentProps) {
  const hero = props as HeroProps;
  const alignment = hero.alignment ?? 'center';

  return (
    <section
      className={`flex min-h-[320px] flex-col justify-center gap-4 bg-background px-6 py-16 ${alignmentClasses[alignment]}`}
      style={
        hero.backgroundImage
          ? {
              backgroundImage: `url(${hero.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <h1 className="max-w-3xl text-4xl font-bold text-primary">{hero.headline}</h1>
      {hero.subheadline ? (
        <p className="max-w-2xl text-lg text-muted">{hero.subheadline}</p>
      ) : null}
      {hero.ctaText && hero.ctaLink ? (
        <a href={hero.ctaLink}>
          <Button>{hero.ctaText}</Button>
        </a>
      ) : null}
    </section>
  );
}
