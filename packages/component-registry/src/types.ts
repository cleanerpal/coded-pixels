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

export interface SectionComponentProps {
  props: Record<string, unknown>;
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
