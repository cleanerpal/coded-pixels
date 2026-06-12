import Link from 'next/link';
import type { FeatureId } from '@codedpixels/shared-types';
import { Card } from '@codedpixels/ui';

import { FEATURES_BY_ID } from '@/lib/features/catalogue';

interface FeatureUpgradeCtaProps {
  featureId: FeatureId;
  title: string;
  description: string;
}

/** Shown when tenant lacks a gated add-on (add-on-deliverables.md §5). */
export function FeatureUpgradeCta({
  featureId,
  title,
  description,
}: FeatureUpgradeCtaProps) {
  const feature = FEATURES_BY_ID[featureId];
  const priceLabel = feature
    ? `+£${(feature.monthlyPence / 100).toFixed(2)}/mo`
    : null;

  return (
    <Card className="mx-auto max-w-lg px-6 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Add-on required
      </p>
      <h2 className="mt-2 text-xl font-bold text-text">{title}</h2>
      <p className="mt-3 text-sm text-text-muted">{description}</p>
      {priceLabel ? (
        <p className="mt-2 text-sm font-medium text-text">{priceLabel}</p>
      ) : null}
      <Link
        href="/dashboard/billing"
        className="builder-focus-ring mt-6 inline-flex min-h-11 items-center rounded-card bg-accent px-5 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
      >
        Upgrade plan
      </Link>
    </Card>
  );
}
