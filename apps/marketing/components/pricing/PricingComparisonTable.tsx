'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  BASE_PLAN_ROWS,
  FEATURES,
  PACKAGES,
  cardDiffersFromLive,
  configurePlanHref,
  formatMonthlyPrice,
  packageDisplayPrice,
  packageIncludesFeature,
  packageLiveMonthlyPence,
} from '@/lib/pricing-comparison';
import type { BillingCycle } from '@codedpixels/shared-types';

function CheckIcon() {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-sm font-bold text-success"
      aria-hidden="true"
    >
      ✓
    </span>
  );
}

function IncludedCell({ included }: { included: boolean }) {
  if (included) {
    return (
      <span className="inline-flex items-center justify-center">
        <CheckIcon />
        <span className="sr-only">Included</span>
      </span>
    );
  }

  return (
    <span className="text-text-muted" aria-hidden="true">
      —
    </span>
  );
}

function CustomCell() {
  return (
    <span className="text-xs text-text-muted">
      Optional
      <span className="sr-only"> — choose in configurator</span>
    </span>
  );
}

export function PricingComparisonTable() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  return (
    <section aria-labelledby="comparison-heading" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="comparison-heading"
            className="text-2xl font-bold text-text sm:text-3xl"
          >
            Full feature comparison
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Static overview — configure any plan to see your live total.
          </p>
        </div>

        <div
          className="inline-flex rounded-card border border-border bg-surface p-1"
          role="group"
          aria-label="Billing cycle for table prices"
        >
          <button
            type="button"
            aria-pressed={billingCycle === 'monthly'}
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-card px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              billingCycle === 'monthly'
                ? 'bg-primary text-surface'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={billingCycle === 'annual'}
            onClick={() => setBillingCycle('annual')}
            className={`rounded-card px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              billingCycle === 'annual'
                ? 'bg-primary text-surface'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Annual (save 17%)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-rest">
        <table className="min-w-[720px] w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Feature comparison across Starter, Growth, Pro, and Custom packages
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-surface px-4 py-4 font-semibold text-text"
              >
                Feature
              </th>
              {PACKAGES.map((pkg) => {
                const { primary, secondary } = packageDisplayPrice(
                  pkg.id,
                  billingCycle,
                );

                return (
                  <th
                    key={pkg.id}
                    scope="col"
                    className="min-w-[140px] px-4 py-4 align-top"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-text">{pkg.name}</p>
                      <p className="text-lg font-bold text-accent">{primary}</p>
                      {secondary ? (
                        <p className="text-xs text-text-muted">{secondary}</p>
                      ) : null}
                      {billingCycle === 'monthly' &&
                      cardDiffersFromLive(pkg.id) ? (
                        <p className="text-xs text-text-muted">
                          Live total{' '}
                          {formatMonthlyPrice(packageLiveMonthlyPence(pkg.id))}
                        </p>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border bg-background/60">
              <th
                scope="row"
                colSpan={5}
                className="sticky left-0 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted"
              >
                Base plan (included)
              </th>
            </tr>
            {BASE_PLAN_ROWS.map((label) => (
              <tr key={label} className="border-b border-border">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface px-4 py-3 font-normal text-text"
                >
                  {label}
                </th>
                {PACKAGES.map((pkg) => (
                  <td key={pkg.id} className="px-4 py-3 text-center">
                    <IncludedCell included />
                  </td>
                ))}
              </tr>
            ))}

            <tr className="border-b border-border bg-background/60">
              <th
                scope="row"
                colSpan={5}
                className="sticky left-0 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted"
              >
                Add-on features
              </th>
            </tr>
            {FEATURES.map((feature) => (
              <tr key={feature.id} className="border-b border-border">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface px-4 py-3 font-normal text-text"
                >
                  <span className="block">{feature.name}</span>
                  <span className="mt-0.5 block text-xs text-text-muted">
                    + {formatMonthlyPrice(feature.monthlyPence)}
                  </span>
                </th>
                {PACKAGES.map((pkg) => (
                  <td key={pkg.id} className="px-4 py-3 text-center">
                    {pkg.id === 'custom' ? (
                      <CustomCell />
                    ) : (
                      <IncludedCell
                        included={packageIncludesFeature(
                          pkg.id,
                          feature.id,
                        )}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}

            <tr>
              <td className="sticky left-0 z-10 bg-surface px-4 py-4" />
              {PACKAGES.map((pkg) => (
                <td key={pkg.id} className="px-4 py-4 text-center">
                  <Link
                    href={configurePlanHref(pkg.id)}
                    className="inline-flex text-sm font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Configure this plan →
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-text-muted" id="pricing-card-footnote">
        Package card prices are rounded marketing labels. Your live total in the
        configurator may differ slightly — for example, Growth shows{' '}
        {formatMonthlyPrice(2499)} on the card but{' '}
        {formatMonthlyPrice(2496)} in the summary. The configurator total is
        always authoritative.
        {billingCycle === 'annual'
          ? ' Annual prices show the monthly equivalent after the 17% discount.'
          : null}
      </p>
    </section>
  );
}
