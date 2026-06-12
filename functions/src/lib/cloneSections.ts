import { randomUUID } from 'node:crypto';

export interface SectionNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: SectionNode[];
}

/** Deep-clone template sections with fresh UUIDs — template-seeding-ci-spec §8. */
export function cloneSectionsWithNewIds(sections: SectionNode[]): SectionNode[] {
  return sections.map((section) => ({
    id: randomUUID(),
    type: section.type,
    props: structuredClone(section.props),
    ...(section.children?.length
      ? { children: cloneSectionsWithNewIds(section.children) }
      : {}),
  }));
}
