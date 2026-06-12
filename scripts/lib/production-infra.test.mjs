import { describe, expect, it } from 'vitest';
import {
  evaluateDnsAnswers,
  findMissingCallables,
  parseDigAnswers,
  verifyOrderedDeployLog,
} from './production-infra.mjs';

describe('parseDigAnswers', () => {
  it('parses CNAME answers', () => {
    const stdout = 'www.codedpixels.co.uk.\t3600\tIN\tCNAME\tmarketing.web.app.';
    expect(parseDigAnswers('CNAME', stdout)).toEqual(['marketing.web.app']);
  });

  it('parses A answers', () => {
    const stdout = 'codedpixels.co.uk.\t300\tIN\tA\t199.36.158.100';
    expect(parseDigAnswers('A', stdout)).toEqual(['199.36.158.100']);
  });
});

describe('evaluateDnsAnswers', () => {
  it('passes when answers exist without pattern', () => {
    const result = evaluateDnsAnswers(['1.2.3.4'], undefined);
    expect(result.ok).toBe(true);
  });

  it('fails when no answers', () => {
    expect(evaluateDnsAnswers([], ['firebase']).ok).toBe(false);
  });

  it('matches expected CNAME substring', () => {
    const result = evaluateDnsAnswers(['ghs.googlehosted.com'], ['googlehosted']);
    expect(result.ok).toBe(true);
  });
});

describe('verifyOrderedDeployLog', () => {
  it('accepts rules → indexes → functions → apphosting', () => {
    const log = [
      'Phase firestore:rules complete',
      'Phase firestore:indexes complete',
      'Phase functions complete',
      'Phase apphosting complete',
    ].join('\n');
    expect(verifyOrderedDeployLog(log).ok).toBe(true);
  });

  it('rejects functions before indexes', () => {
    const log = 'functions deploy\nfirestore:indexes\nfirestore:rules';
    expect(verifyOrderedDeployLog(log).ok).toBe(false);
  });
});

describe('findMissingCallables', () => {
  it('reports missing Callables', () => {
    const { ok, missing } = findMissingCallables(['submitSignup', 'publishSite']);
    expect(ok).toBe(false);
    expect(missing).toContain('submitLead');
  });
});
