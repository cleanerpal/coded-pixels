import { z } from 'zod';

export const revalidateRequestSchema = z.object({
  companyId: z.string().min(1),
  siteId: z.string().min(1),
  slug: z.string().min(1),
  paths: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type RevalidateRequestBody = z.infer<typeof revalidateRequestSchema>;

export interface RevalidateHandlerResult {
  revalidated: true;
  paths: string[];
  at: string;
}

export interface RevalidateHandlerOptions {
  secret: string | undefined;
  providedSecret: string | null;
  body: unknown;
  revalidateTag: (tag: string) => void;
  revalidatePath: (path: string) => void;
}

export type RevalidateHandlerResponse =
  | { status: 401; body: { error: string } }
  | { status: 400; body: { error: string } }
  | { status: 200; body: RevalidateHandlerResult };

/**
 * On-demand ISR revalidation handler — site-renderer-architecture.md §7.3.
 * Aligned with Dr. Lena Petrova on revalidation contract.
 */
export function handleRevalidateRequest(
  options: RevalidateHandlerOptions,
): RevalidateHandlerResponse {
  if (!options.secret || options.providedSecret !== options.secret) {
    return { status: 401, body: { error: 'Unauthorized' } };
  }

  const parsed = revalidateRequestSchema.safeParse(options.body);
  if (!parsed.success) {
    return { status: 400, body: { error: 'Invalid request body' } };
  }

  const { siteId, paths, tags } = parsed.data;
  const revalidatedPaths = paths?.length ? paths : ['/'];

  const tagList = tags?.length ? tags : [`site:${siteId}`];
  for (const tag of tagList) {
    options.revalidateTag(tag);
  }

  for (const path of revalidatedPaths) {
    const normalised = path.startsWith('/') ? path : `/${path}`;
    options.revalidatePath(normalised);
  }

  return {
    status: 200,
    body: {
      revalidated: true,
      paths: revalidatedPaths,
      at: new Date().toISOString(),
    },
  };
}
