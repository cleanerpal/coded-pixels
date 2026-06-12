import { z } from 'zod';
export declare const imageGallerySchema: z.ZodObject<{
    headline: z.ZodOptional<z.ZodString>;
    images: z.ZodArray<z.ZodObject<{
        src: z.ZodString;
        alt: z.ZodString;
        caption: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        src: string;
        alt: string;
        caption?: string | undefined;
    }, {
        src: string;
        alt: string;
        caption?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    images: {
        src: string;
        alt: string;
        caption?: string | undefined;
    }[];
    headline?: string | undefined;
}, {
    images: {
        src: string;
        alt: string;
        caption?: string | undefined;
    }[];
    headline?: string | undefined;
}>;
export type ImageGalleryProps = z.infer<typeof imageGallerySchema>;
export declare const imageGalleryDefaultProps: ImageGalleryProps;
//# sourceMappingURL=image-gallery.d.ts.map