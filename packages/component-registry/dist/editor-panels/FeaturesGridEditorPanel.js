import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SelectField, TextAreaField, TextField } from './fields';
export function FeaturesGridEditorPanel({ props, onChange }) {
    var _a, _b;
    const grid = props;
    const itemsText = grid.items
        .map((item) => `${item.title}|${item.description}`)
        .join('\n');
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(TextField, { id: "features-headline", label: "Headline", value: (_a = grid.headline) !== null && _a !== void 0 ? _a : '', onChange: (event) => onChange(Object.assign(Object.assign({}, grid), { headline: event.target.value || undefined })) }), _jsx(SelectField, { id: "features-columns", label: "Columns", value: String((_b = grid.columns) !== null && _b !== void 0 ? _b : 3), options: [
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                    { value: '4', label: '4' },
                ], onChange: (event) => onChange(Object.assign(Object.assign({}, grid), { columns: Number(event.target.value) })) }), _jsx(TextAreaField, { id: "features-items", label: "Items (title|description per line)", value: itemsText, onChange: (event) => {
                    const items = event.target.value
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                        var _a;
                        const [title, ...rest] = line.split('|');
                        return {
                            title: (_a = title === null || title === void 0 ? void 0 : title.trim()) !== null && _a !== void 0 ? _a : 'Feature',
                            description: rest.join('|').trim() || 'Description',
                        };
                    });
                    onChange(Object.assign(Object.assign({}, grid), { items: items.length ? items : grid.items }));
                } })] }));
}
