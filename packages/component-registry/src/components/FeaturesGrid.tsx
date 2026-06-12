import { Card } from '@codedpixels/ui';
import type { SectionComponentProps } from '../types';
import type { FeaturesGridProps } from '../schemas/features-grid';

const columnClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function FeaturesGrid({ props }: SectionComponentProps) {
  const grid = props as FeaturesGridProps;
  const columns = grid.columns ?? 3;
  const gridClass = columnClasses[columns] ?? columnClasses[3];

  return (
    <section className="bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {grid.headline ? (
          <h2 className="mb-8 text-center text-2xl font-semibold text-primary">
            {grid.headline}
          </h2>
        ) : null}
        <div className={`grid gap-6 ${gridClass}`}>
          {grid.items.map((item, index) => (
            <Card key={`${item.title}-${index}`}>
              {item.icon ? (
                <span className="mb-2 block text-sm font-medium text-accent">{item.icon}</span>
              ) : null}
              <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
