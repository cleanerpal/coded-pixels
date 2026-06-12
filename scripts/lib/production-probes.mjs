/**
 * PL-004 — production synthetic probe definitions.
 * Aligned with Dr. Mira Solano on finops-slos.md §1.1, §1.3, §6.4.
 *
 * Sources: production-launch-prerequisites.md §2.4 #3
 */

import {
  PRODUCTION_APEX_DOMAIN,
  PRODUCTION_WILDCARD_PROBE_HOST,
} from './production-infra.mjs';

/** @typedef {{ id: string; url: string; backendId: string; notes: string; expectJsonStatus?: string }} ProductionProbe */

export const PRODUCTION_MARKETING_ORIGIN = `https://${PRODUCTION_APEX_DOMAIN}`;

export const PRODUCTION_SITE_RENDERER_ORIGIN = `https://${PRODUCTION_WILDCARD_PROBE_HOST}`;

/** §2.4 #3 — minimum synthetic uptime set for launch gate. */
/** @type {ProductionProbe[]} */
export const PRODUCTION_PROBES = [
  {
    id: 'marketing-home',
    url: `${PRODUCTION_MARKETING_ORIGIN}/`,
    backendId: 'marketing',
    notes: 'Marketing apex — availability SLO 99.9% (finops-slos.md §1.1)',
  },
  {
    id: 'marketing-get-started',
    url: `${PRODUCTION_MARKETING_ORIGIN}/get-started`,
    backendId: 'marketing',
    notes: 'Configurator entry — signup funnel availability',
  },
  {
    id: 'site-renderer-demo-tenant',
    url: `${PRODUCTION_SITE_RENDERER_ORIGIN}/`,
    backendId: 'site-renderer',
    notes: `Platform demo tenant (${PRODUCTION_WILDCARD_PROBE_HOST}) — wildcard DNS + ISR`,
  },
  {
    id: 'site-renderer-health',
    url: `${PRODUCTION_SITE_RENDERER_ORIGIN}/api/health`,
    backendId: 'site-renderer',
    notes: 'App Hosting health route — JSON { status: "ok" }',
    expectJsonStatus: 'ok',
  },
];

/**
 * @param {number} status
 * @returns {boolean}
 */
export function isSuccessfulHttpStatus(status) {
  return status >= 200 && status < 300;
}

/**
 * @param {unknown} body
 * @param {string | undefined} expectedStatus
 * @returns {{ ok: boolean; message: string }}
 */
export function evaluateHealthBody(body, expectedStatus) {
  if (!expectedStatus) {
    return { ok: true, message: 'no JSON assertion' };
  }

  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'response body is not JSON object' };
  }

  const status = /** @type {{ status?: unknown }} */ (body).status;
  if (status !== expectedStatus) {
    return {
      ok: false,
      message: `expected status "${expectedStatus}", got ${String(status)}`,
    };
  }

  return { ok: true, message: `status="${expectedStatus}"` };
}

/**
 * @param {number} status
 * @param {unknown} body
 * @param {string | undefined} expectedJsonStatus
 * @returns {{ ok: boolean; message: string }}
 */
export function evaluateProbeResult(status, body, expectedJsonStatus) {
  if (!isSuccessfulHttpStatus(status)) {
    return { ok: false, message: `HTTP ${status}` };
  }

  if (expectedJsonStatus) {
    const health = evaluateHealthBody(body, expectedJsonStatus);
    if (!health.ok) {
      return health;
    }
    return { ok: true, message: `HTTP ${status}; ${health.message}` };
  }

  return { ok: true, message: `HTTP ${status}` };
}
