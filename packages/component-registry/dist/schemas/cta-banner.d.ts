import { z } from 'zod';
export declare const ctaBannerSchema: z.ZodObject<{
    headline: z.ZodString;
    subheadline: z.ZodOptional<z.ZodString>;
    ctaText: z.ZodOptional<z.ZodString>;
    ctaLink: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString, z.ZodString, z.ZodString]>>;
}, "strip", z.ZodTypeAny, {
    headline: string;
    subheadline?: string | undefined;
    ctaText?: string | undefined;
    ctaLink?: string | undefined;
}, {
    headline: string;
    subheadline?: string | undefined;
    ctaText?: string | undefined;
    ctaLink?: string | undefined;
}>;
export type CtaBannerProps = z.infer<typeof ctaBannerSchema>;
export declare const ctaBannerDefaultProps: CtaBannerProps;
//# sourceMappingURL=cta-banner.d.ts.map