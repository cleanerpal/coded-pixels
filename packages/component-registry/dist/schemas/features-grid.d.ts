import { z } from 'zod';
export declare const featuresGridSchema: z.ZodObject<{
    headline: z.ZodOptional<z.ZodString>;
    columns: z.ZodDefault<z.ZodNumber>;
    items: z.ZodArray<z.ZodObject<{
        icon: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        description: string;
        icon?: string | undefined;
    }, {
        title: string;
        description: string;
        icon?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    columns: number;
    items: {
        title: string;
        description: string;
        icon?: string | undefined;
    }[];
    headline?: string | undefined;
}, {
    items: {
        title: string;
        description: string;
        icon?: string | undefined;
    }[];
    headline?: string | undefined;
    columns?: number | undefined;
}>;
export type FeaturesGridProps = z.infer<typeof featuresGridSchema>;
export declare const featuresGridDefaultProps: FeaturesGridProps;
//# sourceMappingURL=features-grid.d.ts.map