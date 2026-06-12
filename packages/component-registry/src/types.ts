import type { ComponentType as ReactComponentType } from 'react';
import type { z } from 'zod';

/** MVP section types — builder-ui-spec §3.1 */
export type ComponentType =
  | 'hero'
  | 'text-block'
  | 'features-grid'
  | 'contact-form'
  | 'image-gallery'
  | 'testimonials'
  | 'cta-banner'
  | 'footer';

export type ComponentCategory = 'Layout' | 'Content' | 'Forms' | 'Commerce' | 'Media';

export interface EditorPanelProps {
  props: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}

/** Server-injected tenant context for live form submission (site-renderer only). */
export interface FormSubmissionContext {
  companyId: string;
  siteId: string;
  pageId: string;
  pageSlug: string;
  formSectionId: string;
  formType: 'contact' | 'quote' | 'booking';
}

export interface SubmitLeadPayload {
  companyId: string;
  siteId: string;
  source: {
    pageId: string;
    pageSlug: string;
    formSectionId: string;
    formType: 'contact' | 'quote' | 'booking';
  };
  fields: Record<string, string | number | boolean>;
  recaptchaToken?: string;
}

export type SubmitLeadFn = (
  payload: SubmitLeadPayload,
) => Promise<{ success: true }>;

export type GetRecaptchaTokenFn = () => Promise<string | undefined>;

export interface SectionComponentProps {
  props: Record<string, unknown>;
  formContext?: FormSubmissionContext;
  submitLead?: SubmitLeadFn;
  getRecaptchaToken?: GetRecaptchaTokenFn;
}

/** Base tenant + page metadata passed into SectionRenderer on live sites. */
export interface TenantFormContext {
  companyId: string;
  siteId: string;
  pageId: string;
  pageSlug: string;
}

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string;
  category: ComponentCategory;
  schema: z.ZodType<Record<string, unknown>>;
  defaultProps: Record<string, unknown>;
  Component: ReactComponentType<SectionComponentProps>;
  EditorPanel: ReactComponentType<EditorPanelProps>;
}

export type ComponentRegistry = Record<ComponentType, ComponentDefinition>;

export type ValidateSectionPropsResult =
  | { success: true; data: Record<string, unknown> }
  | { success: false; error: string };
