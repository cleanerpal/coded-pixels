#!/usr/bin/env node
/**
 * PL-001 — Ordered production deploy for CodedPixels.
 *
 * Deploy order (production-launch-prerequisites.md §2.1 #4, finops-slos.md §3.4):
 *   1. Firestore rules
 *   2. Firestore indexes
 *   3. Storage rules
 *   4. Cloud Functions (Callables + triggers)
 *   5. App Hosting — marketing, builder, site-renderer
 *
 * Usage:
 *   npm run deploy:production
 *   npm run deploy:production -- --dry-run
 *   npm run deploy:production -- --skip-gates --skip-build
 *   npm run deploy:production -- --only=firestore-rules,firestore-indexes,functions
 *
 * Prerequisites:
 *   firebase login
 *   gcloud config set project codedpixels
 *   Blaze plan + App Hosting backends provisioned (see docs/ops/pl-001-infrastructure-verification.md)
 *
 * Aligned with Dr. Daniel Moreau on FinOps deploy gates.
 */
import { execSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  APP_HOSTING_BACKENDS,
  DEPLOY_PHASES,
  PRODUCTION_PROJECT_ID,
} from './lib/production-infra.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function log(phase, message) {
  const stamp = new Date().toISOString();
  console.log(`[${stamp}] [${phase}] ${message}`);
}

function parseArgs(argv) {
  const args = new Set(argv);
  const onlyArg = argv.find((arg) => arg.startsWith('--only='));
  const projectArg = argv.find((arg) => arg.startsWith('--project='));

  return {
    dryRun: args.has('--dry-run'),
    skipGates: args.has('--skip-gates'),
    skipBuild: args.has('--skip-build'),
    force: args.has('--force'),
    only: onlyArg ? onlyArg.slice('--only='.length).split(',').map((s) => s.trim()) : null,
    project: projectArg?.slice('--project='.length) ?? PRODUCTION_PROJECT_ID,
  };
}

/**
 * @param {string} label
 * @param {string} command
 * @param {string[]} commandArgs
 */
function run(label, command, commandArgs) {
  log(label, `$ ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? 'unknown'}`);
  }
}

function runQualityGates() {
  log('gates', 'Running pre-deploy quality gates (finops-slos.md §3.1)');
  run('gates', 'npm', ['run', 'lint']);
  run('gates', 'npm', ['run', 'typecheck']);
  run('gates', 'npm', ['test']);
  run('gates', 'npm', ['run', 'test:rules']);
}

function runBuild() {
  log('build', 'Building all workspaces (turbo run build)');
  run('build', 'npm', ['run', 'build']);
}

/**
 * @param {typeof DEPLOY_PHASES[number]} phase
 * @param {{ dryRun: boolean; force: boolean; project: string }} options
 */
function deployPhase(phase, options) {
  const deployArgs = [
    'deploy',
    '--only',
    phase.firebaseOnly,
    '--project',
    options.project,
  ];

  if (options.dryRun) {
    deployArgs.push('--dry-run');
  }
  if (options.force) {
    deployArgs.push('--force');
  }

  log(phase.id, `${phase.label} — ${phase.prerequisite}`);
  run(phase.id, 'npx', ['firebase', ...deployArgs]);
}

function verifyRepoConfig() {
  for (const backend of APP_HOSTING_BACKENDS) {
    const yamlPath = join(ROOT, backend.rootDir, 'apphosting.yaml');
    if (!existsSync(yamlPath)) {
      throw new Error(`Missing ${yamlPath} — required for App Hosting backend "${backend.id}"`);
    }
  }

  const gitSha = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  log('preflight', `Deploying from git SHA ${gitSha} on project ${PRODUCTION_PROJECT_ID}`);
  log(
    'preflight',
    'Record this SHA in App Hosting console / rollout — §2.1 #2 requires main SHA match',
  );
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const selectedPhases = options.only
    ? DEPLOY_PHASES.filter((phase) => options.only.includes(phase.id))
    : DEPLOY_PHASES;

  if (selectedPhases.length === 0) {
    console.error(
      'No deploy phases selected. Valid --only values: firestore-rules, firestore-indexes, storage-rules, functions, apphosting',
    );
    process.exit(1);
  }

  verifyRepoConfig();

  if (!options.skipGates) {
    runQualityGates();
  } else {
    log('gates', 'Skipped pre-deploy gates (--skip-gates)');
  }

  if (!options.skipBuild) {
    runBuild();
  } else {
    log('build', 'Skipped monorepo build (--skip-build)');
  }

  log('deploy', '=== Ordered production deploy start ===');

  for (const phase of selectedPhases) {
    deployPhase(phase, options);
  }

  log('deploy', '=== Ordered production deploy complete ===');
  log(
    'next',
    'Run npm run verify:production:infra -- --live and npm run verify:production:dns -- --live',
  );
}

try {
  main();
} catch (error) {
  console.error(`\nDeploy aborted: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
