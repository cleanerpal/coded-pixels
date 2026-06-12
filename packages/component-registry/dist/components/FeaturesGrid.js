import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from '@codedpixels/ui';
const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};
export function FeaturesGrid({ props }) {
    var _a, _b;
    const grid = props;
    const columns = (_a = grid.columns) !== null && _a !== void 0 ? _a : 3;
    const gridClass = (_b = columnClasses[columns]) !== null && _b !== void 0 ? _b : columnClasses[3];
    return (_jsx("section", { className: "bg-background px-6 py-12", children: _jsxs("div", { className: "mx-auto max-w-5xl", children: [grid.headline ? (_jsx("h2", { className: "mb-8 text-center text-2xl font-semibold text-primary", children: grid.headline })) : null, _jsx("div", { className: `grid gap-6 ${gridClass}`, children: grid.items.map((item, index) => (_jsxs(Card, { children: [item.icon ? (_jsx("span", { className: "mb-2 block text-sm font-medium text-accent", children: item.icon })) : null, _jsx("h3", { className: "text-lg font-semibold text-primary", children: item.title }), _jsx("p", { className: "mt-2 text-sm text-muted", children: item.description })] }, `${item.title}-${index}`))) })] }) }));
}
