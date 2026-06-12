import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextAreaField, TextField } from './fields';
export function TestimonialsEditorPanel({ props, onChange }) {
    var _a;
    const testimonials = props;
    const itemsText = testimonials.items
        .map((item) => { var _a; return `${item.quote}|${item.author}|${(_a = item.role) !== null && _a !== void 0 ? _a : ''}`; })
        .join('\n');
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(TextField, { id: "testimonials-headline", label: "Headline", value: (_a = testimonials.headline) !== null && _a !== void 0 ? _a : '', onChange: (event) => onChange(Object.assign(Object.assign({}, testimonials), { headline: event.target.value || undefined })) }), _jsx(TextAreaField, { id: "testimonials-items", label: "Testimonials (quote|author|role per line)", value: itemsText, onChange: (event) => {
                    const items = event.target.value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                        var _a, _b;
                        const [quote, author, role] = line.split('|');
                        return {
                            quote: (_a = quote === null || quote === void 0 ? void 0 : quote.trim()) !== null && _a !== void 0 ? _a : '',
                            author: (_b = author === null || author === void 0 ? void 0 : author.trim()) !== null && _b !== void 0 ? _b : 'Anonymous',
                            role: (role === null || role === void 0 ? void 0 : role.trim()) || undefined,
                        };
                    })
                        .filter((item) => item.quote);
                    onChange(Object.assign(Object.assign({}, testimonials), { items: items.length ? items : testimonials.items }));
                } })] }));
}
