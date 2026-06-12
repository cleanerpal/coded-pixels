import type { FeatureId } from '@codedpixels/shared-types';

export interface FeatureDefinitionLocal {
  id: FeatureId;
  name: string;
  description: string;
  monthlyPence: number;
  group: 'growth' | 'ecommerce';
}

/** Subset of marketing catalogue for dashboard upgrade CTAs. */
export const FEATURES: FeatureDefinitionLocal[] = [
  {
    id: 'crm',
    name: 'CRM & Lead Management',
    description: 'Capture and manage leads from your site',
    monthlyPence: 499,
    group: 'growth',
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce Store',
    description: 'Products and shop sections on your site',
    monthlyPence: 999,
    group: 'ecommerce',
  },
];

export const FEATURES_BY_ID = FEATURES.reduce(
  (acc, feature) => {
    acc[feature.id] = feature;
    return acc;
  },
  {} as Partial<Record<FeatureId, FeatureDefinitionLocal>>,
);
