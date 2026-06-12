import type { FeatureId } from '@codedpixels/shared-types';

/**
 * Section types that require an add-on featureId on the site doc.
 * builder-ui-spec.md §3.2 · add-on-deliverables.md
 */
export const GATED_SECTION_TYPES: Readonly<Record<string, FeatureId>> = {
  'product-grid': 'ecommerce',
  'product-detail': 'ecommerce',
  'cart-summary': 'ecommerce',
  'booking-widget': 'booking',
};

export function getRequiredFeatureId(sectionType: string): FeatureId | undefined {
  return GATED_SECTION_TYPES[sectionType];
}

export function isFeatureEnabled(
  featureIds: readonly string[],
  requiredFeatureId: FeatureId,
): boolean {
  return featureIds.includes(requiredFeatureId);
}
