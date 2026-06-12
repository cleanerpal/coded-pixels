import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const leadSourceSchema = z.object({
  pageId: z.string().min(1),
  pageSlug: z.string().min(1),
  formSectionId: z.string().min(1),
  formType: z.enum(['contact', 'quote', 'booking']),
});

const submitLeadPayloadSchema = z.object({
  companyId: z.string().min(1),
  siteId: z.string().min(1),
  source: leadSourceSchema,
  fields: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .refine((fields) => Object.keys(fields).length > 0, {
      message: 'At least one form field is required',
    }),
});

describe('submitLeadPayloadSchema', () => {
  it('accepts a valid contact form payload', () => {
    const parsed = submitLeadPayloadSchema.parse({
      companyId: 'company-1',
      siteId: 'site-1',
      source: {
        pageId: 'home',
        pageSlug: 'home',
        formSectionId: 'contact-1',
        formType: 'contact',
      },
      fields: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello',
      },
    });

    expect(parsed.source.formType).toBe('contact');
    expect(parsed.fields.email).toBe('jane@example.com');
  });

  it('rejects empty fields map', () => {
    expect(() =>
      submitLeadPayloadSchema.parse({
        companyId: 'company-1',
        siteId: 'site-1',
        source: {
          pageId: 'home',
          pageSlug: 'home',
          formSectionId: 'contact-1',
          formType: 'contact',
        },
        fields: {},
      }),
    ).toThrow();
  });
});
