import { z } from 'zod';
import { linkSchema } from './common';
const footerLinkSchema = z.object({
    label: z.string().max(80),
    href: linkSchema,
});
const footerSocialSchema = z.object({
    platform: z.string().max(40),
    url: z.string().url(),
});
export const footerSchema = z.object({
    businessName: z.string().max(80),
    tagline: z.string().max(160).optional(),
    showSocialLinks: z.boolean().default(false),
    links: z.array(footerLinkSchema).optional(),
    social: z.array(footerSocialSchema).optional(),
    copyright: z.string().max(160).optional(),
});
export const footerDefaultProps = {
    businessName: 'Your business',
    tagline: 'Professional services',
    showSocialLinks: false,
};
