'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Badge } from '@codedpixels/ui';
import {
  buildPreviewUrl,
  getTemplatePreviewThumbnailPath,
} from '@/lib/template-preview-urls';
import {
  CUSTOM_TEMPLATE_CARD,
  TEMPLATES,
  type TemplateCategory,
  type TemplateDefinition,
} from '@/lib/templates';

type FilterId = 'all' | TemplateCategory | 'bespoke';

const CATEGORY_GRADIENT: Record<TemplateCategory, string> = {
  'cleaning-trades': 'from-primary/25 via-primary/10 to-accent/20',
  'beauty-wellness': 'from-accent/25 via-accent/10 to-primary/15',
  'professional-services': 'from-primary/20 to-primary/5',
  retail: 'from-accent/20 to-primary/10',
  hospitality: 'from-primary/15 via-accent/15 to-accent/5',
  education: 'from-accent/15 to-primary/10',
  'general-business': 'from-primary/10 via-accent/10 to-accent/20',
};

function configuratorHref(templateId: string): string {
  return `/?template=${encodeURIComponent(templateId)}#configurator`;
}

function buildCategoryFilters(): { id: FilterId; label: string }[] {
  const categories: { id: FilterId; label: string }[] = [];
  const seen = new Set<TemplateCategory>();

  for (const template of TEMPLATES) {
    if (seen.has(template.category)) {
      continue;
    }
    seen.add(template.category);
    categories.push({ id: template.category, label: template.categoryLabel });
  }

  return [{ id: 'all', label: 'All' }, ...categories, { id: 'bespoke', label: 'Bespoke' }];
}

function filterTemplates(activeFilter: FilterId): TemplateDefinition[] {
  if (activeFilter === 'all') {
    return TEMPLATES;
  }
  if (activeFilter === 'bespoke') {
    return [];
  }
  return TEMPLATES.filter((template) => template.category === activeFilter);
}

type TemplateThumbnailProps = {
  template: TemplateDefinition;
};

function TemplateThumbnail({ template }: TemplateThumbnailProps) {
  return (
    <div
      className={`relative h-28 overflow-hidden bg-gradient-to-br ${CATEGORY_GRADIENT[template.category]}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- gradient fallback via onError */}
      <img
        src={getTemplatePreviewThumbnailPath(template.id)}
        alt={`${template.name} website preview`}
        className="absolute inset-0 h-full w-full object-cover object-top"
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
      />
    </div>
  );
}

type GalleryTemplateCardProps = {
  template: TemplateDefinition;
};

function GalleryTemplateCard({ template }: GalleryTemplateCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-rest transition-shadow hover:shadow-hover">
      <TemplateThumbnail template={template} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {template.categoryLabel}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-text">{template.name}</h3>
          <p className="mt-1 text-sm text-text-muted">{template.description}</p>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href={configuratorHref(template.id)}
            className="inline-flex items-center justify-center rounded-card bg-accent px-4 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Start with this design
          </Link>
          <a
            href={buildPreviewUrl(template.id)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Preview ${template.name} template in new tab`}
            className="inline-flex items-center justify-center rounded-card border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Preview full site
          </a>
        </div>
      </div>
    </article>
  );
}

function GalleryCustomCard() {
  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-rest transition-shadow hover:shadow-hover">
      <div
        aria-hidden="true"
        className="h-28 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10"
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-text">
              {CUSTOM_TEMPLATE_CARD.name}
            </h3>
            <Badge variant="accent">{CUSTOM_TEMPLATE_CARD.badge}</Badge>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            {CUSTOM_TEMPLATE_CARD.description}
          </p>
        </div>
        <Link
          href={configuratorHref(CUSTOM_TEMPLATE_CARD.id)}
          className="mt-auto inline-flex items-center justify-center rounded-card bg-accent px-4 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Start with this design
        </Link>
      </div>
    </article>
  );
}

export function TemplateGallery() {
  const filters = useMemo(() => buildCategoryFilters(), []);
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  const visibleTemplates = useMemo(
    () => filterTemplates(activeFilter),
    [activeFilter],
  );

  const showCustomCard = activeFilter === 'all' || activeFilter === 'bespoke';
  const resultCount =
    visibleTemplates.length + (showCustomCard ? 1 : 0);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter templates by category"
        className="flex flex-wrap gap-2"
      >
        {filters.map(({ id, label }) => {
          const selected = activeFilter === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActiveFilter(id)}
              className={`rounded-pill border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                selected
                  ? 'border-primary bg-primary text-surface'
                  : 'border-border bg-surface text-text-muted hover:border-primary/40 hover:text-text'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-text-muted" aria-live="polite">
        {resultCount === 1
          ? 'Showing 1 template'
          : `Showing ${resultCount} templates`}
      </p>

      {visibleTemplates.length > 0 ? (
        <ul className="mt-6 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTemplates.map((template) => (
            <li key={template.id}>
              <GalleryTemplateCard template={template} />
            </li>
          ))}
        </ul>
      ) : null}

      {showCustomCard ? (
        <div className={visibleTemplates.length > 0 ? 'mt-8' : 'mt-6'}>
          {activeFilter === 'all' ? (
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">
              Bespoke
            </h2>
          ) : null}
          <ul className="grid max-w-md list-none gap-4">
            <li>
              <GalleryCustomCard />
            </li>
          </ul>
        </div>
      ) : null}

      {visibleTemplates.length === 0 && !showCustomCard ? (
        <p className="mt-6 text-text-muted">No templates in this category.</p>
      ) : null}
    </div>
  );
}
