import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { manifestSchema, templateSeedSchema } from './schemas.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = join(__dirname, '../..');
export const SEEDS_DIR = join(PACKAGE_ROOT, 'seeds');
export const MANIFEST_PATH = join(SEEDS_DIR, 'manifest.json');

/**
 * @returns {import('./schemas.mjs').TemplateManifest}
 */
export function loadManifest() {
  const raw = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  return manifestSchema.parse(raw);
}

/**
 * @param {string} templateId
 * @returns {import('./schemas.mjs').TemplateSeed}
 */
export function loadSeedFile(templateId) {
  const path = join(SEEDS_DIR, `${templateId}.defaultSections.json`);
  if (!existsSync(path)) {
    throw new Error(`Missing seed file: ${path}`);
  }
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const seed = templateSeedSchema.parse(raw);
  if (seed.templateId !== templateId) {
    throw new Error(
      `templateId mismatch in ${templateId}.defaultSections.json: expected "${templateId}", got "${seed.templateId}"`,
    );
  }
  return seed;
}

/**
 * @returns {import('./schemas.mjs').TemplateSeed[]}
 */
export function loadAllSeeds() {
  const manifest = loadManifest();
  return manifest.templates.map(loadSeedFile);
}
