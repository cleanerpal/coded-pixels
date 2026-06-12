/**
 * PL-001 — production infrastructure constants and pure helpers.
 * Aligned with Dr. Daniel Moreau on FinOps deploy gates (finops-slos.md §3.4).
 *
 * Sources: production-launch-prerequisites.md §2.1, monorepo-layout-spec.md §3.1
 */

/** @typedef {{ id: string; rootDir: string; packageName: string; hostnames: string[] }} AppHostingBackend */

export const PRODUCTION_PROJECT_ID = 'codedpixels';

/** Cloud Functions + Firestore primary region (Q33). */
export const PRODUCTION_REGION = 'europe-west2';

export const PRODUCTION_APEX_DOMAIN = 'codedpixels.co.uk';

/** Demo tenant used for wildcard DNS spot-check (marketing-template-preview-spec). */
export const PRODUCTION_WILDCARD_PROBE_HOST = 'sparkle-clean.codedpixels.co.uk';

/** Ordered deploy phases — rules/indexes before Functions (§2.1 item 4). */
export const DEPLOY_PHASES = [
  {
    id: 'firestore-rules',
    label: 'Firestore security rules',
    firebaseOnly: 'firestore:rules',
    prerequisite: '§2.1 #4 — rules before Functions',
  },
  {
    id: 'firestore-indexes',
    label: 'Firestore composite indexes',
    firebaseOnly: 'firestore:indexes',
    prerequisite: '§2.1 #4 — indexes before Functions',
  },
  {
    id: 'storage-rules',
    label: 'Storage security rules',
    firebaseOnly: 'storage',
    prerequisite: 'Asset upload Callables depend on storage rules',
  },
  {
    id: 'functions',
    label: 'Cloud Functions (Callables + triggers)',
    firebaseOnly: 'functions',
    prerequisite: '§2.1 #5 — after rules/indexes',
  },
  {
    id: 'apphosting',
    label: 'App Hosting (marketing, builder, site-renderer)',
    firebaseOnly: 'apphosting',
    prerequisite: '§2.1 #2 — three backends from main SHA',
  },
];

/** @type {AppHostingBackend[]} */
export const APP_HOSTING_BACKENDS = [
  {
    id: 'marketing',
    rootDir: 'apps/marketing',
    packageName: '@codedpixels/marketing',
    hostnames: ['codedpixels.co.uk', 'www.codedpixels.co.uk'],
  },
  {
    id: 'builder',
    rootDir: 'apps/builder',
    packageName: '@codedpixels/builder',
    hostnames: ['app.codedpixels.co.uk'],
  },
  {
    id: 'site-renderer',
    rootDir: 'apps/site-renderer',
    packageName: '@codedpixels/site-renderer',
    hostnames: ['*.codedpixels.co.uk'],
  },
];

/** Callable exports — keep in sync with functions/src/index.ts. */
export const PRODUCTION_CALLABLES = [
  'submitSignup',
  'submitSiteImportWaitlist',
  'publishSite',
  'submitLead',
  'manageProduct',
  'createPortalSession',
  'createCheckoutSession',
  'createAssetUpload',
];

/**
 * Function runtime secrets / env — set via Firebase Console or CLI before deploy.
 * Not stored in repo (finops-slos.md §4, PL-001 §2.1 #5).
 */
export const REQUIRED_FUNCTION_SECRETS = [
  { name: 'RECAPTCHA_SECRET_KEY', surfaces: ['submitLead'] },
  { name: 'REVALIDATE_SECRET', surfaces: ['publishSite'] },
  { name: 'SITE_RENDERER_URL', surfaces: ['publishSite'] },
];

/** Must remain unset in production (B9-001 / callableOptions.ts). */
export const FORBIDDEN_PRODUCTION_FUNCTION_ENV = ['DISABLE_APP_CHECK'];

/**
 * DNS records to verify (§2.1 #3). Targets are console-specific; script checks resolution
 * and optional CNAME substring hints when --live.
 *
 * @type {{ hostname: string; backendId: string; notes: string }[]}
 */
export const DNS_CHECKS = [
  {
    hostname: 'codedpixels.co.uk',
    backendId: 'marketing',
    notes: 'Apex → marketing App Hosting custom domain',
  },
  {
    hostname: 'www.codedpixels.co.uk',
    backendId: 'marketing',
    notes: 'www redirect or CNAME → marketing',
  },
  {
    hostname: 'app.codedpixels.co.uk',
    backendId: 'builder',
    notes: 'Builder dashboard + auth (§2.1 #7)',
  },
  {
    hostname: PRODUCTION_WILDCARD_PROBE_HOST,
    backendId: 'site-renderer',
    notes: 'Wildcard *. → site-renderer (probe via demo tenant slug)',
  },
];

/**
 * @param {string} hostname
 * @returns {boolean}
 */
export function isWildcardHostname(hostname) {
  return hostname.starts('*.');
}

/**
 * @param {string} recordType
 * @param {string} stdout
 * @returns {string[]}
 */
export function parseDigAnswers(recordType, stdout) {
  const answers = [];
  for (const line of stdout.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';')) {
      continue;
    }
    if (recordType === 'CNAME' && /\bCNAME\b/.test(trimmed)) {
      answers.push(trimmed.split(/\s+/).pop().replace(/\.$/, ''));
    } else if (recordType === 'A' && /^\S+\s+\d+\s+IN\s+A\s+/.test(trimmed)) {
      answers.push(trimmed.split(/\s+/).pop());
    } else if (recordType === 'AAAA' && /^\S+\s+\d+\s+IN\s+AAAA\s+/.test(trimmed)) {
      answers.push(trimmed.split(/\s+/).pop());
    }
  }
  return answers;
}

/**
 * @param {string[]} answers
 * @param {string[] | undefined} expectedSubstrings
 * @returns {{ ok: boolean; message: string }}
 */
export function evaluateDnsAnswers(answers, expectedSubstrings) {
  if (answers.length === 0) {
    return { ok: false, message: 'No DNS answers returned' };
  }

  if (!expectedSubstrings?.length) {
    return { ok: true, message: `Resolved (${answers.length} record(s))` };
  }

  const haystack = answers.join(' ').toLowerCase();
  const matched = expectedSubstrings.some((fragment) =>
    haystack.includes(fragment.toLowerCase()),
  );

  if (matched) {
    return { ok: true, message: `Resolved with expected pattern (${answers.join(', ')})` };
  }

  return {
    ok: false,
    message: `Resolved but missing expected pattern [${expectedSubstrings.join(', ')}]: ${answers.join(', ')}`,
  };
}

/**
 * @param {string} deployLog
 * @returns {{ ok: boolean; message: string }}
 */
export function verifyOrderedDeployLog(deployLog) {
  const rulesIdx = deployLog.search(/firestore:rules|firestore-rules/i);
  const indexesIdx = deployLog.search(/firestore:indexes|firestore-indexes/i);
  const functionsIdx = deployLog.search(/\bfunctions\b/i);
  const hostingIdx = deployLog.search(/\bapphosting\b/i);

  if (rulesIdx === -1 || indexesIdx === -1 || functionsIdx === -1) {
    return {
      ok: false,
      message: 'Deploy log missing required phases (rules, indexes, or functions)',
    };
  }

  if (rulesIdx > indexesIdx || indexesIdx > functionsIdx) {
    return {
      ok: false,
      message: 'Deploy order violation: rules → indexes → functions required',
    };
  }

  if (hostingIdx !== -1 && functionsIdx > hostingIdx) {
    return {
      ok: false,
      message: 'App Hosting must deploy after Functions in ordered log',
    };
  }

  return { ok: true, message: 'Ordered deploy log satisfies §2.1 #4' };
}

/**
 * @param {string[]} deployedCallables
 * @returns {{ ok: boolean; missing: string[] }}
 */
export function findMissingCallables(deployedCallables) {
  const deployed = new Set(deployedCallables);
  const missing = PRODUCTION_CALLABLES.filter((name) => !deployed.has(name));
  return { ok: missing.length === 0, missing };
}
