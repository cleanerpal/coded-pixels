import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function renderBody(body) {
    if (typeof body === 'string') {
        return body;
    }
    return JSON.stringify(body);
}
export function TextBlock({ props }) {
    const text = props;
    return (_jsx("section", { className: "bg-surface px-6 py-12", children: _jsxs("div", { className: "mx-auto max-w-3xl", children: [text.headline ? (_jsx("h2", { className: "mb-4 text-2xl font-semibold text-primary", children: text.headline })) : null, _jsx("p", { className: "whitespace-pre-wrap text-base leading-relaxed text-muted", children: renderBody(text.body) })] }) }));
}
