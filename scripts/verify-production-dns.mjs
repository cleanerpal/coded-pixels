#!/usr/bin/env node
/**
 * PL-001 — DNS verification for production cutover (§2.1 #3).
 *
 * Checks apex, www, app., and wildcard tenant hostname resolve to live DNS.
 *
 * Usage:
 *   npm run verify:production:dns              # offline — prints checklist only
 *   npm run verify:production:dns -- --live    # runs dig against production
 *   npm run verify:production:dns -- --live --expect-cname=web.app
 *
 * Aligned with Dr. Daniel Moreau on FinOps post-deploy checks (finops-slos.md §6.2).
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DNS_CHECKS,
  evaluateDnsAnswers,
  parseDigAnswers,
  PRODUCTION_APEX_DOMAIN,
} from './lib/production-infra.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = new Set(argv);
  const expectArg = argv.find((arg) => arg.startsWith('--expect-cname='));

  return {
    live: args.has('--live'),
    expectCname: expectArg?.slice('--expect-cname='.length),
  };
}

/**
 * @param {string} hostname
 * @param {string} recordType
 * @returns {string}
 */
function runDig(hostname, recordType) {
  const result = spawnSync('dig', ['+noall', '+answer', hostname, recordType], {
    encoding: 'utf8',
  });

  if (result.error) {
    throw result.error;
  }

  return result.stdout ?? '';
}

function hasDig() {
  const result = spawnSync('dig', ['-v'], { encoding: 'utf8' });
  return result.status === 0;
}

function printOfflineChecklist() {
  console.log(`DNS verification checklist — ${PRODUCTION_APEX_DOMAIN}\n`);
  console.log('| Hostname | Backend | Verify |');
  console.log('|----------|---------|--------|');

  for (const check of DNS_CHECKS) {
    console.log(`| ${check.hostname} | ${check.backendId} | ${check.notes} |`);
  }

  console.log('\nLive verification: npm run verify:production:dns -- --live');
  console.log(
    'Firebase console: Project → App Hosting → each backend → Custom domains (all Connected)',
  );
}

function runLiveChecks(expectCname) {
  if (!hasDig()) {
    console.error('dig(1) not found — install bind-tools / dnsutils for live checks');
    process.exit(1);
  }

  const expectedSubstrings = expectCname ? [expectCname] : undefined;
  let failures = 0;

  console.log(`Live DNS verification — ${PRODUCTION_APEX_DOMAIN}\n`);

  for (const check of DNS_CHECKS) {
    const recordTypes = check.hostname.startsWith('www.')
      ? ['CNAME', 'A']
      : ['A', 'AAAA', 'CNAME'];

    let combinedAnswers = [];
    for (const recordType of recordTypes) {
      const stdout = runDig(check.hostname, recordType);
      combinedAnswers = combinedAnswers.concat(parseDigAnswers(recordType, stdout));
    }

    const result = evaluateDnsAnswers(combinedAnswers, expectedSubstrings);
    const status = result.ok ? 'PASS' : 'FAIL';
    console.log(`${status}  ${check.hostname} → ${check.backendId}: ${result.message}`);

    if (!result.ok) {
      failures += 1;
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} DNS check(s) failed.`);
    process.exit(1);
  }

  console.log('\nAll DNS checks passed.');
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.live) {
    runLiveChecks(options.expectCname);
  } else {
    printOfflineChecklist();
  }
}

main();
