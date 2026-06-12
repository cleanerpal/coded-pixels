import type { z } from 'zod';
import type { ComponentType } from '../types';
import { contactFormSchema } from './contact-form';
import { ctaBannerSchema } from './cta-banner';
import { featuresGridSchema } from './features-grid';
import { footerSchema } from './footer';
import { heroSchema } from './hero';
import { imageGallerySchema } from './image-gallery';
import { testimonialsSchema } from './testimonials';
import { textBlockSchema } from './text-block';

export { linkSchema } from './common';
export * from './hero';
export * from './text-block';
export * from './features-grid';
export * from './contact-form';
export * from './image-gallery';
export * from './testimonials';
export * from './cta-banner';
export * from './footer';

const schemaMap: Record<ComponentType, z.ZodType<Record<string, unknown>>> = {
  hero: heroSchema,
  'text-block': textBlockSchema,
  'features-grid': featuresGridSchema,
  'contact-form': contactFormSchema,
  'image-gallery': imageGallerySchema,
  testimonials: testimonialsSchema,
  'cta-banner': ctaBannerSchema,
  footer: footerSchema,
};

export function getSchemaForType(type: string): z.ZodType<Record<string, unknown>> | undefined {
  return schemaMap[type as ComponentType];
}

export const MVP_COMPONENT_TYPES = Object.keys(schemaMap) as ComponentType[];
