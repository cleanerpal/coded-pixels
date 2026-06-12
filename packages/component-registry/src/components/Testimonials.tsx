import { Card } from '@codedpixels/ui';
import type { SectionComponentProps } from '../types';
import type { TestimonialsProps } from '../schemas/testimonials';

export function Testimonials({ props }: SectionComponentProps) {
  const testimonials = props as TestimonialsProps;
  return (
    <section className="bg-surface px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {testimonials.headline ? (
          <h2 className="mb-8 text-center text-2xl font-semibold text-primary">
            {testimonials.headline}
          </h2>
        ) : null}
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.items.map((item, index) => (
            <Card key={`${item.author}-${index}`}>
              <blockquote className="text-base italic text-primary">&ldquo;{item.quote}&rdquo;</blockquote>
              <footer className="mt-4 text-sm text-muted">
                <span className="font-semibold">{item.author}</span>
                {item.role ? <span> — {item.role}</span> : null}
              </footer>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
