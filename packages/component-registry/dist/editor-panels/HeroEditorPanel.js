import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SelectField, TextField } from './fields';
export function HeroEditorPanel({ props, onChange }) {
    var _a, _b, _c, _d, _e;
    const hero = props;
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(TextField, { id: "hero-headline", label: "Headline", value: hero.headline, onChange: (event) => onChange(Object.assign(Object.assign({}, hero), { headline: event.target.value })) }), _jsx(TextField, { id: "hero-subheadline", label: "Subheadline", value: (_a = hero.subheadline) !== null && _a !== void 0 ? _a : '', onChange: (event) => onChange(Object.assign(Object.assign({}, hero), { subheadline: event.target.value })) }), _jsx(TextField, { id: "hero-cta-text", label: "CTA text", value: (_b = hero.ctaText) !== null && _b !== void 0 ? _b : '', onChange: (event) => onChange(Object.assign(Object.assign({}, hero), { ctaText: event.target.value })) }), _jsx(TextField, { id: "hero-cta-link", label: "CTA link", value: (_c = hero.ctaLink) !== null && _c !== void 0 ? _c : '', onChange: (event) => onChange(Object.assign(Object.assign({}, hero), { ctaLink: event.target.value })) }), _jsx(TextField, { id: "hero-background", label: "Background image URL", value: (_d = hero.backgroundImage) !== null && _d !== void 0 ? _d : '', onChange: (event) => onChange(Object.assign(Object.assign({}, hero), { backgroundImage: event.target.value || undefined })) }), _jsx(SelectField, { id: "hero-alignment", label: "Alignment", value: (_e = hero.alignment) !== null && _e !== void 0 ? _e : 'center', options: [
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                ], onChange: (event) => onChange(Object.assign(Object.assign({}, hero), { alignment: event.target.value })) })] }));
}
