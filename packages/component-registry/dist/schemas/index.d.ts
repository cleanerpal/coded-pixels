import type { z } from 'zod';
import type { ComponentType } from '../types';
export { linkSchema } from './common';
export * from './hero';
export * from './text-block';
export * from './features-grid';
export * from './contact-form';
export * from './image-gallery';
export * from './testimonials';
export * from './cta-banner';
export * from './footer';
export declare function getSchemaForType(type: string): z.ZodType<Record<string, unknown>> | undefined;
export declare const MVP_COMPONENT_TYPES: ComponentType[];
//# sourceMappingURL=index.d.ts.map