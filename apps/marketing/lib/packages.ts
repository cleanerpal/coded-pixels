import { BASE_PLAN_MONTHLY_PENCE } from '@/lib/features';
import type { FeatureId, PackageId } from '@codedpixels/shared-types';

export interface PackageDefinition {
  id: PackageId;
  name: string;
  description: string;
  presetFeatureIds: FeatureId[];
  /**
   * Marketing label on package card in pence.
   * Growth/Pro may differ from live engine total (Q1, Q54).
   * null = calculated / no fixed card price (Custom).
   */
  cardDisplayMonthlyPence: number | null;
}

/** Growth package preset feature IDs */
export const GROWTH_PRESET_FEATURE_IDS: FeatureId[] = [
  'crm',
  'email-automation',
  'analytics-seo',
];

/** Pro package preset = Growth + ecommerce + vat-mtd */
export const PRO_PRESET_FEATURE_IDS: FeatureId[] = [
  ...GROWTH_PRESET_FEATURE_IDS,
  'ecommerce',
  'vat-mtd',
];

export const PACKAGES: PackageDefinition[] = [
  {
    id: 'starter',
    name: 'Starter',
    description:
      'Any starter design included — template choice does not change the £9.99/mo base',
    presetFeatureIds: [],
    cardDisplayMonthlyPence: BASE_PLAN_MONTHLY_PENCE,
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Base + CRM, email automation, and analytics',
    presetFeatureIds: GROWTH_PRESET_FEATURE_IDS,
    cardDisplayMonthlyPence: 2499,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Growth + ecommerce and VAT automation',
    presetFeatureIds: PRO_PRESET_FEATURE_IDS,
    cardDisplayMonthlyPence: 3999,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Build your own plan',
    presetFeatureIds: [],
    cardDisplayMonthlyPence: null,
  },
];

export const PACKAGES_BY_ID: Record<PackageId, PackageDefinition> =
  PACKAGES.reduce(
    (acc, pkg) => {
      acc[pkg.id] = pkg;
      return acc;
    },
    {} as Record<PackageId, PackageDefinition>,
  );
