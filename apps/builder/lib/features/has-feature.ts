import type { FeatureId } from '@codedpixels/shared-types';

export function companyHasFeature(
  featureIds: readonly FeatureId[] | undefined,
  featureId: FeatureId,
): boolean {
  return (featureIds ?? []).includes(featureId);
}

export function hasCrm(featureIds: readonly FeatureId[] | undefined): boolean {
  return companyHasFeature(featureIds, 'crm');
}

export function hasEcommerce(
  featureIds: readonly FeatureId[] | undefined,
): boolean {
  return companyHasFeature(featureIds, 'ecommerce');
}
