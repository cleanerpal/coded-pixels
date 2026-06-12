#!/usr/bin/env node
/**
 * PL-002 — Verify Stripe catalogue sync against docs/planning/stripe-catalogue.md.
 *
 * Modes:
 *   node scripts/verify-stripe-catalogue.mjs              # print expected IDs (test + live)
 *   node scripts/verify-stripe-catalogue.mjs --mode=live  # live IDs only
 *   node scripts/verify-stripe-catalogue.mjs --firestore --project=codedpixels
 *
 * Firestore mode reads Extension-synced `products/{id}` docs. Requires ADC:
 *   gcloud auth application-default login
 *
 * Aligned with Dr. Owen Reilly on Q63.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXPECTED_CATALOGUE,
  expectedPriceIds,
  expectedProductIds,
  toModeId,
} from './lib/stripe-catalogue-expected.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  let mode = 'test';
  let firestore = false;
  let project = process.env.FIREBASE_PROJECT_ID ?? 'codedpixels';

  for (const arg of args) {
    if (arg.startsWith('--mode=')) {
      mode = arg.slice('--mode='.length);
    } else if (arg === '--firestore') {
      firestore = true;
    } else if (arg.startsWith('--project=')) {
      project = arg.slice('--project='.length);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/verify-stripe-catalogue.mjs [--mode=test|live] [--firestore] [--project=ID]`);
      process.exit(0);
    }
  }

  if (mode !== 'test' && mode !== 'live') {
    console.error('Invalid --mode; use test or live');
    process.exit(1);
  }

  return { mode, firestore, project };
}

function printExpectedCatalogue(mode) {
  console.log(`\n=== Expected Stripe catalogue (${mode} mode) ===\n`);
  console.log('Source: docs/planning/stripe-catalogue.md §4–§6\n');

  for (const entry of EXPECTED_CATALOGUE) {
    const productId = mode === 'live' ? toModeId(entry.productIdTest) : entry.productIdTest;
    console.log(`${entry.slug} (${entry.kind})`);
    console.log(`  product: ${productId}`);
    if (entry.monthlyPriceIdTest) {
      const id = mode === 'live' ? toModeId(entry.monthlyPriceIdTest) : entry.monthlyPriceIdTest;
      console.log(`  monthly: ${id} — ${entry.monthlyPence} pence`);
    }
    if (entry.annualPriceIdTest) {
      const id = mode === 'live' ? toModeId(entry.annualPriceIdTest) : entry.annualPriceIdTest;
      console.log(`  annual:  ${id} — ${entry.annualPence} pence`);
    }
    if (entry.onetimePriceIdTest) {
      const id = mode === 'live' ? toModeId(entry.onetimePriceIdTest) : entry.onetimePriceIdTest;
      console.log(`  onetime: ${id} — ${entry.onetimePence} pence`);
    }
    console.log('');
  }

  console.log(`Total products: ${EXPECTED_CATALOGUE.length}`);
  console.log(`Total price IDs: ${expectedPriceIds(mode).size}`);
}

/**
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {'test' | 'live'} mode
 */
async function verifyFirestoreProducts(db, mode) {
  const expectedProducts = expectedProductIds(mode);
  const expectedPrices = expectedPriceIds(mode);
  const snap = await db.collection('products').get();

  const foundProducts = new Set();
  const foundPrices = new Set();
  const errors = [];

  for (const doc of snap.docs) {
    foundProducts.add(doc.id);
    const data = doc.data();
    const prices = data.prices ?? data.priceIds ?? [];

    if (Array.isArray(prices)) {
      for (const priceRef of prices) {
        const priceId = typeof priceRef === 'string' ? priceRef : priceRef?.id;
        if (priceId) foundPrices.add(priceId);
      }
    }

    if (data.prices && typeof data.prices === 'object' && !Array.isArray(data.prices)) {
      for (const priceId of Object.keys(data.prices)) {
        foundPrices.add(priceId);
      }
    }

    if (!expectedProducts.has(doc.id)) {
      errors.push(`Unexpected product doc: ${doc.id}`);
    }
  }

  for (const productId of expectedProducts) {
    if (!foundProducts.has(productId)) {
      errors.push(`Missing product doc: ${productId}`);
    }
  }

  for (const priceId of expectedPrices) {
    if (!foundPrices.has(priceId)) {
      errors.push(`Missing price in Firestore products sync: ${priceId}`);
    }
  }

  console.log(`\n=== Firestore products/ sync (${mode} mode) ===\n`);
  console.log(`Project: ${db.projectId ?? '(unknown)'}`);
  console.log(`Product docs found: ${snap.size}`);
  console.log(`Expected products: ${expectedProducts.size}`);
  console.log(`Expected prices: ${expectedPrices.size}`);
  console.log(`Prices found in sync: ${foundPrices.size}`);

  if (errors.length === 0) {
    console.log('\n✓ Catalogue sync OK — all expected product/price IDs present.');
    return true;
  }

  console.error('\n✗ Catalogue sync FAILED:\n');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  return false;
}

async function main() {
  const { mode, firestore, project } = parseArgs();

  printExpectedCatalogue(mode);

  if (!firestore) {
    console.log('Tip: run with --firestore --project=codedpixels to verify Extension sync.');
    return;
  }

  const admin = await import('firebase-admin');
  if (!admin.default.apps.length) {
    admin.default.initializeApp({ projectId: project });
  }

  const ok = await verifyFirestoreProducts(admin.default.firestore(), mode);
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
