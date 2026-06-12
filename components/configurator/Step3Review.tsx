'use client';

import { FEATURES_BY_ID } from '@/lib/features';
import { monthlyTotalPence } from '@/lib/pricing';
import { CUSTOM_TEMPLATE_CARD, TEMPLATES_BY_ID } from '@/lib/templates';
import type { ConfigState } from '@/types';

export interface Step3ReviewProps {
  config: ConfigState;
}

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function Step3Review({ config }: Step3ReviewProps) {
  const templateName =
    config.templateId === null
      ? 'Not selected'
      : config.templateId === CUSTOM_TEMPLATE_CARD.id
        ? CUSTOM_TEMPLATE_CARD.name
        : (TEMPLATES_BY_ID[config.templateId]?.name ?? config.templateId);

  const addOns = config.featureIds
    .map((id) => FEATURES_BY_ID[id])
    .filter(Boolean);

  const totalPence = monthlyTotalPence(config);

  return (
    <section aria-labelledby="step3-review-heading">
      <h2 id="step3-review-heading" className="text-xl font-bold text-text">
        Review your plan
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Check your template and features before you get started.
      </p>

      <dl className="mt-6 space-y-4">
        <div className="rounded-card border border-border bg-surface p-4">
          <dt className="text-sm font-medium text-text-muted">Template</dt>
          <dd className="mt-1 text-base font-semibold text-text">
            {templateName}
          </dd>
        </div>

        <div className="rounded-card border border-border bg-surface p-4">
          <dt className="text-sm font-medium text-text-muted">Add-ons</dt>
          <dd className="mt-2">
            {addOns.length > 0 ? (
              <ul className="space-y-2">
                {addOns.map((feature) => (
                  <li
                    key={feature.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="text-text">{feature.name}</span>
                    <span className="shrink-0 tabular-nums text-text-muted">
                      + {formatPence(feature.monthlyPence)}/mo
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">Base plan only</p>
            )}
          </dd>
        </div>

        <div className="rounded-card border border-primary/30 bg-primary/5 p-4">
          <dt className="text-sm font-medium text-text-muted">
            Estimated monthly total
          </dt>
          <dd
            className="mt-1 text-2xl font-bold tabular-nums text-accent"
            aria-live="polite"
          >
            {formatPence(totalPence)}/mo
          </dd>
        </div>
      </dl>
    </section>
  );
}
