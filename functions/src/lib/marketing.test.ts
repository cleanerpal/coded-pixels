import { describe, expect, it } from 'vitest';
import {
  PRIVACY_CONSENT_VERSION,
  SIGNUP_SOURCE,
  WAITLIST_SOURCE,
} from './constants';
import { rateLimitDocId } from './rateLimit';
import { hashIp, normalizeEmail, truncateUserAgent } from './requestMeta';
import { marketingSubmitPayloadSchema } from './schemas';

describe('marketingSubmitPayloadSchema', () => {
  const validConfig = {
    templateId: 'sparkle-clean',
    featureIds: ['crm'] as const,
    billingCycle: 'monthly' as const,
    monthlyTotalPence: 2499,
  };

  it('accepts a valid signup payload', () => {
    const parsed = marketingSubmitPayloadSchema.parse({
      email: '  User@Example.com ',
      config: validConfig,
      consentAccepted: true,
    });

    expect(parsed.email).toBe('user@example.com');
    expect(parsed.config.templateId).toBe('sparkle-clean');
  });

  it('rejects missing consent', () => {
    expect(() =>
      marketingSubmitPayloadSchema.parse({
        email: 'user@example.com',
        config: validConfig,
        consentAccepted: false,
      }),
    ).toThrow();
  });

  it('rejects invalid feature IDs', () => {
    expect(() =>
      marketingSubmitPayloadSchema.parse({
        email: 'user@example.com',
        config: {
          ...validConfig,
          featureIds: ['not-a-feature'],
        },
        consentAccepted: true,
      }),
    ).toThrow();
  });
});

describe('requestMeta helpers', () => {
  it('normalises email to lowercase', () => {
    expect(normalizeEmail('  Test@CodedPixels.co.uk ')).toBe(
      'test@codedpixels.co.uk',
    );
  });

  it('hashes IP addresses deterministically', () => {
    const first = hashIp('203.0.113.10');
    const second = hashIp('203.0.113.10');
    expect(first).toHaveLength(64);
    expect(first).toBe(second);
  });

  it('truncates user agent to 256 characters', () => {
    const longAgent = 'a'.repeat(300);
    const truncated = truncateUserAgent({
      headers: { 'user-agent': longAgent },
    } as Parameters<typeof truncateUserAgent>[0]);

    expect(truncated).toHaveLength(256);
  });
});

describe('rate limit doc IDs', () => {
  it('uses ipHash_action pattern from rules spec', () => {
    expect(rateLimitDocId('abc123', 'submitSignup')).toBe(
      'abc123_submitSignup',
    );
  });
});

describe('consent constants', () => {
  it('uses privacy-v1 and canonical sources', () => {
    expect(PRIVACY_CONSENT_VERSION).toBe('privacy-v1');
    expect(SIGNUP_SOURCE).toBe('get-started');
    expect(WAITLIST_SOURCE).toBe('configurator');
  });
});
