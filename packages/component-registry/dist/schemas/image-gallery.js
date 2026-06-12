import { z } from 'zod';
const galleryImageSchema = z.object({
    src: z.string().url(),
    alt: z.string().max(120),
    caption: z.string().max(240).optional(),
});
export const imageGallerySchema = z.object({
    headline: z.string().max(120).optional(),
    images: z.array(galleryImageSchema).min(1).max(24),
});
export const imageGalleryDefaultProps = {
    headline: 'Gallery',
    images: [
        {
            src: 'https://placehold.co/800x600/e2e8f0/64748b?text=Gallery',
            alt: 'Gallery placeholder',
        },
    ],
};
