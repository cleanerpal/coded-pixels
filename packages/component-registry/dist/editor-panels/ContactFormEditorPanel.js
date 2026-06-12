import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextAreaField, TextField } from './fields';
export function ContactFormEditorPanel({ props, onChange }) {
    var _a;
    const form = props;
    const fieldsText = form.fields
        .map((field) => `${field.id}|${field.type}|${field.label}|${field.required ? '1' : '0'}`)
        .join('\n');
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(TextField, { id: "contact-headline", label: "Headline", value: (_a = form.headline) !== null && _a !== void 0 ? _a : '', onChange: (event) => onChange(Object.assign(Object.assign({}, form), { headline: event.target.value || undefined })) }), _jsx(TextAreaField, { id: "contact-fields", label: "Fields (id|type|label|required per line)", value: fieldsText, onChange: (event) => {
                    const fields = event.target.value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                        var _a, _b, _c;
                        const [id, type, label, required] = line.split('|');
                        return {
                            id: (_a = id === null || id === void 0 ? void 0 : id.trim()) !== null && _a !== void 0 ? _a : 'field',
                            type: ((_b = type === null || type === void 0 ? void 0 : type.trim()) !== null && _b !== void 0 ? _b : 'text'),
                            label: (_c = label === null || label === void 0 ? void 0 : label.trim()) !== null && _c !== void 0 ? _c : 'Field',
                            required: (required === null || required === void 0 ? void 0 : required.trim()) === '1',
                        };
                    });
                    onChange(Object.assign(Object.assign({}, form), { fields: fields.length ? fields : form.fields }));
                } }), _jsx(TextField, { id: "contact-submit", label: "Submit label", value: form.submitLabel, onChange: (event) => onChange(Object.assign(Object.assign({}, form), { submitLabel: event.target.value })) }), _jsx(TextAreaField, { id: "contact-success", label: "Success message", value: form.successMessage, onChange: (event) => onChange(Object.assign(Object.assign({}, form), { successMessage: event.target.value })) })] }));
}
