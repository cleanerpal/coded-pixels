import { describe, expect, it } from 'vitest';
import {
  cloneSectionsWithNewIds,
  demoCompanyId,
  resolveDemoUpsertAction,
} from './lib/demo-seed-logic.mjs';

describe('demoCompanyId', () => {
  it('prefixes demo- to templateId', () => {
    expect(demoCompanyId('sparkle-clean')).toBe('demo-sparkle-clean');
  });
});

describe('cloneSectionsWithNewIds', () => {
  it('assigns fresh UUIDs and deep-clones props', () => {
    const sections = [
      {
        id: 'old-id',
        type: 'hero',
        props: { headline: 'Hello', nested: { count: 1 } },
      },
    ];

    const cloned = cloneSectionsWithNewIds(sections, () => 'new-uuid-1');

    expect(cloned).toEqual([
      {
        id: 'new-uuid-1',
        type: 'hero',
        props: { headline: 'Hello', nested: { count: 1 } },
      },
    ]);
    expect(cloned[0].props).not.toBe(sections[0].props);
    expect(cloned[0].props.nested).not.toBe(sections[0].props.nested);
  });

  it('recursively clones nested children', () => {
    const sections = [
      {
        id: 'parent',
        type: 'group',
        props: {},
        children: [{ id: 'child', type: 'text', props: { body: 'Hi' } }],
      },
    ];

    let call = 0;
    const cloned = cloneSectionsWithNewIds(sections, () => `uuid-${++call}`);

    expect(cloned[0].id).toBe('uuid-1');
    expect(cloned[0].children[0].id).toBe('uuid-2');
    expect(cloned[0].children[0].props.body).toBe('Hi');
  });

  it('omits children key when empty', () => {
    const sections = [{ id: 'a', type: 'hero', props: {}, children: [] }];
    const cloned = cloneSectionsWithNewIds(sections, () => 'x');
    expect(cloned[0]).not.toHaveProperty('children');
  });
});

describe('resolveDemoUpsertAction', () => {
  const hash = 'abc123';

  it('returns missing-template when catalogue doc absent', () => {
    expect(
      resolveDemoUpsertAction({
        templateExists: false,
        companyExists: false,
      }),
    ).toBe('missing-template');
  });

  it('returns create when company doc absent', () => {
    expect(
      resolveDemoUpsertAction({
        templateExists: true,
        templateContentHash: hash,
        companyExists: false,
      }),
    ).toBe('create');
  });

  it('returns skip when applied hash matches template hash', () => {
    expect(
      resolveDemoUpsertAction({
        templateExists: true,
        templateContentHash: hash,
        companyExists: true,
        appliedTemplateContentHash: hash,
      }),
    ).toBe('skip');
  });

  it('returns update when applied hash differs', () => {
    expect(
      resolveDemoUpsertAction({
        templateExists: true,
        templateContentHash: 'new-hash',
        companyExists: true,
        appliedTemplateContentHash: 'old-hash',
      }),
    ).toBe('update');
  });

  it('returns update when applied hash missing on existing company', () => {
    expect(
      resolveDemoUpsertAction({
        templateExists: true,
        templateContentHash: hash,
        companyExists: true,
      }),
    ).toBe('update');
  });

  it('throws when template exists but contentHash missing', () => {
    expect(() =>
      resolveDemoUpsertAction({
        templateExists: true,
        companyExists: false,
      }),
    ).toThrow(/templateContentHash required/);
  });
});
