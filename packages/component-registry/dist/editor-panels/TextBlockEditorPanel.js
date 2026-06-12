import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextAreaField, TextField } from './fields';
export function TextBlockEditorPanel({ props, onChange }) {
    var _a;
    const text = props;
    const body = typeof text.body === 'string' ? text.body : JSON.stringify(text.body, null, 2);
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(TextField, { id: "text-block-headline", label: "Headline", value: (_a = text.headline) !== null && _a !== void 0 ? _a : '', onChange: (event) => onChange(Object.assign(Object.assign({}, text), { headline: event.target.value || undefined })) }), _jsx(TextAreaField, { id: "text-block-body", label: "Body", value: body, onChange: (event) => onChange(Object.assign(Object.assign({}, text), { body: event.target.value })) })] }));
}
