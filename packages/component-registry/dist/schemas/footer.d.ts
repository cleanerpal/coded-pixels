import { z } from 'zod';
export declare const footerSchema: z.ZodObject<{
    businessName: z.ZodString;
    tagline: z.ZodOptional<z.ZodString>;
    showSocialLinks: z.ZodDefault<z.ZodBoolean>;
    links: z.ZodOptional<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        href: z.ZodUnion<[z.ZodString, z.ZodString, z.ZodString, z.ZodString]>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        href: string;
    }, {
        label: string;
        href: string;
    }>, "many">>;
    social: z.ZodOptional<z.ZodArray<z.ZodObject<{
        platform: z.ZodString;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        platform: string;
    }, {
        url: string;
        platform: string;
    }>, "many">>;
    copyright: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    businessName: string;
    showSocialLinks: boolean;
    tagline?: string | undefined;
    links?: {
        label: string;
        href: string;
    }[] | undefined;
    social?: {
        url: string;
        platform: string;
    }[] | undefined;
    copyright?: string | undefined;
}, {
    businessName: string;
    tagline?: string | undefined;
    showSocialLinks?: boolean | undefined;
    links?: {
        label: string;
        href: string;
    }[] | undefined;
    social?: {
        url: string;
        platform: string;
    }[] | undefined;
    copyright?: string | undefined;
}>;
export type FooterProps = z.infer<typeof footerSchema>;
export declare const footerDefaultProps: FooterProps;
//# sourceMappingURL=footer.d.ts.map