import { z } from 'zod';
const testimonialItemSchema = z.object({
    quote: z.string().max(500),
    author: z.string().max(80),
    role: z.string().max(80).optional(),
});
export const testimonialsSchema = z.object({
    headline: z.string().max(120).optional(),
    items: z.array(testimonialItemSchema).min(1).max(12),
});
export const testimonialsDefaultProps = {
    headline: 'What our clients say',
    items: [
        {
            quote: 'Professional, reliable, and great results every time.',
            author: 'Alex Morgan',
            role: 'Homeowner',
        },
    ],
};
