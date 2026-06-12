/**
 * B10-002 — scaffold logic for new library template seeds
 * Aligned with Dr. Alex Rivera on Q69 skeleton scope · Dr. Samuel Ruiz on Q68 quality bar
 */

/** @typedef {'features-grid' | 'text-block'} MiddleSectionType */

export const TEMPLATE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const MINIMUM_SECTION_TYPES = Object.freeze({
  hero: 'hero',
  middle: ['features-grid', 'text-block'],
  cta: 'cta-banner',
  footer: 'footer',
});

/**
 * @param {string} templateId
 */
export function titleCaseFromTemplateId(templateId) {
  return templateId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Stable placeholder UUIDs for scaffold sections (replaced during tenant provision).
 * @param {number} index 1-based section index
 */
export function sectionUuid(index) {
  return `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
}

/**
 * @param {string} displayName
 * @param {number} index
 */
function buildHeroSection(displayName, index) {
  return {
    id: sectionUuid(index),
    type: 'hero',
    props: {
      headline: `Welcome to ${displayName}`,
      subheadline: 'Replace this headline with your starter design copy',
      ctaText: 'Get started',
      ctaLink: '#contact',
      alignment: 'center',
    },
  };
}

/**
 * @param {MiddleSectionType} middleType
 * @param {string} displayName
 * @param {number} index
 */
function buildMiddleSection(middleType, displayName, index) {
  if (middleType === 'text-block') {
    return {
      id: sectionUuid(index),
      type: 'text-block',
      props: {
        headline: 'About us',
        body: `Replace this text block with ${displayName} positioning copy.`,
      },
    };
  }

  return {
    id: sectionUuid(index),
    type: 'features-grid',
    props: {
      headline: 'Why choose us',
      columns: 3,
      items: [
        { title: 'Feature one', description: 'Describe a key benefit' },
        { title: 'Feature two', description: 'Describe a key benefit' },
        { title: 'Feature three', description: 'Describe a key benefit' },
      ],
    },
  };
}

/**
 * @param {number} index
 */
function buildCtaSection(index) {
  return {
    id: sectionUuid(index),
    type: 'cta-banner',
    props: {
      headline: 'Ready to get started?',
      subheadline: 'Replace with your primary conversion message',
      ctaText: 'Contact us',
      ctaLink: '#contact',
    },
  };
}

/**
 * @param {string} displayName
 * @param {number} index
 */
function buildFooterSection(displayName, index) {
  return {
    id: sectionUuid(index),
    type: 'footer',
    props: {
      businessName: displayName,
      tagline: 'Replace with your business tagline',
      showSocialLinks: false,
    },
  };
}

/**
 * @param {{
 *   templateId: string;
 *   name?: string;
 *   category?: string;
 *   description?: string;
 *   sortOrder?: number;
 *   middleSection?: MiddleSectionType;
 * }} options
 */
export function buildScaffoldSeed(options) {
  const {
    templateId,
    name = titleCaseFromTemplateId(templateId),
    category = 'general-business',
    description = `Starter website design for ${name}`,
    sortOrder = 99,
    middleSection = 'features-grid',
  } = options;

  if (!TEMPLATE_ID_PATTERN.test(templateId)) {
    throw new Error(
      `templateId must be kebab-case (lowercase letters, digits, hyphens): "${templateId}"`,
    );
  }

  if (!MINIMUM_SECTION_TYPES.middle.includes(middleSection)) {
    throw new Error(
      `middleSection must be one of: ${MINIMUM_SECTION_TYPES.middle.join(', ')}`,
    );
  }

  return {
    templateId,
    metadata: {
      name,
      category,
      description,
      sortOrder,
      isCustomTemplate: false,
    },
    defaultPage: {
      title: 'Home',
      slug: 'home',
      seo: {
        title: `${name} — Professional Website`,
        description: `Replace with SEO description for ${name}.`,
      },
    },
    defaultSections: [
      buildHeroSection(name, 1),
      buildMiddleSection(middleSection, name, 2),
      buildCtaSection(3),
      buildFooterSection(name, 4),
    ],
  };
}

/**
 * Q68 minimum section bar — hero, features or text-block, cta-banner, footer.
 * @param {Array<{ type: string }>} sections
 */
export function assertMinimumSectionBar(sections) {
  if (sections.length < 4) {
    throw new Error(
      `Q68 minimum section bar requires at least 4 sections, got ${sections.length}`,
    );
  }

  const types = new Set(sections.map((section) => section.type));

  if (!types.has(MINIMUM_SECTION_TYPES.hero)) {
    throw new Error('Q68 minimum section bar requires a hero section');
  }

  if (!MINIMUM_SECTION_TYPES.middle.some((type) => types.has(type))) {
    throw new Error(
      `Q68 minimum section bar requires features-grid or text-block section`,
    );
  }

  if (!types.has(MINIMUM_SECTION_TYPES.cta)) {
    throw new Error('Q68 minimum section bar requires a cta-banner section');
  }

  if (!types.has(MINIMUM_SECTION_TYPES.footer)) {
    throw new Error('Q68 minimum section bar requires a footer section');
  }
}

/** Human PR steps per Q69 — script must not automate these. */
export const HUMAN_PR_CHECKLIST = [
  'Add templateId to packages/templates/seeds/manifest.json and bump seedVersion',
  'Add matching entry to apps/marketing/lib/templates.ts (name, category, description, sortOrder)',
  'Append templateId to RESERVED_TEMPLATE_SLUGS',
  'Run npm run validate:templates locally',
  'Run seed:templates:emulator and seed:template-demos:emulator',
  'Run generate:template-thumbnails and commit WebP previews',
];
