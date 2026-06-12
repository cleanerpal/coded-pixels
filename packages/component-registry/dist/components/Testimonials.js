import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from '@codedpixels/ui';
export function Testimonials({ props }) {
    const testimonials = props;
    return (_jsx("section", { className: "bg-surface px-6 py-12", children: _jsxs("div", { className: "mx-auto max-w-5xl", children: [testimonials.headline ? (_jsx("h2", { className: "mb-8 text-center text-2xl font-semibold text-primary", children: testimonials.headline })) : null, _jsx("div", { className: "grid gap-6 md:grid-cols-2", children: testimonials.items.map((item, index) => (_jsxs(Card, { children: [_jsxs("blockquote", { className: "text-base italic text-primary", children: ["\u201C", item.quote, "\u201D"] }), _jsxs("footer", { className: "mt-4 text-sm text-muted", children: [_jsx("span", { className: "font-semibold", children: item.author }), item.role ? _jsxs("span", { children: [" \u2014 ", item.role] }) : null] })] }, `${item.author}-${index}`))) })] }) }));
}
