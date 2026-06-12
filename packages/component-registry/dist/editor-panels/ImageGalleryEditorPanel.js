import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextAreaField, TextField } from './fields';
export function ImageGalleryEditorPanel({ props, onChange }) {
    var _a;
    const gallery = props;
    const imagesText = gallery.images
        .map((image) => { var _a; return `${image.src}|${image.alt}|${(_a = image.caption) !== null && _a !== void 0 ? _a : ''}`; })
        .join('\n');
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(TextField, { id: "gallery-headline", label: "Headline", value: (_a = gallery.headline) !== null && _a !== void 0 ? _a : '', onChange: (event) => onChange(Object.assign(Object.assign({}, gallery), { headline: event.target.value || undefined })) }), _jsx(TextAreaField, { id: "gallery-images", label: "Images (src|alt|caption per line)", value: imagesText, onChange: (event) => {
                    const images = event.target.value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                        var _a, _b;
                        const [src, alt, caption] = line.split('|');
                        return {
                            src: (_a = src === null || src === void 0 ? void 0 : src.trim()) !== null && _a !== void 0 ? _a : '',
                            alt: (_b = alt === null || alt === void 0 ? void 0 : alt.trim()) !== null && _b !== void 0 ? _b : 'Image',
                            caption: (caption === null || caption === void 0 ? void 0 : caption.trim()) || undefined,
                        };
                    })
                        .filter((image) => image.src);
                    onChange(Object.assign(Object.assign({}, gallery), { images: images.length ? images : gallery.images }));
                } })] }));
}
