import { describe, expect, it, vi } from 'vitest';

const callableMock = vi.fn();

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => callableMock),
}));

vi.mock('@/lib/firebase', () => ({
  getFirebaseFunctions: vi.fn(() => ({})),
}));

describe('submitLead client wrapper', () => {
  it('calls the submitLead callable with the payload', async () => {
    callableMock.mockResolvedValueOnce({ data: { success: true } });

    const { submitLead } = await import('./callables');

    const payload = {
      companyId: 'co-1',
      siteId: 'site-1',
      source: {
        pageId: 'page-1',
        pageSlug: 'contact',
        formSectionId: 'section-1',
        formType: 'contact' as const,
      },
      fields: {
        name: 'Jane Doe',
        email: 'jane@example.com',
      },
      recaptchaToken: 'token-123',
    };

    const result = await submitLead(payload);

    expect(result).toEqual({ success: true });
    expect(callableMock).toHaveBeenCalledWith(payload);
  });
});
