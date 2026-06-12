import { z } from 'zod';
const formFieldSchema = z.object({
    id: z.string().min(1),
    type: z.enum(['text', 'email', 'tel', 'textarea']),
    label: z.string().max(80),
    required: z.boolean().default(false),
});
export const contactFormSchema = z.object({
    headline: z.string().max(120).optional(),
    fields: z.array(formFieldSchema).min(1).max(12),
    submitLabel: z.string().max(40).default('Submit'),
    successMessage: z
        .string()
        .max(240)
        .default('Thank you — we will be in touch soon.'),
});
export const contactFormDefaultProps = {
    headline: 'Get in touch',
    fields: [
        { id: 'name', type: 'text', label: 'Name', required: true },
        { id: 'email', type: 'email', label: 'Email', required: true },
        { id: 'message', type: 'textarea', label: 'Message', required: false },
    ],
    submitLabel: 'Send message',
    successMessage: 'Thank you — we will be in touch soon.',
};
