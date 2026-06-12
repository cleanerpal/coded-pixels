import { FEATURES } from '@/lib/features';
import { PACKAGES_BY_ID } from '@/lib/packages';
import { ALL_TEMPLATE_IDS } from '@/lib/templates';
import type {
  BillingCycle,
  ConfigState,
  CustomTemplateBilling,
  FeatureId,
  PackageId,
} from '@/types';

/** Starter defaults — used when params are missing or fully invalid (Q40). */
export const STARTER_DEFAULTS: ConfigState = {
  templateId: null,
  featureIds: [],
  billingCycle: 'monthly',
};

const VALID_TEMPLATE_IDS = new Set<string>(ALL_TEMPLATE_IDS);
const VALID_FEATURE_IDS = new Set<FeatureId>(FEATURES.map((f) => f.id));
const VALID_BILLING_CYCLES = new Set<BillingCycle>(['monthly', 'annual']);
const VALID_CUSTOM_TEMPLATE_BILLING = new Set<CustomTemplateBilling>([
  'recurring',
  'one-time',
]);
const VALID_PACKAGE_IDS = new Set<PackageId>(
  Object.keys(PACKAGES_BY_ID) as PackageId[],
);

export interface DecodeConfigResult {
  config: ConfigState;
  /** True when any param was missing, invalid, or partially rejected (Q40 toast). */
  hadInvalidParams: boolean;
}

type SearchParamInput =
  | URLSearchParams
  | Record<string, string | string[] | null | undefined>;

function getParam(
  params: SearchParamInput,
  key: string,
): { present: boolean; value: string | undefined } {
  if (params instanceof URLSearchParams) {
    if (!params.has(key)) {
      return { present: false, value: undefined };
    }
    return { present: true, value: params.get(key) ?? undefined };
  }

  if (!(key in params)) {
    return { present: false, value: undefined };
  }

  const raw = params[key];
  if (raw == null) {
    return { present: true, value: undefined };
  }
  if (Array.isArray(raw)) {
    return { present: true, value: raw.join(',') };
  }
  return { present: true, value: raw };
}

function parseFeatureIds(
  raw: string | undefined,
): { featureIds: FeatureId[]; hadInvalid: boolean } {
  if (raw === undefined || raw.trim() === '') {
    return { featureIds: [], hadInvalid: false };
  }

  const tokens = raw.split(',').map((token) => token.trim());
  const featureIds: FeatureId[] = [];
  let hadInvalid = false;
  const seen = new Set<FeatureId>();

  for (const token of tokens) {
    if (token === '') {
      hadInvalid = true;
      continue;
    }
    if (!VALID_FEATURE_IDS.has(token as FeatureId)) {
      hadInvalid = true;
      continue;
    }
    const id = token as FeatureId;
    if (!seen.has(id)) {
      seen.add(id);
      featureIds.push(id);
    }
  }

  featureIds.sort((a, b) => a.localeCompare(b));
  return { featureIds, hadInvalid };
}

function customTemplateBillingApplies(config: Pick<ConfigState, 'templateId' | 'featureIds'>): boolean {
  return (
    config.templateId === 'custom' ||
    config.featureIds.includes('custom-template')
  );
}

function normalizeCustomTemplateBilling(
  config: Pick<ConfigState, 'templateId' | 'featureIds' | 'customTemplateBilling'>,
): CustomTemplateBilling | undefined {
  if (!customTemplateBillingApplies(config)) {
    return undefined;
  }
  if (config.customTemplateBilling === 'one-time') {
    return 'one-time';
  }
  return undefined;
}

/** Encode configurator state into URL search params for shareable links. */
export function encodeConfigToParams(config: ConfigState): URLSearchParams {
  const params = new URLSearchParams();
  const normalized: ConfigState = {
    ...config,
    featureIds: [...new Set(config.featureIds)].sort((a, b) => a.localeCompare(b)),
    customTemplateBilling: normalizeCustomTemplateBilling(config),
  };

  if (normalized.templateId) {
    params.set('template', normalized.templateId);
  }

  if (normalized.featureIds.length > 0) {
    params.set('features', normalized.featureIds.join(','));
  }

  if (normalized.billingCycle !== 'monthly') {
    params.set('billing', normalized.billingCycle);
  }

  if (
    normalized.customTemplateBilling === 'one-time' &&
    customTemplateBillingApplies(normalized)
  ) {
    params.set('customTemplate', 'one-time');
  }

  if (normalized.packageId) {
    params.set('package', normalized.packageId);
  }

  return params;
}

/** Decode URL search params into configurator state with partial restore (Q40). */
export function decodeConfigFromParams(params: SearchParamInput): DecodeConfigResult {
  let hadInvalidParams = false;
  const config: ConfigState = { ...STARTER_DEFAULTS };

  const templateParam = getParam(params, 'template');
  if (templateParam.present) {
    const value = templateParam.value?.trim() ?? '';
    if (value === '') {
      hadInvalidParams = true;
      config.templateId = null;
    } else if (VALID_TEMPLATE_IDS.has(value)) {
      config.templateId = value;
    } else {
      hadInvalidParams = true;
      config.templateId = null;
    }
  }

  const featuresParam = getParam(params, 'features');
  const packageParam = getParam(params, 'package');

  if (packageParam.present) {
    const value = packageParam.value?.trim() ?? '';
    if (value === '' || !VALID_PACKAGE_IDS.has(value as PackageId)) {
      hadInvalidParams = true;
    } else {
      config.packageId = value as PackageId;
    }
  }

  if (featuresParam.present) {
    const parsed = parseFeatureIds(featuresParam.value);
    config.featureIds = parsed.featureIds;
    if (parsed.hadInvalid) {
      hadInvalidParams = true;
    }
  } else if (config.packageId) {
    config.featureIds = [...PACKAGES_BY_ID[config.packageId].presetFeatureIds];
  }

  const billingParam = getParam(params, 'billing');
  if (billingParam.present) {
    const value = billingParam.value?.trim() ?? '';
    if (value === '' || !VALID_BILLING_CYCLES.has(value as BillingCycle)) {
      hadInvalidParams = true;
      config.billingCycle = STARTER_DEFAULTS.billingCycle;
    } else {
      config.billingCycle = value as BillingCycle;
    }
  }

  const customTemplateParam = getParam(params, 'customTemplate');
  if (customTemplateParam.present) {
    const value = customTemplateParam.value?.trim() ?? '';
    if (
      value === '' ||
      !VALID_CUSTOM_TEMPLATE_BILLING.has(value as CustomTemplateBilling)
    ) {
      hadInvalidParams = true;
    } else if (value === 'one-time') {
      if (customTemplateBillingApplies(config)) {
        config.customTemplateBilling = 'one-time';
      } else {
        hadInvalidParams = true;
      }
    } else if (value === 'recurring' && customTemplateBillingApplies(config)) {
      config.customTemplateBilling = undefined;
    } else if (value === 'recurring') {
      hadInvalidParams = true;
    }
  }

  config.customTemplateBilling = normalizeCustomTemplateBilling(config);

  return { config, hadInvalidParams };
}

/** Round-trip helper — returns a query string without leading `?`. */
export function encodeConfigToQueryString(config: ConfigState): string {
  return encodeConfigToParams(config).toString();
}

/** Parse a full query string (with or without leading `?`). */
export function decodeConfigFromQueryString(query: string): DecodeConfigResult {
  const normalized = query.startsWith('?') ? query.slice(1) : query;
  return decodeConfigFromParams(new URLSearchParams(normalized));
}
