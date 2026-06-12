import { z } from 'zod';

const featureItemSchema = z.object({
  icon: z.string().max(40).optional(),
  title: z.string().max(80),
  description: z.string().max(240),
});

export const featuresGridSchema = z.object({
  headline: z.string().max(120).optional(),
  columns: z.number().int().min(1).max(4).default(3),
  items: z.array(featureItemSchema).min(1).max(12),
});

export type FeaturesGridProps = z.infer<typeof featuresGridSchema>;

export const featuresGridDefaultProps: FeaturesGridProps = {
  headline: 'Why choose us',
  columns: 3,
  items: [
    { title: 'Fully insured', description: 'Peace of mind on every job' },
    { title: 'Eco-friendly products', description: 'Safe for families and pets' },
    { title: 'Flexible scheduling', description: 'Weekly, fortnightly, or one-off' },
  ],
};
