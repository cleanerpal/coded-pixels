import { z } from 'zod';
import { linkSchema } from './common';
export const heroSchema = z.object({
    headline: z.string().max(120),
    subheadline: z.string().max(240).optional(),
    ctaText: z.string().max(40).optional(),
    ctaLink: linkSchema.optional(),
    backgroundImage: z.string().url().optional(),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
});
export const heroDefaultProps = {
    headline: 'Built for growing businesses',
    subheadline: 'Showcase services, team, and results with a polished corporate site',
    ctaText: 'Contact us',
    ctaLink: '#contact',
    alignment: 'center',
};
