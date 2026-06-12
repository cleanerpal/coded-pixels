import type { Section } from '@codedpixels/shared-types';
import type { GetRecaptchaTokenFn, SubmitLeadFn, TenantFormContext } from './types';
export interface SectionRendererProps {
    sections: Section[];
    tenantFormContext?: TenantFormContext;
    submitLead?: SubmitLeadFn;
    getRecaptchaToken?: GetRecaptchaTokenFn;
}
export declare function SectionRenderer({ sections, tenantFormContext, submitLead, getRecaptchaToken, }: SectionRendererProps): import("react").JSX.Element;
//# sourceMappingURL=SectionRenderer.d.ts.map