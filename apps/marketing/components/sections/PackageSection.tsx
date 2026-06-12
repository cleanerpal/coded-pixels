'use client';

import { useState } from 'react';
import { PackageCards } from '@/components/configurator/PackageCards';
import { STARTER_DEFAULTS } from '@/lib/config-state';
import type { ConfigState } from '@codedpixels/shared-types';

export function PackageSection() {
  const [config, setConfig] = useState<ConfigState>(STARTER_DEFAULTS);

  function handleConfigChange(patch: Partial<ConfigState>) {
    setConfig((current) => ({ ...current, ...patch }));
  }

  return (
    <section
      aria-labelledby="packages-heading"
      className="border-b border-border bg-surface py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="packages-heading"
            className="text-2xl font-bold text-text sm:text-3xl"
          >
            Recommended packages
          </h2>
          <p className="mt-3 text-text-muted">
            Upgrade or downgrade anytime — no lock-in contracts.
          </p>
        </div>

        <div className="mt-8">
          <PackageCards config={config} onConfigChange={handleConfigChange} />
        </div>
      </div>
    </section>
  );
}
