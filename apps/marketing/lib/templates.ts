import type { TemplateCategory } from '@codedpixels/shared-types';

export type { TemplateCategory };

export interface TemplateDefinition {
  id: string;
  name: string;
  category: TemplateCategory;
  categoryLabel: string;
  description: string;
  sortOrder: number;
}

/** 14 library templates (project plan §4, firestore-schema.md §5.2, Q70) */
export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'sparkle-clean',
    name: 'Sparkle Clean',
    category: 'cleaning-trades',
    categoryLabel: 'Cleaning & Trades',
    description: 'Professional cleaning services site with quote form',
    sortOrder: 1,
  },
  {
    id: 'trade-pro',
    name: 'TradePro',
    category: 'cleaning-trades',
    categoryLabel: 'Cleaning & Trades',
    description: 'Electrician/plumber portfolio + emergency CTA',
    sortOrder: 2,
  },
  {
    id: 'serenity-spa',
    name: 'Serenity Spa',
    category: 'beauty-wellness',
    categoryLabel: 'Beauty & Wellness',
    description: 'Calm aesthetic for salons and spas',
    sortOrder: 3,
  },
  {
    id: 'glow-studio',
    name: 'Glow Studio',
    category: 'beauty-wellness',
    categoryLabel: 'Beauty & Wellness',
    description: 'Bold beauty brand with booking CTA',
    sortOrder: 4,
  },
  {
    id: 'apex-legal',
    name: 'Apex Legal',
    category: 'professional-services',
    categoryLabel: 'Professional Services',
    description: 'Trust-focused layout for solicitors/consultants',
    sortOrder: 5,
  },
  {
    id: 'corner-shop',
    name: 'Corner Shop',
    category: 'retail',
    categoryLabel: 'Retail',
    description: 'Product showcase and store-ready layout',
    sortOrder: 6,
  },
  {
    id: 'the-local',
    name: 'The Local',
    category: 'hospitality',
    categoryLabel: 'Hospitality',
    description: 'Restaurant/pub with menu and reservations',
    sortOrder: 7,
  },
  {
    id: 'learn-hub',
    name: 'LearnHub',
    category: 'education',
    categoryLabel: 'Education',
    description: 'Courses, schedules, enrollment forms',
    sortOrder: 8,
  },
  {
    id: 'business-core',
    name: 'Business Core',
    category: 'general-business',
    categoryLabel: 'General Business',
    description: 'Flexible multi-section corporate site',
    sortOrder: 9,
  },
  {
    id: 'startup-launch',
    name: 'Startup Launch',
    category: 'general-business',
    categoryLabel: 'General Business',
    description: 'Modern single-page startup landing',
    sortOrder: 10,
  },
  {
    id: 'wellness-clinic',
    name: 'Wellness Clinic',
    category: 'healthcare-wellbeing',
    categoryLabel: 'Healthcare & Wellbeing',
    description: 'GP and wellness clinic layout with appointment CTA',
    sortOrder: 11,
  },
  {
    id: 'clear-accounting',
    name: 'Clear Accounting',
    category: 'professional-services',
    categoryLabel: 'Professional Services',
    description: 'Accountancy firm with services grid and enquiry CTA',
    sortOrder: 12,
  },
  {
    id: 'focus-photography',
    name: 'Focus Photography',
    category: 'creative-services',
    categoryLabel: 'Creative Services',
    description: 'Portfolio-led site for photographers and studios',
    sortOrder: 13,
  },
  {
    id: 'fit-hub',
    name: 'Fit Hub',
    category: 'fitness-wellness',
    categoryLabel: 'Fitness & Wellness',
    description: 'Gym and fitness studio with class booking CTA',
    sortOrder: 14,
  },
];

export const TEMPLATES_BY_ID: Record<string, TemplateDefinition> =
  TEMPLATES.reduce(
    (acc, template) => {
      acc[template.id] = template;
      return acc;
    },
    {} as Record<string, TemplateDefinition>,
  );

/** Custom template card — selecting enables custom-template add-on (Q2) */
export interface CustomTemplateCard {
  id: 'custom';
  name: string;
  badge: string;
  description: string;
  oneTimeToggleCopy: string;
}

export const CUSTOM_TEMPLATE_CARD: CustomTemplateCard = {
  id: 'custom',
  name: 'Custom Template',
  badge: 'Bespoke design',
  description: 'A bespoke design tailored to your brand and goals',
  oneTimeToggleCopy: 'Prefer a one-time fee? Switch to £149.',
};

export const ALL_TEMPLATE_IDS = [
  ...TEMPLATES.map((t) => t.id),
  CUSTOM_TEMPLATE_CARD.id,
] as const;
