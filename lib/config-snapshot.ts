import { FEATURES_BY_ID } from '@/lib/features';
import {
  annualTotalPence,
  monthlyTotalPence,
  oneTimeFeesPence,
} from '@/lib/pricing';
import { CUSTOM_TEMPLATE_CARD, TEMPLATES_BY_ID } from '@/lib/templates';
import type { ConfigSnapshot, ConfigState, FeatureId } from '@/types';

/** Sentinel when no template selected — satisfies schema min length (Q17 waitlist). */
export const UNSET_TEMPLATE_ID = 'unset';

/** Build Callable config snapshot from live configurator state. */
export function buildConfigSnapshot(config: ConfigState): ConfigSnapshot {
  const snapshot: ConfigSnapshot = {
    templateId: config.templateId ?? UNSET_TEMPLATE_ID,
    featureIds: [...new Set(config.featureIds)].sort((a, b) => a.localeCompare(b)),
    billingCycle: config.billingCycle,
    monthlyTotalPence: monthlyTotalPence(config),
  };

  if (config.billingCycle === 'annual') {
    snapshot.annualTotalPence = annualTotalPence(config);
  }

  const oneTime = oneTimeFeesPence(config);
  if (oneTime > 0) {
    snapshot.oneTimeFeesPence = oneTime;
  }

  if (config.customTemplateBilling) {
    snapshot.customTemplateBilling = config.customTemplateBilling;
  }

  if (config.packageId) {
    snapshot.packageId = config.packageId;
  }

  return snapshot;
}

/** Human-readable template label for success summary (Q12). */
export function getTemplateDisplayName(templateId: string): string {
  if (templateId === UNSET_TEMPLATE_ID) {
    return 'Not selected';
  }

  if (templateId === CUSTOM_TEMPLATE_CARD.id) {
    return CUSTOM_TEMPLATE_CARD.name;
  }

  return TEMPLATES_BY_ID[templateId]?.name ?? templateId;
}

/** Compact add-on summary — top 3 names plus "+N more" (Q12). */
export function formatAddonSummary(featureIds: FeatureId[]): string {
  if (featureIds.length === 0) {
    return 'No add-ons';
  }

  const names = featureIds.map((id) => FEATURES_BY_ID[id].name);
  if (names.length <= 3) {
    return names.join(', ');
  }

  return `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
}
