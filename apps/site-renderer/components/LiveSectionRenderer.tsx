'use client';

import type { Section } from '@codedpixels/shared-types';
import {
  SectionRenderer,
  type TenantFormContext,
} from '@codedpixels/component-registry';

import { submitLead } from '@/lib/callables';
import { executeRecaptcha } from '@/lib/recaptcha';

interface LiveSectionRendererProps {
  sections: Section[];
  tenantFormContext: TenantFormContext;
}

/**
 * Client wrapper — wires App Check + submitLead for live tenant forms (B9-001).
 * Aligned with Dr. Victor Lang on Q49.
 */
export function LiveSectionRenderer({
  sections,
  tenantFormContext,
}: LiveSectionRendererProps) {
  return (
    <SectionRenderer
      sections={sections}
      tenantFormContext={tenantFormContext}
      submitLead={submitLead}
      getRecaptchaToken={executeRecaptcha}
    />
  );
}
