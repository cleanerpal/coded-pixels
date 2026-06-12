/** Hidden honeypot field — site-renderer-architecture.md §9.2 */
export const HONEYPOT_FIELD_NAME = '_hp';

export function assertHoneypotClean(
  fields: Record<string, string | number | boolean>,
): void {
  const honeypot = fields[HONEYPOT_FIELD_NAME];
  if (honeypot !== undefined && String(honeypot).trim().length > 0) {
    throw new Error('HONEYPOT_FILLED');
  }
}

export function stripHoneypotField(
  fields: Record<string, string | number | boolean>,
): Record<string, string | number | boolean> {
  const { [HONEYPOT_FIELD_NAME]: _ignored, ...rest } = fields;
  return rest;
}
