import type { ReactNode } from 'react';
import type { Section } from '@codedpixels/shared-types';
import { getComponentDefinition } from './registry';
import type {
  GetRecaptchaTokenFn,
  SubmitLeadFn,
  TenantFormContext,
} from './types';

export interface SectionRendererProps {
  sections: Section[];
  tenantFormContext?: TenantFormContext;
  submitLead?: SubmitLeadFn;
  getRecaptchaToken?: GetRecaptchaTokenFn;
}

interface RenderSectionOptions {
  tenantFormContext?: TenantFormContext;
  submitLead?: SubmitLeadFn;
  getRecaptchaToken?: GetRecaptchaTokenFn;
}

function renderSection(section: Section, options: RenderSectionOptions): ReactNode {
  const definition = getComponentDefinition(section.type);
  if (!definition) {
    return null;
  }

  const parsed = definition.schema.safeParse(section.props);
  const props = parsed.success ? parsed.data : definition.defaultProps;
  const Component = definition.Component;

  const formContext =
    section.type === 'contact-form' && options.tenantFormContext
      ? {
          ...options.tenantFormContext,
          formSectionId: section.id,
          formType: 'contact' as const,
        }
      : undefined;

  return (
    <div key={section.id} data-section-type={section.type} data-section-id={section.id}>
      <Component
        props={props}
        formContext={formContext}
        submitLead={options.submitLead}
        getRecaptchaToken={options.getRecaptchaToken}
      />
      {section.children?.length ? (
        <div data-section-children="">
          {section.children.map((child) => renderSection(child, options))}
        </div>
      ) : null}
    </div>
  );
}

export function SectionRenderer({
  sections,
  tenantFormContext,
  submitLead,
  getRecaptchaToken,
}: SectionRendererProps) {
  const options: RenderSectionOptions = {
    tenantFormContext,
    submitLead,
    getRecaptchaToken,
  };

  return <>{sections.map((section) => renderSection(section, options))}</>;
}
