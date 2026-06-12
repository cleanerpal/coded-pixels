import type { LeadStatus, TimestampLike } from './common';
export type LeadFormType = 'contact' | 'quote' | 'booking';
export interface LeadSource {
    pageId: string;
    pageSlug: string;
    formSectionId: string;
    formType: LeadFormType;
}
export interface LeadContact {
    name?: string;
    email?: string;
    phone?: string;
}
/** CRM inbox row — `companies/{companyId}/sites/{siteId}/leads/{leadId}` (schema §7.4) */
export interface Lead {
    status: LeadStatus;
    source: LeadSource;
    contact: LeadContact;
    fields: Record<string, string | number | boolean>;
    submittedAt: TimestampLike;
    readAt?: TimestampLike;
    archivedAt?: TimestampLike;
    ipHash?: string;
    spamScore?: number;
}
//# sourceMappingURL=lead.d.ts.map