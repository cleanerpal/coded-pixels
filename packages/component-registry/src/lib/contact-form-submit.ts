import type { FormSubmissionContext, SubmitLeadPayload } from '../types';

/** Hidden honeypot field — aligned with site-renderer-architecture.md §9.2 */
export const HONEYPOT_FIELD_NAME = '_hp';

export class HoneypotFilledError extends Error {
  constructor() {
    super('Honeypot field filled');
    this.name = 'HoneypotFilledError';
  }
}

export function isHoneypotFilled(
  fields: Record<string, FormDataEntryValue | null | undefined>,
): boolean {
  const value = fields[HONEYPOT_FIELD_NAME];
  if (value == null) {
    return false;
  }
  return String(value).trim().length > 0;
}

export function buildSubmitLeadFields(
  entries: Record<string, FormDataEntryValue | null | undefined>,
  fieldIds: string[],
): Record<string, string> {
  if (isHoneypotFilled(entries)) {
    throw new HoneypotFilledError();
  }

  const fields: Record<string, string> = {};

  for (const fieldId of fieldIds) {
    const raw = entries[fieldId];
    if (raw == null) {
      continue;
    }
    const value = String(raw).trim();
    if (value.length > 0) {
      fields[fieldId] = value;
    }
  }

  return fields;
}

export function buildSubmitLeadPayload(
  formContext: FormSubmissionContext,
  fields: Record<string, string | number | boolean>,
  recaptchaToken?: string,
): SubmitLeadPayload {
  return {
    companyId: formContext.companyId,
    siteId: formContext.siteId,
    source: {
      pageId: formContext.pageId,
      pageSlug: formContext.pageSlug,
      formSectionId: formContext.formSectionId,
      formType: formContext.formType,
    },
    fields,
    ...(recaptchaToken ? { recaptchaToken } : {}),
  };
}

/** User-facing copy — site-renderer-architecture.md §9.3 */
export function mapSubmitLeadError(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: string }).code)
      : undefined;

  if (code === 'functions/resource-exhausted') {
    return 'Too many requests — try again later.';
  }

  if (
    code === 'functions/permission-denied' ||
    code === 'functions/unauthenticated' ||
    code === 'functions/failed-precondition'
  ) {
    return 'Couldn\u2019t send — please refresh and try again.';
  }

  return 'Something went wrong — please try again.';
}
