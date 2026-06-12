'use client';

import { useState } from 'react';

import { PackageCards } from '@/components/configurator/PackageCards';
import { PricingComparisonTable } from '@/components/pricing/PricingComparisonTable';
import { STARTER_DEFAULTS } from '@/lib/config-state';
import type { ConfigState } from '@codedpixels/shared-types';

export function PricingPageContent() {
  const [config, setConfig] = useState<ConfigState>(STARTER_DEFAULTS);

  function handleConfigChange(patch: Partial<ConfigState>) {
    setConfig((current) => ({ ...current, ...patch }));
  }

  return (
    <div className="space-y-16">
      <section aria-labelledby="packages-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="packages-heading"
            className="text-2xl font-bold text-text sm:text-3xl"
          >
            Choose a package
          </h2>
          <p className="mt-3 text-text-muted">
            Upgrade or downgrade anytime — no lock-in contracts.
          </p>
        </div>

        <div className="mt-8">
          <PackageCards config={config} onConfigChange={handleConfigChange} />
        </div>
      </section>

      <PricingComparisonTable />
    </div>
  );
}
