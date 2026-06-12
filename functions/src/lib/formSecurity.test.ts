import { describe, expect, it } from 'vitest';
import {
  assertHoneypotClean,
  HONEYPOT_FIELD_NAME,
  stripHoneypotField,
} from './honeypot';
import {
  isRecaptchaScoreAcceptable,
  shouldBypassRecaptcha,
} from './recaptcha';

describe('honeypot', () => {
  it('rejects filled honeypot values', () => {
    expect(() =>
      assertHoneypotClean({ [HONEYPOT_FIELD_NAME]: 'bot', name: 'Jane' }),
    ).toThrow('HONEYPOT_FILLED');
  });

  it('strips honeypot field before persistence', () => {
    expect(
      stripHoneypotField({
        [HONEYPOT_FIELD_NAME]: '',
        name: 'Jane',
      }),
    ).toEqual({ name: 'Jane' });
  });
});

describe('recaptcha', () => {
  it('accepts scores at or above 0.5', () => {
    expect(isRecaptchaScoreAcceptable(0.5)).toBe(true);
    expect(isRecaptchaScoreAcceptable(0.49)).toBe(false);
  });

  it('supports env bypass flag', () => {
    const original = process.env.DISABLE_RECAPTCHA;
    process.env.DISABLE_RECAPTCHA = 'true';
    expect(shouldBypassRecaptcha()).toBe(true);
    process.env.DISABLE_RECAPTCHA = original;
  });
});
