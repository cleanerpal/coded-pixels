import { describe, expect, it } from 'vitest';
import {
  assertMinimumSectionBar,
  buildScaffoldSeed,
  sectionUuid,
  titleCaseFromTemplateId,
} from './lib/new-template-logic.mjs';
import { templateSeedSchema, validateSectionTree } from './lib/schemas.mjs';

describe('new-template-logic', () => {
  it('titleCaseFromTemplateId converts kebab-case', () => {
    expect(titleCaseFromTemplateId('wellness-clinic')).toBe('Wellness Clinic');
  });

  it('buildScaffoldSeed produces Zod-valid seed with Q68 section bar (features-grid)', () => {
    const seed = buildScaffoldSeed({
      templateId: 'scaffold-test',
      name: 'Scaffold Test',
      category: 'general-business',
      description: 'Test scaffold',
      sortOrder: 50,
      middleSection: 'features-grid',
    });

    expect(seed.templateId).toBe('scaffold-test');
    expect(templateSeedSchema.parse(seed)).toEqual(seed);
    validateSectionTree(seed.defaultSections);
    assertMinimumSectionBar(seed.defaultSections);
    expect(seed.defaultSections.map((s) => s.type)).toEqual([
      'hero',
      'features-grid',
      'cta-banner',
      'footer',
    ]);
  });

  it('buildScaffoldSeed supports text-block middle section', () => {
    const seed = buildScaffoldSeed({
      templateId: 'text-middle',
      middleSection: 'text-block',
    });

    assertMinimumSectionBar(seed.defaultSections);
    expect(seed.defaultSections[1].type).toBe('text-block');
  });

  it('sectionUuid returns stable placeholder ids', () => {
    expect(sectionUuid(1)).toBe('00000000-0000-4000-8000-000000000001');
    expect(sectionUuid(4)).toBe('00000000-0000-4000-8000-000000000004');
  });

  it('rejects invalid templateId', () => {
    expect(() => buildScaffoldSeed({ templateId: 'Bad_ID' })).toThrow(/kebab-case/);
  });
});
