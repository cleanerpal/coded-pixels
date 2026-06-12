import { validateSectionProps } from './validateSectionProps';
import type { FeatureId, Section } from '@codedpixels/shared-types';
import { MAX_SECTIONS_PER_PAGE } from './constants';
import { getRequiredFeatureId, isFeatureEnabled } from './gatedSections';

export interface PublishValidationError {
  pageSlug: string;
  sectionId: string;
  sectionType: string;
  message: string;
}

export interface ValidateSiteForPublishOptions {
  pages: Array<{
    pageId: string;
    slug: string;
    sections: Section[];
  }>;
  featureIds: FeatureId[];
}

function collectSections(sections: Section[]): Section[] {
  const collected: Section[] = [];

  for (const section of sections) {
    collected.push(section);
    if (section.children?.length) {
      collected.push(...section.children);
    }
  }

  return collected;
}

/**
 * Validates all sections on all pages before publish.
 * Aligned with Dr. Victor Lang on featureIds gating · builder-ui-spec §7.1.
 */
export function validateSiteForPublish(
  options: ValidateSiteForPublishOptions,
): PublishValidationError[] {
  const errors: PublishValidationError[] = [];

  for (const page of options.pages) {
    if (page.sections.length > MAX_SECTIONS_PER_PAGE) {
      errors.push({
        pageSlug: page.slug,
        sectionId: '',
        sectionType: '',
        message: `Page exceeds ${MAX_SECTIONS_PER_PAGE} sections`,
      });
      continue;
    }

    for (const section of collectSections(page.sections)) {
      const requiredFeatureId = getRequiredFeatureId(section.type);
      if (
        requiredFeatureId &&
        !isFeatureEnabled(options.featureIds, requiredFeatureId)
      ) {
        errors.push({
          pageSlug: page.slug,
          sectionId: section.id,
          sectionType: section.type,
          message: `Section type "${section.type}" requires the "${requiredFeatureId}" add-on`,
        });
        continue;
      }

      const result = validateSectionProps(section.type, section.props);
      if (!result.success) {
        errors.push({
          pageSlug: page.slug,
          sectionId: section.id,
          sectionType: section.type,
          message: result.error,
        });
      }
    }
  }

  return errors;
}

export function pageSlugToPath(slug: string): string {
  if (slug === 'home' || slug === '/') {
    return '/';
  }

  return slug.startsWith('/') ? slug : `/${slug}`;
}
