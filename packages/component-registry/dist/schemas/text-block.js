import { z } from 'zod';
/** Plain string for seeds; Tiptap JSON object supported per builder-ui-spec §13 */
export const textBlockSchema = z.object({
    headline: z.string().max(120).optional(),
    body: z.union([z.string().max(5000), z.record(z.unknown())]),
});
export const textBlockDefaultProps = {
    headline: 'What we do',
    body: 'Strategy, delivery, and ongoing support — tailored to your sector and scale.',
};
