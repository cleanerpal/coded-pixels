/**
 * Canonical JSON for contentHash — keys sorted recursively (template-seeding-ci-spec §5.1)
 * @param {unknown} value
 * @returns {unknown}
 */
export function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonicalize(/** @type {Record<string, unknown>} */ (value)[key]);
        return acc;
      }, /** @type {Record<string, unknown>} */ ({}));
  }
  return value;
}

/**
 * Payload hashed for idempotency — metadata, defaultPage (no sections), defaultSections
 * @param {import('./schemas.mjs').TemplateSeed} seed
 */
export function hashSeedPayload(seed) {
  const payload = {
    metadata: seed.metadata,
    defaultPage: seed.defaultPage,
    defaultSections: seed.defaultSections,
  };
  return canonicalize(payload);
}
