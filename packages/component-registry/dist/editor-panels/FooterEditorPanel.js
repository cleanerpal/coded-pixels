import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckboxField, TextField } from './fields';
export function FooterEditorPanel({ props, onChange }) {
    var _a, _b;
    const footer = props;
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(TextField, { id: "footer-business-name", label: "Business name", value: footer.businessName, onChange: (event) => onChange(Object.assign(Object.assign({}, footer), { businessName: event.target.value })) }), _jsx(TextField, { id: "footer-tagline", label: "Tagline", value: (_a = footer.tagline) !== null && _a !== void 0 ? _a : '', onChange: (event) => onChange(Object.assign(Object.assign({}, footer), { tagline: event.target.value || undefined })) }), _jsx(CheckboxField, { id: "footer-social", label: "Show social links", checked: footer.showSocialLinks, onChange: (event) => onChange(Object.assign(Object.assign({}, footer), { showSocialLinks: event.target.checked })) }), _jsx(TextField, { id: "footer-copyright", label: "Copyright override", value: (_b = footer.copyright) !== null && _b !== void 0 ? _b : '', onChange: (event) => onChange(Object.assign(Object.assign({}, footer), { copyright: event.target.value || undefined })) })] }));
}
