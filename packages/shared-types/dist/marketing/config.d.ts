/** Configurator feature IDs — canonical list (firestore-schema.md §3) */
export type FeatureId = 'crm' | 'email-automation' | 'booking' | 'ecommerce' | 'vat-mtd' | 'ai-content' | 'custom-template' | 'analytics-seo' | 'sms' | 'white-label' | 'priority-support';
export type BillingCycle = 'monthly' | 'annual';
export type PackageId = 'starter' | 'growth' | 'pro' | 'custom';
export type CustomTemplateBilling = 'recurring' | 'one-time';
/** Snapshot from configurator — firestore-schema.md §3 (signups, waitlist, provisioning) */
export interface ConfigSnapshot {
    templateId: string;
    featureIds: FeatureId[];
    billingCycle: BillingCycle;
    monthlyTotalPence: number;
    annualTotalPence?: number;
    customTemplateBilling?: CustomTemplateBilling;
    oneTimeFeesPence?: number;
    packageId?: PackageId;
}
/** Runtime configurator state — encoded in URL params (ENG-006) */
export interface ConfigState {
    templateId: string | null;
    featureIds: FeatureId[];
    billingCycle: BillingCycle;
    customTemplateBilling?: CustomTemplateBilling;
    packageId?: PackageId;
}
/** Pricing summary line item (recurring or one-time) */
export interface LineItem {
    id: string;
    label: string;
    amountPence: number;
    kind: 'base' | 'feature' | 'one-time';
}
//# sourceMappingURL=config.d.ts.map