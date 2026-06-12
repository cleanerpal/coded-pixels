#!/usr/bin/env node
/**
 * PL-004 — Synthetic probe verification for production-launch-prerequisites.md §2.4 #3.
 *
 * Usage:
 *   npm run verify:production:probes              # offline — prints checklist
 *   npm run verify:production:probes -- --live    # HTTP GET each probe URL
 *
 * Aligned with Dr. Mira Solano on finops-slos.md §6.4.
 */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PRODUCTION_PROBES,
  evaluateProbeResult,
} from './lib/production-probes.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_TIMEOUT_MS = 15_000;

function parseArgs(argv) {
  const timeoutArg = argv.find((arg) => arg.startsWith('--timeout-ms='));

  return {
    live: new Set(argv).has('--live'),
    timeoutMs: timeoutArg
      ? Number(timeoutArg.slice('--timeout-ms='.length))
      : DEFAULT_TIMEOUT_MS,
  };
}

function printOfflineChecklist() {
  console.log('Synthetic probe checklist — production-launch-prerequisites.md §2.4 #3\n');
  console.log('| ID | Backend | URL | Notes |');
  console.log('|----|---------|-----|-------|');

  for (const probe of PRODUCTION_PROBES) {
    console.log(`| ${probe.id} | ${probe.backendId} | ${probe.url} | ${probe.notes} |`);
  }

  console.log('\nLive verification: npm run verify:production:probes -- --live');
  console.log(
    'Schedule: 5-min interval uptime job (marketing + site-renderer) per finops-slos.md §1.1',
  );
}

/**
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<{ status: number; body: unknown }>}
 */
async function fetchProbe(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { Accept: 'application/json, text/html;q=0.9' },
    });

    const contentType = response.headers.get('content-type') ?? '';
    let body = null;

    if (contentType.includes('application/json')) {
      body = await response.json();
    }

    return { status: response.status, body };
  } finally {
    clearTimeout(timer);
  }
}

async function runLiveChecks(timeoutMs) {
  console.log('Live synthetic probe verification\n');

  let failures = 0;

  for (const probe of PRODUCTION_PROBES) {
    try {
      const { status, body } = await fetchProbe(probe.url, timeoutMs);
      const result = evaluateProbeResult(status, body, probe.expectJsonStatus);
      const badge = result.ok ? 'PASS' : 'FAIL';
      console.log(`${badge}  ${probe.id}: ${result.message}`);

      if (!result.ok) {
        failures += 1;
      }
    } catch (error) {
      failures += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`FAIL  ${probe.id}: ${message}`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} probe(s) failed.`);
    process.exit(1);
  }

  console.log('\nAll synthetic probes passed.');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.live) {
    await runLiveChecks(options.timeoutMs);
  } else {
    printOfflineChecklist();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
