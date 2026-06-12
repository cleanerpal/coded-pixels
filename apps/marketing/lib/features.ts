import type { FeatureId } from '@codedpixels/shared-types';

/** Base plan monthly price in pence — £9.99/mo */
export const BASE_PLAN_MONTHLY_PENCE = 999;

/** One-time custom template fee in pence — £149 (checkout only, Q13) */
export const ONE_TIME_CUSTOM_TEMPLATE_PENCE = 14900;

export type FeatureGroup =
  | 'growth'
  | 'optional'
  | 'ecommerce'
  | 'automation'
  | 'advanced';

export interface FeatureDefinition {
  id: FeatureId;
  name: string;
  description: string;
  monthlyPence: number;
  group: FeatureGroup;
}

/** 11 add-on features with monthly recurring prices (project plan §3) */
export const FEATURES: FeatureDefinition[] = [
  {
    id: 'crm',
    name: 'CRM & Lead Management',
    description: 'Capture and manage leads from your site',
    monthlyPence: 499,
    group: 'growth',
  },
  {
    id: 'email-automation',
    name: 'Email Automation Sequences',
    description: 'Automated email follow-ups and nurture flows',
    monthlyPence: 599,
    group: 'growth',
  },
  {
    id: 'analytics-seo',
    name: 'Advanced Analytics & SEO Tools',
    description: 'Traffic insights and search optimisation',
    monthlyPence: 399,
    group: 'growth',
  },
  {
    id: 'sms',
    name: 'SMS Notifications',
    description: 'Text alerts for bookings and leads',
    monthlyPence: 299,
    group: 'optional',
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce Store',
    description: 'Products, cart, and checkout',
    monthlyPence: 999,
    group: 'ecommerce',
  },
  {
    id: 'vat-mtd',
    name: 'VAT & Tax Automation',
    description: 'HMRC MTD compliance and Xero sync',
    monthlyPence: 499,
    group: 'ecommerce',
  },
  {
    id: 'booking',
    name: 'Advanced Booking & Appointments',
    description: 'Online scheduling and appointment management',
    monthlyPence: 699,
    group: 'automation',
  },
  {
    id: 'ai-content',
    name: 'AI Site Generation & Content Assistant',
    description: 'AI-powered content suggestions and generation',
    monthlyPence: 399,
    group: 'advanced',
  },
  {
    id: 'custom-template',
    name: 'Custom Template Design',
    description: 'Bespoke design tailored to your brand',
    monthlyPence: 1499,
    group: 'advanced',
  },
  {
    id: 'white-label',
    name: 'White-label / Remove Branding',
    description: 'Remove CodedPixels branding from your site',
    monthlyPence: 999,
    group: 'advanced',
  },
  {
    id: 'priority-support',
    name: 'Priority Support',
    description: 'Faster response times and dedicated help',
    monthlyPence: 499,
    group: 'advanced',
  },
];

export const FEATURES_BY_ID: Record<FeatureId, FeatureDefinition> =
  FEATURES.reduce(
    (acc, feature) => {
      acc[feature.id] = feature;
      return acc;
    },
    {} as Record<FeatureId, FeatureDefinition>,
  );
