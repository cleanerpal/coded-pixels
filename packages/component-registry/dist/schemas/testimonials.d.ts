import { z } from 'zod';
export declare const testimonialsSchema: z.ZodObject<{
    headline: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        quote: z.ZodString;
        author: z.ZodString;
        role: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        quote: string;
        author: string;
        role?: string | undefined;
    }, {
        quote: string;
        author: string;
        role?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        quote: string;
        author: string;
        role?: string | undefined;
    }[];
    headline?: string | undefined;
}, {
    items: {
        quote: string;
        author: string;
        role?: string | undefined;
    }[];
    headline?: string | undefined;
}>;
export type TestimonialsProps = z.infer<typeof testimonialsSchema>;
export declare const testimonialsDefaultProps: TestimonialsProps;
//# sourceMappingURL=testimonials.d.ts.map