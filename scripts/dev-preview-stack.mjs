#!/usr/bin/env node
/**
 * Local full-stack preview — marketing-template-preview-spec §7 in one command.
 *
 * Starts (or reuses) Firebase emulators, seeds catalogue + demo tenants,
 * site-renderer (:3002) with FIRESTORE_EMULATOR_HOST, and marketing (:3000).
 *
 * Usage:
 *   npm run dev:preview
 *   npm run dev:preview -- --skip-prep     # skip shared-types + functions build
 *   npm run dev:preview -- --no-seed       # skip Firestore seed scripts
 *   npm run dev:preview -- --strict-ports  # fail if :3000/:3002 busy (default: free them)
 *   npm run dev:preview -- --with-thumbnails  # also generate gallery WebP previews
 *
 * Stop: Ctrl+C (shuts down spawned emulators + dev servers started by this script)
 */
import { execSync, spawn } from 'node:child_process';
import net from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? 'codedpixels';

const args = new Set(process.argv.slice(2));
const skipPrep = args.has('--skip-prep');
const noSeed = args.has('--no-seed');
const strictPorts = args.has('--strict-ports');
const withThumbnails = args.has('--with-thumbnails');

const DEV_PORTS = [
  { port: 3000, name: 'marketing' },
  { port: 3002, name: 'site-renderer' },
];

/** @type {import('node:child_process').ChildProcess[]} */
const managed = [];

function log(label, message) {
  console.log(`[${label}] ${message}`);
}

/**
 * @param {number} port
 * @param {string} [host]
 */
function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host }, () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });
}

/**
 * @param {number} port
 * @param {string} [host]
 * @param {number} [timeoutMs]
 */
async function waitForPort(port, host = '127.0.0.1', timeoutMs = 120_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await isPortOpen(port, host)) {
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${host}:${port}`);
}

/**
 * @param {string} label
 * @param {string} command
 * @param {string[]} commandArgs
 * @param {import('node:child_process').SpawnOptions} [options]
 */
function spawnManaged(label, command, commandArgs, options = {}) {
  const child = spawn(command, commandArgs, {
    cwd: ROOT,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });

  managed.push(child);

  const prefix = (stream, out) => {
    stream.on('data', (chunk) => {
      for (const line of chunk.toString().split('\n')) {
        if (line.trim()) {
          out.write(`[${label}] ${line}\n`);
        }
      }
    });
  };

  prefix(child.stdout, process.stdout);
  prefix(child.stderr, process.stderr);

  child.on('exit', (code, signal) => {
    if (signal) {
      log(label, `exited (${signal})`);
    } else if (code !== 0 && code !== null) {
      log(label, `exited with code ${code}`);
    }
  });

  return child;
}

/**
 * @param {string} label
 * @param {string} command
 * @param {string[]} commandArgs
 * @param {Record<string, string | undefined>} [extraEnv]
 */
function runToCompletion(label, command, commandArgs, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    log(label, `${command} ${commandArgs.join(' ')}`);
    const child = spawn(command, commandArgs, {
      cwd: ROOT,
      env: { ...process.env, ...extraEnv },
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${label} failed with exit code ${code ?? 'unknown'}`));
      }
    });
  });
}

function killListeningPort(port) {
  if (process.platform === 'win32') {
    throw new Error(
      `Port ${port} is in use. Stop the process manually (auto-free is Unix-only).`,
    );
  }

  try {
    const pids = execSync(`lsof -ti :${port} -sTCP:LISTEN 2>/dev/null`, {
      encoding: 'utf8',
    }).trim();
    if (!pids) {
      return;
    }
    for (const pid of pids.split('\n')) {
      if (pid) {
        process.kill(Number(pid), 'SIGTERM');
      }
    }
  } catch {
    // lsof exits 1 when nothing is listening
  }
}

async function waitForPortClosed(port, timeoutMs = 8_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (!(await isPortOpen(port))) {
      return;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Port ${port} is still in use — stop the process and retry`);
}

async function ensureDevPortsAvailable() {
  for (const { port, name } of DEV_PORTS) {
    if (!(await isPortOpen(port))) {
      continue;
    }

    if (strictPorts) {
      throw new Error(
        `Port ${port} is already in use (${name}). Stop it or omit --strict-ports.`,
      );
    }

    log('preview', `port ${port} in use (${name}) — stopping existing process`);
    killListeningPort(port);
    await waitForPortClosed(port);
  }
}

async function runPrep() {
  if (skipPrep) {
    log('prep', 'skipped (--skip-prep)');
    return;
  }

  await runToCompletion('prep', 'npm', [
    'run',
    'build',
    '--workspace=@codedpixels/shared-types',
  ]);
  await runToCompletion('prep', 'npm', ['--prefix', 'functions', 'run', 'build']);
}

async function ensureEmulators() {
  const [, firestorePort] = FIRESTORE_EMULATOR_HOST.split(':');
  const port = Number(firestorePort ?? 8080);

  if (await isPortOpen(port)) {
    log('emulators', `Firestore already listening on ${FIRESTORE_EMULATOR_HOST} — reusing`);
    return;
  }

  // Firestore + auth + storage only — preview stack does not need Functions (avoids firebase login for Admin SDK)
  log('emulators', 'starting auth, firestore, storage…');
  spawnManaged('emulators', 'npx', [
    'firebase',
    'emulators:start',
    '--only',
    'auth,firestore,storage',
  ]);
  await waitForPort(port);
  log('emulators', `ready (${FIRESTORE_EMULATOR_HOST})`);
}

async function runSeeds() {
  if (noSeed) {
    log('seed', 'skipped (--no-seed)');
    return;
  }

  const seedEnv = {
    FIREBASE_PROJECT_ID,
    FIRESTORE_EMULATOR_HOST,
  };

  await runToCompletion(
    'seed',
    'npm',
    ['run', 'seed:templates:emulator'],
    seedEnv,
  );
  await runToCompletion(
    'seed',
    'npm',
    ['run', 'seed:template-demos:emulator'],
    seedEnv,
  );
}

function startRenderer() {
  log('renderer', 'starting site-renderer on http://localhost:3002');
  spawnManaged('renderer', 'npm', ['run', 'dev'], {
    cwd: join(ROOT, 'apps/site-renderer'),
    env: {
      ...process.env,
      FIRESTORE_EMULATOR_HOST,
      FIREBASE_PROJECT_ID,
    },
  });
}

function startMarketing() {
  log('marketing', 'starting marketing on http://localhost:3000');
  spawnManaged('marketing', 'npm', ['run', 'dev'], {
    cwd: join(ROOT, 'apps/marketing'),
  });
}

function shutdown(exitCode = 0) {
  log('preview', 'shutting down…');
  for (const child of managed) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
  setTimeout(() => {
    for (const child of managed) {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    }
    process.exit(exitCode);
  }, 2_000).unref();
}

async function waitForHttp(url, timeoutMs = 120_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3_000) });
      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function printReady(thumbnailsGenerated = false) {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  CodedPixels preview stack is running');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Marketing gallery   http://localhost:3000/templates');
  console.log('  Configurator        http://localhost:3000/get-started');
  console.log('  Demo site (example) http://sparkle-clean.localhost:3002/');
  console.log('  Emulator UI         http://127.0.0.1:4000/');
  if (!thumbnailsGenerated) {
    console.log('');
    console.log('  Gallery thumbnails: npm run generate:template-thumbnails');
    console.log('  (or npm run dev:preview -- --with-thumbnails on next start)');
  }
  console.log('');
  console.log('  Press Ctrl+C to stop all services started by this script.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

async function main() {
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await ensureDevPortsAvailable();
  await runPrep();
  await ensureEmulators();
  await runSeeds();

  startRenderer();
  startMarketing();

  await Promise.all([
    waitForPort(3002),
    waitForPort(3000),
  ]);

  try {
    await waitForHttp('http://sparkle-clean.localhost:3002/');
  } catch {
    log('preview', 'demo site not ready yet — check renderer logs');
  }

  if (withThumbnails) {
    try {
      await runToCompletion('thumbnails', 'npm', ['run', 'generate:template-thumbnails']);
    } catch (error) {
      log(
        'thumbnails',
        error instanceof Error ? error.message : 'generation failed — run npm run generate:template-thumbnails',
      );
    }
  }

  printReady(withThumbnails);

  await new Promise(() => {});
}

main().catch((error) => {
  console.error('[preview] failed:', error.message);
  shutdown(1);
});
