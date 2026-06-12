import type { FormSubmissionContext, SubmitLeadPayload } from '../types';
/** Hidden honeypot field — aligned with site-renderer-architecture.md §9.2 */
export declare const HONEYPOT_FIELD_NAME = "_hp";
export declare class HoneypotFilledError extends Error {
    constructor();
}
export declare function isHoneypotFilled(fields: Record<string, FormDataEntryValue | null | undefined>): boolean;
export declare function buildSubmitLeadFields(entries: Record<string, FormDataEntryValue | null | undefined>, fieldIds: string[]): Record<string, string>;
export declare function buildSubmitLeadPayload(formContext: FormSubmissionContext, fields: Record<string, string | number | boolean>, recaptchaToken?: string): SubmitLeadPayload;
/** User-facing copy — site-renderer-architecture.md §9.3 */
export declare function mapSubmitLeadError(error: unknown): string;
//# sourceMappingURL=contact-form-submit.d.ts.map