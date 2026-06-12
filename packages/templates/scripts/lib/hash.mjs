import { createHash } from 'node:crypto';
import { hashSeedPayload } from './canonicalize.mjs';

/**
 * @param {import('./schemas.mjs').TemplateSeed} seed
 * @returns {string} hex SHA-256
 */
export function computeContentHash(seed) {
  const canonical = hashSeedPayload(seed);
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}
