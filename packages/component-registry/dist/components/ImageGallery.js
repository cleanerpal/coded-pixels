import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ImageGallery({ props }) {
    const gallery = props;
    return (_jsx("section", { className: "bg-background px-6 py-12", children: _jsxs("div", { className: "mx-auto max-w-5xl", children: [gallery.headline ? (_jsx("h2", { className: "mb-8 text-center text-2xl font-semibold text-primary", children: gallery.headline })) : null, _jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: gallery.images.map((image, index) => (_jsxs("figure", { className: "overflow-hidden rounded-card", children: [_jsx("img", { src: image.src, alt: image.alt, className: "h-48 w-full object-cover" }), image.caption ? (_jsx("figcaption", { className: "bg-surface px-3 py-2 text-sm text-muted", children: image.caption })) : null] }, `${image.src}-${index}`))) })] }) }));
}
