'use client';

import { Badge } from '@codedpixels/ui';
import { BASE_PLAN_MONTHLY_PENCE } from '@/lib/features';
import { PACKAGES } from '@/lib/packages';
import { applyPackage } from '@/lib/pricing';
import type { ConfigState, PackageId } from '@codedpixels/shared-types';

export interface PackageCardsProps {
  config: ConfigState;
  onConfigChange: (patch: Partial<ConfigState>) => void;
}

/** Marketing card label — live total in summary is authoritative (Q1, Q54). */
function formatCardPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}/mo`;
}

const CARD_FOOTNOTE = 'Exact total shown in summary.';

export function PackageCards({ config, onConfigChange }: PackageCardsProps) {
  function handleSelect(packageId: PackageId) {
    const applied = applyPackage(packageId);
    onConfigChange({
      featureIds: applied.featureIds,
      packageId: applied.packageId,
      billingCycle: applied.billingCycle,
    });
  }

  return (
    <section aria-label="Recommended packages" className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PACKAGES.map((pkg) => {
          const isSelected = config.packageId === pkg.id;

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => handleSelect(pkg.id)}
              aria-pressed={isSelected}
              className={`relative flex h-full flex-col rounded-card border bg-surface p-4 text-left shadow-rest transition-shadow hover:shadow-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border'
              }`}
            >
              {pkg.id === 'growth' ? (
                <Badge variant="primary" className="mb-3 self-start">
                  Most Popular
                </Badge>
              ) : null}

              <h3 className="text-lg font-semibold text-text">{pkg.name}</h3>
              <p className="mt-1 flex-1 text-sm text-text-muted">
                {pkg.description}
              </p>

              <div className="mt-4 space-y-1">
                {pkg.cardDisplayMonthlyPence !== null ? (
                  <p className="text-xl font-bold text-text">
                    {formatCardPrice(pkg.cardDisplayMonthlyPence)}
                  </p>
                ) : (
                  <p className="text-xl font-bold text-text">
                    From {formatCardPrice(BASE_PLAN_MONTHLY_PENCE)}
                  </p>
                )}

                <p className="text-xs text-text-muted">{CARD_FOOTNOTE}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
