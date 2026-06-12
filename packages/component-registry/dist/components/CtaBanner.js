import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, DarkSection } from '@codedpixels/ui';
export function CtaBanner({ props }) {
    const cta = props;
    return (_jsx(DarkSection, { className: "px-6 py-12", children: _jsxs("div", { className: "mx-auto flex max-w-3xl flex-col items-center gap-4 text-center", children: [_jsx("h2", { className: "text-2xl font-semibold", children: cta.headline }), cta.subheadline ? _jsx("p", { className: "text-base opacity-90", children: cta.subheadline }) : null, cta.ctaText && cta.ctaLink ? (_jsx("a", { href: cta.ctaLink, children: _jsx(Button, { variant: "secondary", children: cta.ctaText }) })) : null] }) }));
}
