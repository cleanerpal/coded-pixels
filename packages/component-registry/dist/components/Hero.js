import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@codedpixels/ui';
const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
};
export function Hero({ props }) {
    var _a;
    const hero = props;
    const alignment = (_a = hero.alignment) !== null && _a !== void 0 ? _a : 'center';
    return (_jsxs("section", { className: `flex min-h-[320px] flex-col justify-center gap-4 bg-background px-6 py-16 ${alignmentClasses[alignment]}`, style: hero.backgroundImage
            ? {
                backgroundImage: `url(${hero.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }
            : undefined, children: [_jsx("h1", { className: "max-w-3xl text-4xl font-bold text-primary", children: hero.headline }), hero.subheadline ? (_jsx("p", { className: "max-w-2xl text-lg text-muted", children: hero.subheadline })) : null, hero.ctaText && hero.ctaLink ? (_jsx("a", { href: hero.ctaLink, children: _jsx(Button, { children: hero.ctaText }) })) : null] }));
}
