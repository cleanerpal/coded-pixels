'use client';

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import { Badge } from '@codedpixels/ui';
import { FEATURES_BY_ID } from '@/lib/features';
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
import type { ConfigState, FeatureId } from '@codedpixels/shared-types';

export interface Step1TemplatesProps {
  config: ConfigState;
  onConfigChange: (patch: Partial<ConfigState>) => void;
}

const CUSTOM_TEMPLATE_FEATURE = FEATURES_BY_ID['custom-template'];

const CATEGORY_GRADIENT: Record<TemplateCategory, string> = {
  'cleaning-trades': 'from-primary/25 via-primary/10 to-accent/20',
  'beauty-wellness': 'from-accent/25 via-accent/10 to-primary/15',
  'professional-services': 'from-primary/20 to-primary/5',
  retail: 'from-accent/20 to-primary/10',
  hospitality: 'from-primary/15 via-accent/15 to-accent/5',
  education: 'from-accent/15 to-primary/10',
  'general-business': 'from-primary/10 via-accent/10 to-accent/20',
};

type CategoryFilterId = 'all' | TemplateCategory;

function buildCategoryFilters(): { id: CategoryFilterId; label: string }[] {
  const categories: { id: CategoryFilterId; label: string }[] = [];
  const seen = new Set<TemplateCategory>();

  for (const template of TEMPLATES) {
    if (seen.has(template.category)) {
      continue;
    }
    seen.add(template.category);
    categories.push({ id: template.category, label: template.categoryLabel });
  }

  return [{ id: 'all', label: 'All' }, ...categories];
}

function filterTemplatesByCategory(
  activeFilter: CategoryFilterId,
): TemplateDefinition[] {
  if (activeFilter === 'all') {
    return TEMPLATES;
  }
  return TEMPLATES.filter((template) => template.category === activeFilter);
}

function addCustomTemplateFeature(featureIds: FeatureId[]): FeatureId[] {
  if (featureIds.includes('custom-template')) {
    return featureIds;
  }
  const next: FeatureId[] = [...featureIds, 'custom-template'];
  next.sort((a, b) => a.localeCompare(b));
  return next;
}

function formatMonthlyPence(pence: number): string {
  return `+ £${(pence / 100).toFixed(2)}/mo`;
}

function groupTemplatesByCategory(
  templates: TemplateDefinition[],
): { categoryLabel: string; templates: TemplateDefinition[] }[] {
  const groups: { categoryLabel: string; templates: TemplateDefinition[] }[] =
    [];
  const indexByLabel = new Map<string, number>();

  for (const template of templates) {
    const existingIndex = indexByLabel.get(template.categoryLabel);
    if (existingIndex === undefined) {
      indexByLabel.set(template.categoryLabel, groups.length);
      groups.push({ categoryLabel: template.categoryLabel, templates: [template] });
    } else {
      groups[existingIndex].templates.push(template);
    }
  }

  return groups;
}

function TemplateThumbnail({ template }: { template: TemplateDefinition }) {
  return (
    <div
      className={`relative h-24 bg-gradient-to-br ${CATEGORY_GRADIENT[template.category]}`}
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

type TemplateCardProps = {
  template: TemplateDefinition;
  selected: boolean;
  tabIndex: number;
  onSelect: () => void;
  cardRef: (element: HTMLButtonElement | null) => void;
};

function TemplateCard({
  template,
  selected,
  tabIndex,
  onSelect,
  cardRef,
}: TemplateCardProps) {
  const previewUrl = buildPreviewUrl(template.id);

  return (
    <div
      className={`flex w-full flex-col overflow-hidden rounded-card border bg-surface text-left shadow-rest transition-shadow hover:shadow-hover ${
        selected
          ? 'border-primary ring-2 ring-primary'
          : 'border-border hover:border-primary/40'
      }`}
    >
      <button
        ref={cardRef}
        type="button"
        role="radio"
        aria-checked={selected}
        {...(selected ? { 'aria-current': 'true' as const } : {})}
        tabIndex={tabIndex}
        onClick={onSelect}
        className="relative flex w-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <TemplateThumbnail template={template} />
        <div className="flex flex-1 flex-col gap-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-text">{template.name}</span>
            {selected ? (
              <span
                aria-hidden="true"
                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-surface"
              >
                ✓
              </span>
            ) : null}
          </div>
          <p className="text-sm text-text-muted">{template.description}</p>
        </div>
      </button>
      <div className="border-t border-border px-4 py-2">
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Preview ${template.name} template in new tab`}
          className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Preview full site
        </a>
      </div>
    </div>
  );
}

type CustomTemplateCardProps = {
  selected: boolean;
  tabIndex: number;
  billingMode: ConfigState['customTemplateBilling'];
  onSelect: () => void;
  onBillingChange: (oneTime: boolean) => void;
  cardRef: (element: HTMLButtonElement | null) => void;
};

function CustomTemplateCard({
  selected,
  tabIndex,
  billingMode,
  onSelect,
  onBillingChange,
  cardRef,
}: CustomTemplateCardProps) {
  const isOneTime = billingMode === 'one-time';

  return (
    <div
      className={`overflow-hidden rounded-card border bg-surface shadow-rest transition-shadow hover:shadow-hover ${
        selected
          ? 'border-primary ring-2 ring-primary'
          : 'border-border hover:border-primary/40'
      }`}
    >
      <button
        ref={cardRef}
        type="button"
        role="radio"
        aria-checked={selected}
        {...(selected ? { 'aria-current': 'true' as const } : {})}
        tabIndex={tabIndex}
        onClick={onSelect}
        className="relative flex w-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div
          aria-hidden="true"
          className="h-24 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10"
        />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-text">
              {CUSTOM_TEMPLATE_CARD.name}
            </span>
            <Badge variant="accent">{CUSTOM_TEMPLATE_CARD.badge}</Badge>
            {selected ? (
              <span
                aria-hidden="true"
                className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-surface"
              >
                ✓
              </span>
            ) : null}
          </div>
          <p className="text-sm text-text-muted">
            {CUSTOM_TEMPLATE_CARD.description}
          </p>
          <p className="text-sm font-medium text-text">
            {formatMonthlyPence(CUSTOM_TEMPLATE_FEATURE.monthlyPence)}
          </p>
        </div>
      </button>

      {selected ? (
        <div
          className="border-t border-border px-4 pb-4 pt-3"
          role="radiogroup"
          aria-label="Custom template billing"
          onKeyDown={(event) => event.stopPropagation()}
        >
          <p className="mb-2 text-sm text-text-muted">
            {CUSTOM_TEMPLATE_CARD.oneTimeToggleCopy}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              role="radio"
              aria-checked={!isOneTime}
              onClick={() => onBillingChange(false)}
              className={`rounded-card border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                !isOneTime
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-surface text-text hover:border-primary/40'
              }`}
            >
              {formatMonthlyPence(CUSTOM_TEMPLATE_FEATURE.monthlyPence)}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={isOneTime}
              onClick={() => onBillingChange(true)}
              className={`rounded-card border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isOneTime
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-surface text-text hover:border-primary/40'
              }`}
            >
              One-time £149
            </button>
          </div>
          {isOneTime ? (
            <p className="mt-2 text-sm text-text-muted">
              One-time £149 — shown at checkout.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Step1Templates({ config, onConfigChange }: Step1TemplatesProps) {
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const filterChipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const categoryFilters = useMemo(() => buildCategoryFilters(), []);
  const [activeCategoryFilter, setActiveCategoryFilter] =
    useState<CategoryFilterId>('all');

  const filteredTemplates = useMemo(
    () => filterTemplatesByCategory(activeCategoryFilter),
    [activeCategoryFilter],
  );
  const groupedTemplates = useMemo(
    () => groupTemplatesByCategory(filteredTemplates),
    [filteredTemplates],
  );
  const visibleSelectableIds = useMemo(
    () => [
      ...filteredTemplates.map((template) => template.id),
      CUSTOM_TEMPLATE_CARD.id,
    ],
    [filteredTemplates],
  );

  const selectedIndex = visibleSelectableIds.findIndex(
    (id) => id === config.templateId,
  );
  const activeFilterIndex = categoryFilters.findIndex(
    (filter) => filter.id === activeCategoryFilter,
  );

  const focusCardAt = useCallback(
    (index: number) => {
      const clamped =
        ((index % visibleSelectableIds.length) + visibleSelectableIds.length) %
        visibleSelectableIds.length;
      cardRefs.current[clamped]?.focus();
    },
    [visibleSelectableIds.length],
  );

  const focusFilterChipAt = useCallback(
    (index: number) => {
      const clamped =
        ((index % categoryFilters.length) + categoryFilters.length) %
        categoryFilters.length;
      filterChipRefs.current[clamped]?.focus();
      setActiveCategoryFilter(categoryFilters[clamped].id);
    },
    [categoryFilters],
  );

  const handleSelectTemplate = useCallback(
    (templateId: string) => {
      if (templateId === CUSTOM_TEMPLATE_CARD.id) {
        onConfigChange({
          templateId: CUSTOM_TEMPLATE_CARD.id,
          featureIds: addCustomTemplateFeature(config.featureIds),
        });
        return;
      }

      onConfigChange({ templateId });
    },
    [config.featureIds, onConfigChange],
  );

  const handleBillingChange = useCallback(
    (oneTime: boolean) => {
      onConfigChange({
        customTemplateBilling: oneTime ? 'one-time' : undefined,
      });
    },
    [onConfigChange],
  );

  const handleFilterKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      if (
        key !== 'ArrowRight' &&
        key !== 'ArrowDown' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowUp' &&
        key !== 'Home' &&
        key !== 'End'
      ) {
        return;
      }

      event.preventDefault();

      const currentIndex = activeFilterIndex >= 0 ? activeFilterIndex : 0;

      if (key === 'Home') {
        focusFilterChipAt(0);
        return;
      }

      if (key === 'End') {
        focusFilterChipAt(categoryFilters.length - 1);
        return;
      }

      const delta = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1;
      const nextIndex =
        ((currentIndex + delta) % categoryFilters.length +
          categoryFilters.length) %
        categoryFilters.length;
      focusFilterChipAt(nextIndex);
    },
    [activeFilterIndex, categoryFilters.length, focusFilterChipAt],
  );

  const handleRadioGroupKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      if (
        key !== 'ArrowRight' &&
        key !== 'ArrowDown' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowUp' &&
        key !== 'Home' &&
        key !== 'End'
      ) {
        return;
      }

      event.preventDefault();

      const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;

      if (key === 'Home') {
        focusCardAt(0);
        handleSelectTemplate(visibleSelectableIds[0]);
        return;
      }

      if (key === 'End') {
        const lastIndex = visibleSelectableIds.length - 1;
        focusCardAt(lastIndex);
        handleSelectTemplate(visibleSelectableIds[lastIndex]);
        return;
      }

      const delta = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1;
      const nextIndex =
        ((currentIndex + delta) % visibleSelectableIds.length +
          visibleSelectableIds.length) %
        visibleSelectableIds.length;
      focusCardAt(nextIndex);
      handleSelectTemplate(visibleSelectableIds[nextIndex]);
    },
    [focusCardAt, handleSelectTemplate, selectedIndex, visibleSelectableIds],
  );

  const customCardIndex = filteredTemplates.length;
  const customSelected = config.templateId === CUSTOM_TEMPLATE_CARD.id;
  const customTabIndex =
    customSelected || (selectedIndex === -1 && customCardIndex === 0) ? 0 : -1;

  let cardIndex = 0;

  return (
    <section aria-labelledby="step1-templates-title">
      <h2 id="step1-templates-title" className="text-xl font-bold text-text">
        Choose your starter website
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        All templates included on every plan — pick a design to start, then
        customise.
      </p>

      <div
        role="radiogroup"
        aria-labelledby="step1-category-filter-label"
        className="mt-6 flex flex-wrap gap-2"
        onKeyDown={handleFilterKeyDown}
      >
        <span id="step1-category-filter-label" className="sr-only">
          Filter by category
        </span>
        {categoryFilters.map(({ id, label }, index) => {
          const selected = activeCategoryFilter === id;
          const tabIndex =
            selected || (activeFilterIndex === -1 && index === 0) ? 0 : -1;

          return (
            <button
              key={id}
              ref={(element) => {
                filterChipRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={tabIndex}
              onClick={() => setActiveCategoryFilter(id)}
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
        {filteredTemplates.length === 1
          ? 'Showing 1 starter design'
          : `Showing ${filteredTemplates.length} starter designs`}
      </p>

      <div
        role="radiogroup"
        aria-labelledby="step1-templates-title"
        className="mt-6 space-y-8"
        onKeyDown={handleRadioGroupKeyDown}
      >
        {groupedTemplates.map(({ categoryLabel, templates }) => {
          const headingId = `template-category-${categoryLabel.replace(/\s+/g, '-').toLowerCase()}`;

          return (
            <div key={categoryLabel} role="group" aria-labelledby={headingId}>
              <h3
                id={headingId}
                className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted"
              >
                {categoryLabel}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => {
                  const index = cardIndex;
                  cardIndex += 1;
                  const selected = config.templateId === template.id;
                  const tabIndex =
                    selected || (selectedIndex === -1 && index === 0) ? 0 : -1;

                  return (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      selected={selected}
                      tabIndex={tabIndex}
                      onSelect={() => handleSelectTemplate(template.id)}
                      cardRef={(element) => {
                        cardRefs.current[index] = element;
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        <div role="group" aria-labelledby="template-category-custom">
          <h3
            id="template-category-custom"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted"
          >
            Bespoke
          </h3>
          <div className="max-w-md">
            <CustomTemplateCard
              selected={customSelected}
              tabIndex={customTabIndex}
              billingMode={config.customTemplateBilling}
              onSelect={() => handleSelectTemplate(CUSTOM_TEMPLATE_CARD.id)}
              onBillingChange={handleBillingChange}
              cardRef={(element) => {
                cardRefs.current[customCardIndex] = element;
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
