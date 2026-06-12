import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SectionRenderer } from './SectionRenderer';

describe('SectionRenderer', () => {
  it('renders hero section without crashing', () => {
    const html = renderToString(
      <SectionRenderer
        sections={[
          {
            id: '00000000-0009-4000-8000-000000000001',
            type: 'hero',
            props: {
              headline: 'Built for growing businesses',
              subheadline: 'Showcase services, team, and results',
              ctaText: 'Contact us',
              ctaLink: '#contact',
              alignment: 'center',
            },
          },
        ]}
      />,
    );

    expect(html).toContain('Built for growing businesses');
    expect(html).toContain('Contact us');
  });
});
