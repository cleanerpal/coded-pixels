import { z } from 'zod';
export declare const heroSchema: z.ZodObject<{
    headline: z.ZodString;
    subheadline: z.ZodOptional<z.ZodString>;
    ctaText: z.ZodOptional<z.ZodString>;
    ctaLink: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString, z.ZodString, z.ZodString]>>;
    backgroundImage: z.ZodOptional<z.ZodString>;
    alignment: z.ZodDefault<z.ZodEnum<["left", "center", "right"]>>;
}, "strip", z.ZodTypeAny, {
    headline: string;
    alignment: "left" | "center" | "right";
    subheadline?: string | undefined;
    ctaText?: string | undefined;
    ctaLink?: string | undefined;
    backgroundImage?: string | undefined;
}, {
    headline: string;
    subheadline?: string | undefined;
    ctaText?: string | undefined;
    ctaLink?: string | undefined;
    backgroundImage?: string | undefined;
    alignment?: "left" | "center" | "right" | undefined;
}>;
export type HeroProps = z.infer<typeof heroSchema>;
export declare const heroDefaultProps: HeroProps;
//# sourceMappingURL=hero.d.ts.map