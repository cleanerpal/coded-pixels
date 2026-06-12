import { z } from 'zod';
/** Plain string for seeds; Tiptap JSON object supported per builder-ui-spec §13 */
export declare const textBlockSchema: z.ZodObject<{
    headline: z.ZodOptional<z.ZodString>;
    body: z.ZodUnion<[z.ZodString, z.ZodRecord<z.ZodString, z.ZodUnknown>]>;
}, "strip", z.ZodTypeAny, {
    body: string | Record<string, unknown>;
    headline?: string | undefined;
}, {
    body: string | Record<string, unknown>;
    headline?: string | undefined;
}>;
export type TextBlockProps = z.infer<typeof textBlockSchema>;
export declare const textBlockDefaultProps: TextBlockProps;
//# sourceMappingURL=text-block.d.ts.map