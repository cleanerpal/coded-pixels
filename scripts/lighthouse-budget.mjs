#!/usr/bin/env node
/**
 * QA-003 — Lighthouse mobile perf + a11y budget, configurator JS chunk size.
 * Aligned with Dr. Daniel Moreau on perf budget (codedpixels-project-plan § Performance).
 *
 * Prerequisites:
 *   npm run build
 *   npm run start   (or set LIGHTHOUSE_BASE_URL to a running instance)
 *
 * Usage:
 *   npm run test:lighthouse
 *   npm run test:lighthouse -- --bundle-only
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const NEXT_DIR = join(ROOT, 'apps/marketing/.next');

/** Budgets — codedpixels-project-plan Q1 success metrics + § Performance */
export const BUDGETS = {
  performanceMinScore: 0.9,
  accessibilityMinScore: 0.95,
  configuratorChunkMaxGzipKb: 80,
};

const DEFAULT_BASE_URL = 'http://localhost:3000';

function parseArgs(argv) {
  return {
    bundleOnly: argv.includes('--bundle-only'),
    skipLighthouse: argv.includes('--skip-lighthouse'),
    skipBundle: argv.includes('--skip-bundle'),
    baseUrl:
      process.env.LIGHTHOUSE_BASE_URL ??
      argv.find((arg) => arg.startsWith('--url='))?.slice('--url='.length) ??
      DEFAULT_BASE_URL,
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function gzipSizeKb(filePath) {
  const raw = readFileSync(filePath);
  return gzipSync(raw).length / 1024;
}

/**
 * Measure route-specific client JS for `/` (home + configurator island).
 * Uses Next.js app-build-manifest page chunks — proxy until configurator dynamic split.
 */
export function measureConfiguratorRouteChunk() {
  const manifestPath = join(NEXT_DIR, 'app-build-manifest.json');
  if (!existsSync(manifestPath)) {
    return {
      ok: false,
      skipped: true,
      reason: 'Missing .next/app-build-manifest.json — run npm run build first.',
    };
  }

  const manifest = readJson(manifestPath);
  const pageKey =
    Object.keys(manifest.pages ?? {}).find(
      (key) => key === '/page' || key === '/',
    ) ?? null;

  if (!pageKey) {
    return {
      ok: false,
      skipped: true,
      reason: 'Home route not found in app-build-manifest.json pages.',
    };
  }

  const chunkPaths = manifest.pages[pageKey] ?? [];
  const jsChunks = chunkPaths.filter(
    (chunk) =>
      typeof chunk === 'string' &&
      chunk.endsWith('.js') &&
      chunk.includes('/app/page') &&
      !chunk.includes('webpack') &&
      !chunk.includes('main-app'),
  );

  if (jsChunks.length === 0) {
    return {
      ok: false,
      skipped: true,
      reason: 'No JS chunks listed for home route in app-build-manifest.json.',
    };
  }

  const chunks = [];
  let totalGzipKb = 0;

  for (const relativePath of jsChunks) {
    const absolutePath = join(NEXT_DIR, relativePath);
    if (!existsSync(absolutePath)) {
      return {
        ok: false,
        skipped: true,
        reason: `Chunk missing on disk (${relativePath}) — run npm run build for production output.`,
      };
    }
    const gzipKb = gzipSizeKb(absolutePath);
    totalGzipKb += gzipKb;
    chunks.push({ path: relativePath, gzipKb: Number(gzipKb.toFixed(2)) });
  }

  const withinBudget = totalGzipKb <= BUDGETS.configuratorChunkMaxGzipKb;

  return {
    ok: withinBudget,
    skipped: false,
    pageKey,
    chunks,
    totalGzipKb: Number(totalGzipKb.toFixed(2)),
    budgetKb: BUDGETS.configuratorChunkMaxGzipKb,
  };
}

async function isServerReachable(baseUrl) {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(8000) });
    return response.ok;
  } catch {
    return false;
  }
}

function runLighthouse(baseUrl) {
  const collectUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  execSync(
    `npx --yes lhci autorun --collect.url="${collectUrl}" --collect.numberOfRuns=1`,
    { cwd: ROOT, stdio: 'inherit', env: process.env },
  );
}

function printBundleReport(result) {
  if (result.skipped) {
    console.warn(`[bundle] Skipped: ${result.reason}`);
    return 0;
  }

  if (!result.chunks?.length) {
    console.error(`[bundle] FAIL — ${result.reason ?? 'no chunks measured'}`);
    return 1;
  }

  console.log('[bundle] Home route client JS chunks (configurator island proxy):');
  for (const chunk of result.chunks) {
    console.log(`  ${chunk.path}: ${chunk.gzipKb} KB gzip`);
  }
  console.log(
    `[bundle] Total: ${result.totalGzipKb} KB gzip (budget ≤ ${result.budgetKb} KB)`,
  );

  if (result.ok) {
    console.log('[bundle] PASS');
    return 0;
  }

  console.error('[bundle] FAIL — exceeds configurator chunk budget');
  return 1;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let exitCode = 0;

  console.log('QA-003 Lighthouse + perf budget');
  console.log(`  Base URL: ${args.baseUrl}`);
  console.log(
    `  Targets: perf ≥${BUDGETS.performanceMinScore * 100}, a11y ≥${BUDGETS.accessibilityMinScore * 100}, chunk ≤${BUDGETS.configuratorChunkMaxGzipKb} KB gzip`,
  );

  if (!args.skipBundle) {
    const bundleResult = measureConfiguratorRouteChunk();
    const bundleExit = printBundleReport(bundleResult);
    if (!bundleResult.skipped && bundleExit !== 0) {
      exitCode = bundleExit;
    }
  }

  if (args.bundleOnly) {
    process.exit(exitCode);
  }

  if (args.skipLighthouse) {
    process.exit(exitCode);
  }

  const reachable = await isServerReachable(args.baseUrl);
  if (!reachable) {
    console.warn(
      `[lighthouse] Skipped: no server at ${args.baseUrl}. Start with: npm run build && npm run start`,
    );
    process.exit(exitCode);
  }

  try {
    runLighthouse(args.baseUrl);
    console.log('[lighthouse] PASS — assertions in lighthouserc.json');
  } catch {
    console.error('[lighthouse] FAIL — see LHCI output above');
    process.exit(1);
  }

  process.exit(exitCode);
}

main();
