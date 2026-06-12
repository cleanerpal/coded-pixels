import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextField } from './fields';
export function CtaBannerEditorPanel({ props, onChange }) {
    var _a, _b, _c;
    const cta = props;
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(TextField, { id: "cta-headline", label: "Headline", value: cta.headline, onChange: (event) => onChange(Object.assign(Object.assign({}, cta), { headline: event.target.value })) }), _jsx(TextField, { id: "cta-subheadline", label: "Subheadline", value: (_a = cta.subheadline) !== null && _a !== void 0 ? _a : '', onChange: (event) => onChange(Object.assign(Object.assign({}, cta), { subheadline: event.target.value || undefined })) }), _jsx(TextField, { id: "cta-text", label: "Button text", value: (_b = cta.ctaText) !== null && _b !== void 0 ? _b : '', onChange: (event) => onChange(Object.assign(Object.assign({}, cta), { ctaText: event.target.value || undefined })) }), _jsx(TextField, { id: "cta-link", label: "Button link", value: (_c = cta.ctaLink) !== null && _c !== void 0 ? _c : '', onChange: (event) => onChange(Object.assign(Object.assign({}, cta), { ctaLink: event.target.value || undefined })) })] }));
}
