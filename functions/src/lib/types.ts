/** Mirror of @codedpixels/component-registry validation types — functions-only copy for CJS runtime. */
export type ValidateSectionPropsResult =
  | { success: true; data: Record<string, unknown> }
  | { success: false; error: string };

export type ComponentType =
  | 'hero'
  | 'text-block'
  | 'features-grid'
  | 'contact-form'
  | 'image-gallery'
  | 'testimonials'
  | 'cta-banner'
  | 'footer';
