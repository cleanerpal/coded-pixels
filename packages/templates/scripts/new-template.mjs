#!/usr/bin/env node
/**
 * B10-002 — scaffold a new library template seed (Q69 skeleton only)
 * Aligned with Dr. Alex Rivera on Q69 · Dr. Rafael Ortiz on seed schema
 *
 * Generates `{templateId}.defaultSections.json` only.
 * Does NOT mutate manifest.json, content-hashes.json, or apps/marketing/lib/templates.ts.
 *
 * Usage:
 *   node scripts/new-template.mjs <templateId> [options]
 *
 * Options:
 *   --name "Display Name"
 *   --category "professional-services"
 *   --description "One-line catalogue description"
 *   --sort-order 12
 *   --middle features-grid|text-block   (default: features-grid)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  HUMAN_PR_CHECKLIST,
  TEMPLATE_ID_PATTERN,
  assertMinimumSectionBar,
  buildScaffoldSeed,
} from './lib/new-template-logic.mjs';
import { loadManifest, SEEDS_DIR } from './lib/load-seeds.mjs';
import { templateSeedSchema, validateSectionTree } from './lib/schemas.mjs';

function printUsage() {
  console.log(`Usage: node scripts/new-template.mjs <templateId> [options]

Options:
  --name "Display Name"
  --category "professional-services"
  --description "Catalogue description"
  --sort-order <number>
  --middle features-grid|text-block

Q69: This script writes the seed skeleton only. A human PR must update manifest,
templates.ts, reserved slugs, demo seed, and thumbnails.`);
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  const positional = [];
  /** @type {Record<string, string>} */
  const flags = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for --${key}`);
      }
      flags[key] = value;
      i += 1;
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

/**
 * @param {import('./lib/new-template-logic.mjs').MiddleSectionType | undefined} value
 */
function parseMiddleSection(value) {
  if (!value) {
    return undefined;
  }
  if (value === 'features-grid' || value === 'text-block') {
    return value;
  }
  throw new Error('--middle must be features-grid or text-block');
}

/**
 * @param {unknown} seed
 */
function validateScaffoldSeed(seed) {
  const parsed = templateSeedSchema.parse(seed);
  validateSectionTree(parsed.defaultSections);
  assertMinimumSectionBar(parsed.defaultSections);
  return parsed;
}

function warnIfAlreadyCatalogued(templateId) {
  try {
    const manifest = loadManifest();
    if (manifest.templates.includes(templateId)) {
      console.warn(
        `Warning: "${templateId}" is already listed in manifest.json — scaffold is for new templates only.`,
      );
    }
  } catch {
    // manifest unreadable during partial setup — continue
  }
}

function main() {
  let positional;
  let flags;

  try {
    ({ positional, flags } = parseArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(`new-template — ${error instanceof Error ? error.message : error}`);
    printUsage();
    process.exit(1);
  }

  const templateId = positional[0];
  if (!templateId) {
    printUsage();
    process.exit(1);
  }

  if (!TEMPLATE_ID_PATTERN.test(templateId)) {
    console.error(
      `new-template — FAIL: templateId must be kebab-case, got "${templateId}"`,
    );
    process.exit(1);
  }

  const outputPath = join(SEEDS_DIR, `${templateId}.defaultSections.json`);
  if (existsSync(outputPath)) {
    console.error(`new-template — FAIL: seed file already exists: ${outputPath}`);
    process.exit(1);
  }

  warnIfAlreadyCatalogued(templateId);

  const sortOrder = flags['sort-order'] ? Number(flags['sort-order']) : undefined;
  if (sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 1)) {
    console.error('new-template — FAIL: --sort-order must be a positive integer');
    process.exit(1);
  }

  let seed;
  try {
    seed = buildScaffoldSeed({
      templateId,
      name: flags.name,
      category: flags.category,
      description: flags.description,
      sortOrder,
      middleSection: parseMiddleSection(flags.middle),
    });
  } catch (error) {
    console.error(`new-template — FAIL: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  try {
    validateScaffoldSeed(seed);
  } catch (error) {
    console.error(
      `new-template — FAIL: generated seed failed validation: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }

  writeFileSync(outputPath, `${JSON.stringify(seed, null, 2)}\n`, 'utf8');

  // Re-read and validate on disk (proves round-trip)
  try {
    const written = JSON.parse(readFileSync(outputPath, 'utf8'));
    validateScaffoldSeed(written);
  } catch (error) {
    console.error(
      `new-template — FAIL: written seed failed re-validation: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }

  console.log(`new-template — OK: wrote ${outputPath}`);
  console.log(`  sections: ${seed.defaultSections.map((s) => s.type).join(', ')}`);
  console.log('');
  console.log('Next steps (human PR required per Q69):');
  for (const step of HUMAN_PR_CHECKLIST) {
    console.log(`  • ${step}`);
  }
  console.log('');
  console.log('See docs/planning/template-authoring-guide.md for the full checklist.');
}

main();
