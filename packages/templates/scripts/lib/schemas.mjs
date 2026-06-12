import { z } from 'zod';

const ALLOWED_SECTION_TYPES = new Set([
  'hero',
  'text-block',
  'features-grid',
  'contact-form',
  'image-gallery',
  'testimonials',
  'cta-banner',
  'footer',
]);

const sectionSchema = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    type: z.string().min(1),
    props: z.record(z.unknown()),
    children: z.array(sectionSchema).optional(),
  }),
);

export const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  seedVersion: z.number().int().positive(),
  templates: z.array(z.string().min(1)).length(11),
});

export const templateSeedSchema = z.object({
  templateId: z.string().min(1),
  metadata: z.object({
    name: z.string().min(1),
    category: z.string(),
    description: z.string().min(1),
    sortOrder: z.number().int(),
    isCustomTemplate: z.boolean(),
  }),
  defaultPage: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    seo: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  }),
  defaultSections: z.array(sectionSchema),
});

/** @typedef {z.infer<typeof templateSeedSchema>} TemplateSeed */
/** @typedef {z.infer<typeof manifestSchema>} TemplateManifest */

/**
 * @param {unknown} sections
 * @param {number} [depth]
 */
export function validateSectionTree(sections, depth = 0) {
  if (depth > 2) {
    throw new Error(`Section nesting exceeds max depth 2 at depth ${depth}`);
  }
  for (const section of /** @type {Array<{ type: string; children?: unknown[] }>} */ (
    sections
  )) {
    if (!ALLOWED_SECTION_TYPES.has(section.type)) {
      throw new Error(`Unknown section type "${section.type}"`);
    }
    if (section.children?.length) {
      validateSectionTree(section.children, depth + 1);
    }
  }
}

/**
 * @param {string} source
 * @returns {Array<{ id: string; name: string; category: string; description: string; sortOrder: number }>}
 */
export function parseMarketingTemplates(source) {
  const blocks =
    source.match(/\{\s*id:\s*'[^']+',[\s\S]*?sortOrder:\s*\d+,?\s*\}/g) ?? [];
  return blocks.map((block) => {
    const id = block.match(/id:\s*'([^']+)'/)?.[1];
    const name = block.match(/name:\s*'([^']+)'/)?.[1];
    const category = block.match(/category:\s*'([^']+)'/)?.[1];
    const description = block.match(/description:\s*'([^']+)'/)?.[1];
    const sortOrder = block.match(/sortOrder:\s*(\d+)/)?.[1];
    if (!id || !name || !category || !description || !sortOrder) {
      throw new Error(`Failed to parse template block in templates.ts`);
    }
    return {
      id,
      name,
      category,
      description,
      sortOrder: Number(sortOrder),
    };
  });
}
