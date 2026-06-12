import { z } from 'zod';
/** Anchor, tel, mailto, or absolute URL — matches template seed link patterns */
export declare const linkSchema: z.ZodUnion<[z.ZodString, z.ZodString, z.ZodString, z.ZodString]>;
export type LinkValue = z.infer<typeof linkSchema>;
//# sourceMappingURL=common.d.ts.map