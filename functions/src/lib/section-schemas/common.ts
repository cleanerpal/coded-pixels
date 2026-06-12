import { z } from 'zod';

/** Anchor, tel, mailto, or absolute URL — matches template seed link patterns */
export const linkSchema = z.union([
  z.string().url(),
  z.string().regex(/^#[\w-]+$/),
  z.string().regex(/^tel:[+\d\s()-]+$/),
  z.string().regex(/^mailto:[^\s]+$/),
]);

export type LinkValue = z.infer<typeof linkSchema>;
