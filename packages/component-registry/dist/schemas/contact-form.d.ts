import { z } from 'zod';
export declare const contactFormSchema: z.ZodObject<{
    headline: z.ZodOptional<z.ZodString>;
    fields: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["text", "email", "tel", "textarea"]>;
        label: z.ZodString;
        required: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "text" | "email" | "tel" | "textarea";
        label: string;
        required: boolean;
    }, {
        id: string;
        type: "text" | "email" | "tel" | "textarea";
        label: string;
        required?: boolean | undefined;
    }>, "many">;
    submitLabel: z.ZodDefault<z.ZodString>;
    successMessage: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields: {
        id: string;
        type: "text" | "email" | "tel" | "textarea";
        label: string;
        required: boolean;
    }[];
    submitLabel: string;
    successMessage: string;
    headline?: string | undefined;
}, {
    fields: {
        id: string;
        type: "text" | "email" | "tel" | "textarea";
        label: string;
        required?: boolean | undefined;
    }[];
    headline?: string | undefined;
    submitLabel?: string | undefined;
    successMessage?: string | undefined;
}>;
export type ContactFormProps = z.infer<typeof contactFormSchema>;
export declare const contactFormDefaultProps: ContactFormProps;
//# sourceMappingURL=contact-form.d.ts.map