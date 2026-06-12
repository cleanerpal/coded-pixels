import { describe, expect, it } from 'vitest';

import {
  PRODUCTION_PROBES,
  evaluateHealthBody,
  evaluateProbeResult,
  isSuccessfulHttpStatus,
} from './production-probes.mjs';

describe('PRODUCTION_PROBES', () => {
  it('includes all §2.4 #3 endpoints', () => {
    const ids = PRODUCTION_PROBES.map((probe) => probe.id);
    expect(ids).toEqual([
      'marketing-home',
      'marketing-get-started',
      'site-renderer-demo-tenant',
      'site-renderer-health',
    ]);
  });
});

describe('isSuccessfulHttpStatus', () => {
  it('accepts 2xx', () => {
    expect(isSuccessfulHttpStatus(200)).toBe(true);
    expect(isSuccessfulHttpStatus(204)).toBe(true);
  });

  it('rejects non-2xx', () => {
    expect(isSuccessfulHttpStatus(404)).toBe(false);
    expect(isSuccessfulHttpStatus(500)).toBe(false);
  });
});

describe('evaluateHealthBody', () => {
  it('passes when status matches', () => {
    expect(evaluateHealthBody({ status: 'ok' }, 'ok').ok).toBe(true);
  });

  it('fails when status mismatches', () => {
    expect(evaluateHealthBody({ status: 'degraded' }, 'ok').ok).toBe(false);
  });
});

describe('evaluateProbeResult', () => {
  it('passes HTML probe on 200', () => {
    expect(evaluateProbeResult(200, null, undefined).ok).toBe(true);
  });

  it('requires JSON status for health probe', () => {
    expect(evaluateProbeResult(200, { status: 'ok' }, 'ok').ok).toBe(true);
    expect(evaluateProbeResult(200, { status: 'fail' }, 'ok').ok).toBe(false);
  });

  it('fails on 5xx', () => {
    expect(evaluateProbeResult(503, null, undefined).ok).toBe(false);
  });
});
