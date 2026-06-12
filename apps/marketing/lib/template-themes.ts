import {
  CUSTOM_TEMPLATE_CARD,
  TEMPLATES_BY_ID,
  type TemplateCategory,
  type TemplateDefinition,
} from '@/lib/templates';
import type { FeatureId } from '@codedpixels/shared-types';

/** Scoped preview CSS variables — brand tokens only (brand-guide.md §4). */
export interface PreviewThemeStyle {
  '--preview-hero-from': string;
  '--preview-hero-to': string;
  '--preview-accent': string;
}

/** Scoped preview theme — brand tokens only (brand-guide.md §4). */
export interface TemplatePreviewTheme {
  style: PreviewThemeStyle;
  categoryLabel: string;
}

const CATEGORY_THEME: Record<TemplateCategory, PreviewThemeStyle> = {
  'cleaning-trades': {
    '--preview-hero-from': 'color-mix(in srgb, var(--color-primary) 35%, white)',
    '--preview-hero-to': 'color-mix(in srgb, var(--color-accent) 18%, white)',
    '--preview-accent': 'var(--color-primary)',
  },
  'beauty-wellness': {
    '--preview-hero-from': 'color-mix(in srgb, var(--color-accent) 32%, white)',
    '--preview-hero-to': 'color-mix(in srgb, var(--color-primary) 12%, white)',
    '--preview-accent': 'var(--color-accent)',
  },
  'professional-services': {
    '--preview-hero-from': 'color-mix(in srgb, var(--color-primary) 22%, white)',
    '--preview-hero-to': 'color-mix(in srgb, var(--color-primary) 6%, white)',
    '--preview-accent': 'var(--color-primary)',
  },
  retail: {
    '--preview-hero-from': 'color-mix(in srgb, var(--color-accent) 28%, white)',
    '--preview-hero-to': 'color-mix(in srgb, var(--color-primary) 14%, white)',
    '--preview-accent': 'var(--color-accent)',
  },
  hospitality: {
    '--preview-hero-from': 'color-mix(in srgb, var(--color-primary) 20%, white)',
    '--preview-hero-to': 'color-mix(in srgb, var(--color-accent) 22%, white)',
    '--preview-accent': 'var(--color-accent)',
  },
  education: {
    '--preview-hero-from': 'color-mix(in srgb, var(--color-accent) 24%, white)',
    '--preview-hero-to': 'color-mix(in srgb, var(--color-primary) 10%, white)',
    '--preview-accent': 'var(--color-accent)',
  },
  'general-business': {
    '--preview-hero-from': 'color-mix(in srgb, var(--color-primary) 16%, white)',
    '--preview-hero-to': 'color-mix(in srgb, var(--color-accent) 16%, white)',
    '--preview-accent': 'var(--color-primary)',
  },
  'healthcare-wellbeing': {
    '--preview-hero-from': 'color-mix(in srgb, var(--color-primary) 18%, white)',
    '--preview-hero-to': 'color-mix(in srgb, var(--color-accent) 20%, white)',
    '--preview-accent': 'var(--color-primary)',
  },
  'creative-services': {
    '--preview-hero-from': 'color-mix(in srgb, var(--color-accent) 30%, white)',
    '--preview-hero-to': 'color-mix(in srgb, var(--color-primary) 8%, white)',
    '--preview-accent': 'var(--color-accent)',
  },
  'fitness-wellness': {
    '--preview-hero-from': 'color-mix(in srgb, var(--color-accent) 26%, white)',
    '--preview-hero-to': 'color-mix(in srgb, var(--color-primary) 14%, white)',
    '--preview-accent': 'var(--color-accent)',
  },
};

const CUSTOM_THEME: PreviewThemeStyle = {
  '--preview-hero-from': 'color-mix(in srgb, var(--color-primary) 38%, white)',
  '--preview-hero-to': 'color-mix(in srgb, var(--color-accent) 28%, white)',
  '--preview-accent': 'var(--color-primary)',
};

const DEFAULT_THEME: PreviewThemeStyle = {
  '--preview-hero-from': 'color-mix(in srgb, var(--color-border) 80%, white)',
  '--preview-hero-to': 'color-mix(in srgb, var(--color-border) 40%, white)',
  '--preview-accent': 'var(--color-text-muted)',
};

/** Short badge labels for live preview (project plan §6). */
export const PREVIEW_FEATURE_BADGE_LABELS: Record<FeatureId, string> = {
  crm: 'CRM',
  'email-automation': 'Email automation',
  booking: 'Booking',
  ecommerce: 'Shop enabled',
  'vat-mtd': 'VAT & tax',
  'ai-content': 'AI content',
  'custom-template': 'Custom design',
  'analytics-seo': 'SEO tools',
  sms: 'SMS',
  'white-label': 'White-label',
  'priority-support': 'Priority support',
};

export function getPreviewFeatureBadges(featureIds: FeatureId[]): string[] {
  return featureIds.map((id) => PREVIEW_FEATURE_BADGE_LABELS[id]).filter(Boolean);
}

export function resolvePreviewTemplate(
  templateId: string | null,
): { name: string; theme: TemplatePreviewTheme } {
  if (templateId === null) {
    return {
      name: 'No template selected',
      theme: {
        style: DEFAULT_THEME,
        categoryLabel: 'Select a template',
      },
    };
  }

  if (templateId === CUSTOM_TEMPLATE_CARD.id) {
    return {
      name: CUSTOM_TEMPLATE_CARD.name,
      theme: {
        style: CUSTOM_THEME,
        categoryLabel: 'Bespoke',
      },
    };
  }

  const template: TemplateDefinition | undefined = TEMPLATES_BY_ID[templateId];
  if (!template) {
    return {
      name: templateId,
      theme: {
        style: DEFAULT_THEME,
        categoryLabel: 'Template',
      },
    };
  }

  return {
    name: template.name,
    theme: {
      style: CATEGORY_THEME[template.category],
      categoryLabel: template.categoryLabel,
    },
  };
}
