import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
type FieldProps = {
    label: string;
    id: string;
};
export declare function TextField({ label, id, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>): import("react").JSX.Element;
export declare function TextAreaField({ label, id, ...props }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>): import("react").JSX.Element;
export declare function SelectField({ label, id, options, ...props }: FieldProps & SelectHTMLAttributes<HTMLSelectElement> & {
    options: Array<{
        value: string;
        label: string;
    }>;
}): import("react").JSX.Element;
export declare function CheckboxField({ label, id, ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>): import("react").JSX.Element;
export {};
//# sourceMappingURL=fields.d.ts.map