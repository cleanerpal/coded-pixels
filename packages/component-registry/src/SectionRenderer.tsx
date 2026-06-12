import type { ReactNode } from 'react';
import type { Section } from '@codedpixels/shared-types';
import { getComponentDefinition } from './registry';

export interface SectionRendererProps {
  sections: Section[];
}

function renderSection(section: Section): ReactNode {
  const definition = getComponentDefinition(section.type);
  if (!definition) {
    return null;
  }

  const parsed = definition.schema.safeParse(section.props);
  const props = parsed.success ? parsed.data : definition.defaultProps;
  const Component = definition.Component;

  return (
    <div key={section.id} data-section-type={section.type} data-section-id={section.id}>
      <Component props={props} />
      {section.children?.length ? (
        <div data-section-children="">
          {section.children.map((child) => renderSection(child))}
        </div>
      ) : null}
    </div>
  );
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  return <>{sections.map((section) => renderSection(section))}</>;
}
