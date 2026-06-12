#!/usr/bin/env node
/**
 * B1-001 — validate template seeds (template-seeding-ci-spec §6.3, §6.5)
 * Aligned with Dr. Rafael Ortiz on firestore-schema §5.2 · Dr. Daniel Moreau on CI scripts
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { computeContentHash } from './lib/hash.mjs';
import {
  loadAllSeeds,
  loadManifest,
  PACKAGE_ROOT,
  SEEDS_DIR,
} from './lib/load-seeds.mjs';
import {
  parseMarketingTemplates,
  validateSectionTree,
} from './lib/schemas.mjs';

const MARKETING_TEMPLATES_PATH = join(
  PACKAGE_ROOT,
  '../../apps/marketing/lib/templates.ts',
);

function fail(message) {
  console.error(`validate:templates — FAIL: ${message}`);
  process.exit(1);
}

function main() {
  const manifest = loadManifest();

  if (manifest.templates.length !== 11) {
    fail(`manifest.templates must contain exactly 11 entries, got ${manifest.templates.length}`);
  }

  const marketingSource = readFileSync(MARKETING_TEMPLATES_PATH, 'utf8');
  const marketingTemplates = parseMarketingTemplates(marketingSource);
  const marketingById = Object.fromEntries(marketingTemplates.map((t) => [t.id, t]));

  if (marketingTemplates.length !== 10) {
    fail(`Expected 10 library templates in templates.ts, parsed ${marketingTemplates.length}`);
  }

  const seeds = loadAllSeeds();
  const hashes = new Map();

  const lockPath = join(SEEDS_DIR, 'content-hashes.json');
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  let contentChanged = false;

  for (const seed of seeds) {
    const expectedFilename = join(SEEDS_DIR, `${seed.templateId}.defaultSections.json`);
    try {
      readFileSync(expectedFilename, 'utf8');
    } catch {
      fail(`Seed file missing for ${seed.templateId}`);
    }

    validateSectionTree(seed.defaultSections);

    if (seed.metadata.isCustomTemplate) {
      if (seed.templateId !== 'custom') {
        fail(`Only custom template may set isCustomTemplate: true`);
      }
      if (seed.defaultSections.length !== 0) {
        fail(`custom template must have empty defaultSections`);
      }
    } else {
      const marketing = marketingById[seed.templateId];
      if (!marketing) {
        fail(`No marketing template definition for seed ${seed.templateId}`);
      }
      if (seed.metadata.name !== marketing.name) {
        fail(`Metadata name mismatch for ${seed.templateId}`);
      }
      if (seed.metadata.category !== marketing.category) {
        fail(`Metadata category mismatch for ${seed.templateId}`);
      }
      if (seed.metadata.description !== marketing.description) {
        fail(`Metadata description mismatch for ${seed.templateId}`);
      }
      if (seed.metadata.sortOrder !== marketing.sortOrder) {
        fail(`Metadata sortOrder mismatch for ${seed.templateId}`);
      }
      if (seed.defaultSections.length === 0) {
        fail(`Library template ${seed.templateId} must have defaultSections`);
      }
    }

    const hash = computeContentHash(seed);
    hashes.set(seed.templateId, hash);
    if (lock.hashes[seed.templateId] !== hash) {
      contentChanged = true;
    }
  }

  if (contentChanged && manifest.seedVersion <= lock.seedVersion) {
    fail(
      `Seed content changed but manifest.seedVersion (${manifest.seedVersion}) was not bumped above ${lock.seedVersion} — update manifest and content-hashes.json`,
    );
  }

  if (!contentChanged && manifest.seedVersion !== lock.seedVersion) {
    fail(
      `manifest.seedVersion (${manifest.seedVersion}) differs from content-hashes.json (${lock.seedVersion}) without content changes`,
    );
  }

  for (const templateId of manifest.templates) {
    if (lock.hashes[templateId] !== hashes.get(templateId)) {
      if (manifest.seedVersion > lock.seedVersion) {
        fail(
          `content-hashes.json is stale — run seed hash update after bumping seedVersion to ${manifest.seedVersion}`,
        );
      }
    }
  }

  const customSeed = seeds.find((s) => s.templateId === 'custom');
  if (!customSeed?.metadata.isCustomTemplate) {
    fail('custom seed must have isCustomTemplate: true');
  }

  console.log(`validate:templates — OK (${seeds.length} seeds, seedVersion ${manifest.seedVersion})`);
  for (const [id, hash] of hashes) {
    console.log(`  ${id}: contentHash ${hash.slice(0, 12)}…`);
  }
}

main();
