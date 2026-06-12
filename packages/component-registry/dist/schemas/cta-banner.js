import { z } from 'zod';
import { linkSchema } from './common';
export const ctaBannerSchema = z.object({
    headline: z.string().max(120),
    subheadline: z.string().max(240).optional(),
    ctaText: z.string().max(40).optional(),
    ctaLink: linkSchema.optional(),
});
export const ctaBannerDefaultProps = {
    headline: "Ready to get started?",
    subheadline: 'Book your first visit today',
    ctaText: 'Get in touch',
    ctaLink: '#contact',
};
