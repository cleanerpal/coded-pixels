/**
 * Pure demo-seed helpers — unit-testable without Firestore emulator.
 * INF-005 / Forge & Scale advisory rec #1 — idempotency decision paths.
 * Aligned with Dr. Alex Rivera on seed idempotency (spec §3.5).
 */
import { randomUUID as nodeRandomUUID } from 'node:crypto';

/**
 * Deep-clone template sections with fresh UUIDs — template-seeding-ci-spec §8.
 * @param {Array<{ id: string; type: string; props: Record<string, unknown>; children?: unknown[] }>} sections
 * @param {() => string} [uuidFn]
 */
export function cloneSectionsWithNewIds(sections, uuidFn = nodeRandomUUID) {
  return sections.map((section) => ({
    id: uuidFn(),
    type: section.type,
    props: structuredClone(section.props),
    ...(section.children?.length
      ? { children: cloneSectionsWithNewIds(section.children, uuidFn) }
      : {}),
  }));
}

/**
 * @param {string} templateId
 */
export function demoCompanyId(templateId) {
  return `demo-${templateId}`;
}

/**
 * Pure upsert decision — mirrors seed-demos.mjs create / skip / update paths.
 * @param {{
 *   templateExists: boolean;
 *   companyExists: boolean;
 *   appliedTemplateContentHash?: string;
 *   templateContentHash?: string;
 * }} input
 * @returns {'missing-template' | 'create' | 'skip' | 'update'}
 */
export function resolveDemoUpsertAction(input) {
  if (!input.templateExists) {
    return 'missing-template';
  }

  if (!input.templateContentHash) {
    throw new Error('templateContentHash required when template exists');
  }

  if (!input.companyExists) {
    return 'create';
  }

  if (input.appliedTemplateContentHash === input.templateContentHash) {
    return 'skip';
  }

  return 'update';
}
