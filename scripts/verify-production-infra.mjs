#!/usr/bin/env node
/**
 * PL-001 — Automated + documented verification for production-launch-prerequisites.md §2.1.
 *
 * Offline mode (default): validates repo config, deploy script phases, Callable inventory.
 * Live mode (--live): queries Firebase CLI / gcloud when authenticated.
 *
 * Usage:
 *   npm run verify:production:infra
 *   npm run verify:production:infra -- --live
 *
 * Aligned with Dr. Daniel Moreau on FinOps weekly checklist (finops-slos.md §6.2).
 */
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  APP_HOSTING_BACKENDS,
  DEPLOY_PHASES,
  FORBIDDEN_PRODUCTION_FUNCTION_ENV,
  PRODUCTION_CALLABLES,
  PRODUCTION_PROJECT_ID,
  PRODUCTION_REGION,
  REQUIRED_FUNCTION_SECRETS,
  findMissingCallables,
} from './lib/production-infra.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/** @typedef {{ id: string; ok: boolean; mode: 'auto' | 'manual'; detail: string }} CheckResult */

function parseArgs(argv) {
  return { live: new Set(argv).has('--live') };
}

/**
 * @param {string} title
 * @param {CheckResult} result
 */
function printCheck(title, result) {
  const badge = result.ok ? 'PASS' : result.mode === 'manual' ? 'MANUAL' : 'FAIL';
  console.log(`${badge.padEnd(6)} §2.1 — ${title}`);
  console.log(`       ${result.detail}\n`);
}

/**
 * @param {string} cmd
 * @returns {string}
 */
function tryExec(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    return '';
  }
}

function checkGcpProjectConfig() {
  const firebaserc = JSON.parse(readFileSync(join(ROOT, '.firebaserc'), 'utf8'));
  const projectOk = firebaserc.projects?.default === PRODUCTION_PROJECT_ID;

  return {
    id: 'gcp-project',
    ok: projectOk,
    mode: 'auto',
    detail: projectOk
      ? `Firebase default project is "${PRODUCTION_PROJECT_ID}". Confirm GCP default region ${PRODUCTION_REGION} in Console → Project settings.`
      : `Expected .firebaserc default "${PRODUCTION_PROJECT_ID}"`,
  };
}

function checkAppHostingRepoConfig() {
  const firebaseJson = JSON.parse(readFileSync(join(ROOT, 'firebase.json'), 'utf8'));
  const backends = Array.isArray(firebaseJson.apphosting)
    ? firebaseJson.apphosting
    : firebaseJson.apphosting
      ? [firebaseJson.apphosting]
      : [];

  const configuredIds = backends.map((b) => b.backendId).sort();
  const expectedIds = APP_HOSTING_BACKENDS.map((b) => b.id).sort();
  const idsMatch =
    configuredIds.length === expectedIds.length &&
    configuredIds.every((id, index) => id === expectedIds[index]);

  const yamlMissing = APP_HOSTING_BACKENDS.filter(
    (b) => !existsSync(join(ROOT, b.rootDir, 'apphosting.yaml')),
  );

  const ok = idsMatch && yamlMissing.length === 0;

  return {
    id: 'app-hosting-config',
    ok,
    mode: 'auto',
    detail: ok
      ? `firebase.json declares backends [${configuredIds.join(', ')}]; apphosting.yaml present in each app. Live: confirm rollouts match main SHA.`
      : `Missing config — backends ${JSON.stringify(configuredIds)} expected ${JSON.stringify(expectedIds)}; missing yaml: ${yamlMissing.map((b) => b.rootDir).join(', ') || 'none'}`,
  };
}

function checkDeployScriptOrder() {
  const scriptPath = join(ROOT, 'scripts/deploy-production.mjs');
  const scriptExists = existsSync(scriptPath);
  const phaseOrder = DEPLOY_PHASES.map((p) => p.firebaseOnly);
  const rulesIdx = phaseOrder.indexOf('firestore:rules');
  const indexesIdx = phaseOrder.indexOf('firestore:indexes');
  const functionsIdx = phaseOrder.indexOf('functions');
  const hostingIdx = phaseOrder.indexOf('apphosting');
  const orderOk =
    rulesIdx !== -1 &&
    indexesIdx !== -1 &&
    functionsIdx !== -1 &&
    rulesIdx < indexesIdx &&
    indexesIdx < functionsIdx &&
    (hostingIdx === -1 || functionsIdx < hostingIdx);

  const scriptUsesPhases =
    scriptExists && readFileSync(scriptPath, 'utf8').includes('DEPLOY_PHASES');

  const ok = scriptExists && scriptUsesPhases && orderOk;

  return {
    id: 'ordered-deploy',
    ok,
    mode: 'auto',
    detail: ok
      ? `scripts/deploy-production.mjs iterates DEPLOY_PHASES: ${phaseOrder.join(' → ')}. Save CLI output as ordered deploy log.`
      : 'Deploy script or DEPLOY_PHASES order invalid',
  };
}

function checkCallablesInventory() {
  const indexSource = readFileSync(join(ROOT, 'functions/src/index.ts'), 'utf8');
  const exported = PRODUCTION_CALLABLES.filter((name) => indexSource.includes(name));
  const { ok, missing } = findMissingCallables(exported);

  return {
    id: 'callables-inventory',
    ok,
    mode: 'auto',
    detail: ok
      ? `${PRODUCTION_CALLABLES.length} Callables declared in functions/src/index.ts`
      : `Callable inventory drift — missing in index.ts: ${missing.join(', ')}`,
  };
}

function checkFunctionSecretsDoc() {
  const docPath = join(ROOT, 'docs/ops/pl-001-infrastructure-verification.md');
  const docOk = existsSync(docPath);
  const secretNames = REQUIRED_FUNCTION_SECRETS.map((s) => s.name);
  const docSource = docOk ? readFileSync(docPath, 'utf8') : '';
  const allDocumented = secretNames.every((name) => docSource.includes(name));

  return {
    id: 'function-secrets',
    ok: docOk && allDocumented,
    mode: docOk && allDocumented ? 'auto' : 'manual',
    detail:
      docOk && allDocumented
        ? `Required secrets documented: ${secretNames.join(', ')}. Live: set via firebase functions:secrets:set / Console.`
        : 'Document required Function secrets in docs/ops/pl-001-infrastructure-verification.md',
  };
}

function checkAppCheckConfig() {
  const callableOptions = readFileSync(
    join(ROOT, 'functions/src/lib/callableOptions.ts'),
    'utf8',
  );
  const enforces =
    callableOptions.includes('enforceAppCheck') &&
    callableOptions.includes("DISABLE_APP_CHECK !== 'true'");

  return {
    id: 'app-check',
    ok: enforces,
    mode: 'auto',
    detail: enforces
      ? `Callables enforce App Check when ${FORBIDDEN_PRODUCTION_FUNCTION_ENV.join(', ')} unset (B9-001). Live: disable debug tokens in Firebase Console → App Check; verify attestation failures < 5%.`
      : 'callableOptions.ts must enforce App Check in production',
  };
}

function checkBuilderAuthDoc() {
  const docPath = join(ROOT, 'docs/ops/pl-001-infrastructure-verification.md');
  const docSource = existsSync(docPath) ? readFileSync(docPath, 'utf8') : '';
  const ok = docSource.includes('Firebase Auth') && docSource.includes('app.codedpixels.co.uk');

  return {
    id: 'builder-auth',
    ok,
    mode: ok ? 'manual' : 'manual',
    detail: ok
      ? 'Manual: Firebase Console → Authentication → Sign-in method — Email/Password or magic link enabled for builder (Q57). Test login at https://app.codedpixels.co.uk'
      : 'Add builder Auth verification steps to docs/ops/pl-001-infrastructure-verification.md',
  };
}

function checkDnsScript() {
  const ok = existsSync(join(ROOT, 'scripts/verify-production-dns.mjs'));

  return {
    id: 'dns-checklist',
    ok,
    mode: 'auto',
    detail: ok
      ? 'Run npm run verify:production:dns -- --live after DNS cutover'
      : 'Missing scripts/verify-production-dns.mjs',
  };
}

function checkLiveFirebaseBackends() {
  const output = tryExec(`npx firebase apphosting:backends:list --project ${PRODUCTION_PROJECT_ID} --json`);
  if (!output.trim()) {
    return {
      id: 'live-backends',
      ok: false,
      mode: 'manual',
      detail: 'Could not list App Hosting backends — run firebase login and retry with --live',
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch {
    return {
      id: 'live-backends',
      ok: false,
      mode: 'manual',
      detail: 'Unexpected apphosting:backends:list output — verify in Firebase Console',
    };
  }

  const backendIds = (parsed.backends ?? parsed ?? [])
    .map((b) => (typeof b === 'string' ? b : b.name?.split('/').pop() ?? b.backendId))
    .filter(Boolean);

  const expected = APP_HOSTING_BACKENDS.map((b) => b.id);
  const missing = expected.filter((id) => !backendIds.some((live) => live.includes(id)));

  return {
    id: 'live-backends',
    ok: missing.length === 0,
    mode: 'auto',
    detail:
      missing.length === 0
        ? `Live backends: ${backendIds.join(', ')}`
        : `Missing live backends: ${missing.join(', ')} (found: ${backendIds.join(', ') || 'none'})`,
  };
}

function checkLiveFunctions() {
  const output = tryExec(`npx firebase functions:list --project ${PRODUCTION_PROJECT_ID} --json`);
  if (!output.trim()) {
    return {
      id: 'live-functions',
      ok: false,
      mode: 'manual',
      detail: 'Could not list Functions — firebase login required',
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch {
    return {
      id: 'live-functions',
      ok: false,
      mode: 'manual',
      detail: 'Unexpected functions:list output',
    };
  }

  const entries = parsed.result ?? parsed.functions ?? parsed ?? [];
  const names = entries
    .map((fn) => fn.id ?? fn.name?.split('/').pop() ?? fn.entryPoint)
    .filter(Boolean);

  const { ok, missing } = findMissingCallables(names);

  return {
    id: 'live-functions',
    ok,
    mode: 'auto',
    detail: ok
      ? `All ${PRODUCTION_CALLABLES.length} Callables deployed in ${PRODUCTION_REGION}`
      : `Missing deployed Callables: ${missing.join(', ')}`,
  };
}

function checkLiveGcpRegion() {
  const output = tryExec(
    `gcloud config get-value project 2>/dev/null && gcloud app describe --project ${PRODUCTION_PROJECT_ID} 2>/dev/null`,
  );

  if (!output.trim()) {
    return {
      id: 'live-region',
      ok: false,
      mode: 'manual',
      detail: `Manual: confirm Firebase/GCP project "${PRODUCTION_PROJECT_ID}" uses primary region ${PRODUCTION_REGION} (Functions + App Hosting).`,
    };
  }

  return {
    id: 'live-region',
    ok: true,
    mode: 'manual',
    detail: `gcloud accessible for project ${PRODUCTION_PROJECT_ID}. Confirm ${PRODUCTION_REGION} in Console → App Hosting backend settings.`,
  };
}

function main() {
  const { live } = parseArgs(process.argv.slice(2));

  console.log(`PL-001 infrastructure verification (${live ? 'live' : 'offline'} mode)\n`);

  /** @type {CheckResult[]} */
  const checks = [
    checkGcpProjectConfig(),
    checkAppHostingRepoConfig(),
    checkDeployScriptOrder(),
    checkCallablesInventory(),
    checkFunctionSecretsDoc(),
    checkAppCheckConfig(),
    checkBuilderAuthDoc(),
    checkDnsScript(),
  ];

  if (live) {
    checks.push(checkLiveFirebaseBackends(), checkLiveFunctions(), checkLiveGcpRegion());
  }

  let failures = 0;
  const titles = {
    'gcp-project': '#1 GCP project codedpixels + europe-west2',
    'app-hosting-config': '#2 Three App Hosting backends',
    'dns-checklist': '#3 DNS → correct backends',
    'ordered-deploy': '#4 Rules + indexes before Functions',
    'live-functions': '#5 Cloud Functions + secrets',
    'function-secrets': '#5 Secrets configured (documented)',
    'app-check': '#6 App Check enforced (B9-001)',
    'builder-auth': '#7 Firebase Auth for builder',
    'live-backends': '#2 Live App Hosting backends',
    'live-region': '#1 GCP region confirmation',
  };

  for (const check of checks) {
    printCheck(titles[check.id] ?? check.id, check);
    if (!check.ok && check.mode !== 'manual') {
      failures += 1;
    }
  }

  if (failures > 0) {
    console.error(`${failures} automated check(s) failed.`);
    process.exit(1);
  }

  console.log('Automated checks passed. Complete MANUAL items in docs/ops/pl-001-infrastructure-verification.md before go-live.');
}

main();
