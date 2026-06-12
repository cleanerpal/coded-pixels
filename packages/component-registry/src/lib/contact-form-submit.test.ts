import { describe, expect, it } from 'vitest';
import {
  buildSubmitLeadFields,
  buildSubmitLeadPayload,
  HONEYPOT_FIELD_NAME,
  HoneypotFilledError,
  isHoneypotFilled,
  mapSubmitLeadError,
} from './contact-form-submit';

describe('contact-form-submit', () => {
  it('detects a filled honeypot', () => {
    expect(isHoneypotFilled({ [HONEYPOT_FIELD_NAME]: 'bot' })).toBe(true);
    expect(isHoneypotFilled({ [HONEYPOT_FIELD_NAME]: '  ' })).toBe(false);
    expect(isHoneypotFilled({})).toBe(false);
  });

  it('rejects honeypot submissions when building fields', () => {
    expect(() =>
      buildSubmitLeadFields(
        { [HONEYPOT_FIELD_NAME]: 'spam', name: 'Jane' },
        ['name'],
      ),
    ).toThrow(HoneypotFilledError);
  });

  it('builds trimmed field map from form entries', () => {
    const fields = buildSubmitLeadFields(
      {
        name: ' Jane Doe ',
        email: 'jane@example.com',
        message: '',
        [HONEYPOT_FIELD_NAME]: '',
      },
      ['name', 'email', 'message'],
    );

    expect(fields).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
  });

  it('builds submitLead payload from tenant context', () => {
    const payload = buildSubmitLeadPayload(
      {
        companyId: 'co-1',
        siteId: 'site-1',
        pageId: 'page-1',
        pageSlug: 'contact',
        formSectionId: 'section-1',
        formType: 'contact',
      },
      { name: 'Jane', email: 'jane@example.com' },
      'recaptcha-token',
    );

    expect(payload).toEqual({
      companyId: 'co-1',
      siteId: 'site-1',
      source: {
        pageId: 'page-1',
        pageSlug: 'contact',
        formSectionId: 'section-1',
        formType: 'contact',
      },
      fields: { name: 'Jane', email: 'jane@example.com' },
      recaptchaToken: 'recaptcha-token',
    });
  });

  it('maps callable errors to user-facing copy', () => {
    expect(mapSubmitLeadError({ code: 'functions/resource-exhausted' })).toBe(
      'Too many requests — try again later.',
    );
    expect(mapSubmitLeadError({ code: 'functions/permission-denied' })).toBe(
      'Couldn\u2019t send — please refresh and try again.',
    );
    expect(mapSubmitLeadError(new Error('network'))).toBe(
      'Something went wrong — please try again.',
    );
  });
});
