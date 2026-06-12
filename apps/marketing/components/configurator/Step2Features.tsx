'use client';

import { Card } from '@codedpixels/ui';
import { FEATURES, type FeatureDefinition, type FeatureGroup } from '@/lib/features';
import type { ConfigState, FeatureId } from '@codedpixels/shared-types';

import { SiteImportWaitlistCard } from './SiteImportWaitlistCard';

const CORE_INCLUDED_ITEMS = [
  {
    id: 'website-hosting',
    name: 'Professional website + hosting',
    description: 'Fast, secure hosting for your business site',
  },
  {
    id: 'domain-ssl',
    name: 'Custom domain + SSL',
    description: 'Your own web address with HTTPS included',
  },
  {
    id: 'mobile-responsive',
    name: 'Mobile responsive',
    description: 'Looks great on phones, tablets, and desktop',
  },
  {
    id: 'contact-form',
    name: 'Basic contact / quote form',
    description: 'Capture enquiries from day one',
  },
  {
    id: 'template-library',
    name: 'Access to template library',
    description: 'Choose from professional industry templates',
  },
] as const;

const GROUP_ORDER: { key: FeatureGroup | 'core'; label: string }[] = [
  { key: 'core', label: 'Core (included)' },
  { key: 'growth', label: 'Growth' },
  { key: 'optional', label: 'Optional add-ons' },
  { key: 'ecommerce', label: 'Ecommerce' },
  { key: 'automation', label: 'Automation' },
  { key: 'advanced', label: 'Advanced' },
];

export interface Step2FeaturesProps {
  config: ConfigState;
  onConfigChange: (patch: Partial<ConfigState>) => void;
}

function formatAddonPrice(monthlyPence: number): string {
  return `+ £${(monthlyPence / 100).toFixed(2)}/mo`;
}

function featuresForGroup(group: FeatureGroup): FeatureDefinition[] {
  return FEATURES.filter((feature) => feature.group === group);
}

function toggleFeatureIds(
  featureIds: FeatureId[],
  featureId: FeatureId,
  enabled: boolean,
): FeatureId[] {
  if (enabled) {
    return featureIds.includes(featureId)
      ? featureIds
      : [...featureIds, featureId];
  }
  return featureIds.filter((id) => id !== featureId);
}

interface FeatureSwitchProps {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  checked: boolean;
  disabled?: boolean;
  onToggle?: () => void;
}

function FeatureSwitch({
  id,
  name,
  description,
  priceLabel,
  checked,
  disabled = false,
  onToggle,
}: FeatureSwitchProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block text-sm font-semibold text-text">
          {name}
        </label>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
        <p className="mt-2 text-sm font-medium text-text">{priceLabel}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${name} — ${priceLabel}`}
        disabled={disabled}
        onClick={onToggle}
        className={`relative mt-1 h-6 w-11 shrink-0 rounded-pill transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${checked ? 'bg-primary' : 'bg-border'}`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface shadow-rest transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function Step2Features({ config, onConfigChange }: Step2FeaturesProps) {
  function handleFeatureToggle(featureId: FeatureId, enabled: boolean) {
    onConfigChange({
      featureIds: toggleFeatureIds(config.featureIds, featureId, enabled),
    });
  }

  return (
    <section aria-labelledby="step2-features-heading">
      <h3 id="step2-features-heading" className="text-lg font-semibold text-text">
        Choose your features
      </h3>
      <p className="mt-1 text-sm text-text-muted">
        Toggle add-ons to build your plan. Every price is per month.
      </p>

      <div className="mt-6 space-y-8">
        {GROUP_ORDER.map(({ key, label }) => (
          <div key={key}>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              {label}
            </h4>

            {key === 'core' ? (
              <Card className="mt-3">
                {CORE_INCLUDED_ITEMS.map((item) => (
                  <FeatureSwitch
                    key={item.id}
                    id={`core-${item.id}`}
                    name={item.name}
                    description={item.description}
                    priceLabel="Included · £0.00"
                    checked
                    disabled
                  />
                ))}
              </Card>
            ) : (
              <Card className="mt-3">
                {featuresForGroup(key).map((feature) => {
                  const enabled = config.featureIds.includes(feature.id);
                  return (
                    <FeatureSwitch
                      key={feature.id}
                      id={`feature-${feature.id}`}
                      name={feature.name}
                      description={feature.description}
                      priceLabel={formatAddonPrice(feature.monthlyPence)}
                      checked={enabled}
                      onToggle={() => handleFeatureToggle(feature.id, !enabled)}
                    />
                  );
                })}

                {key === 'advanced' ? (
                  <SiteImportWaitlistCard config={config} />
                ) : null}
              </Card>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
