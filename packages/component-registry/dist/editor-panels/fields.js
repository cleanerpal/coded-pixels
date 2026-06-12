var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function TextField(_a) {
    var { label, id } = _a, props = __rest(_a, ["label", "id"]);
    return (_jsxs("label", { htmlFor: id, className: "block space-y-1", children: [_jsx("span", { className: "text-sm font-medium text-primary", children: label }), _jsx("input", Object.assign({ id: id, className: "w-full rounded-card border border-border bg-background px-3 py-2 text-sm" }, props))] }));
}
export function TextAreaField(_a) {
    var { label, id } = _a, props = __rest(_a, ["label", "id"]);
    return (_jsxs("label", { htmlFor: id, className: "block space-y-1", children: [_jsx("span", { className: "text-sm font-medium text-primary", children: label }), _jsx("textarea", Object.assign({ id: id, className: "w-full rounded-card border border-border bg-background px-3 py-2 text-sm", rows: 4 }, props))] }));
}
export function SelectField(_a) {
    var { label, id, options } = _a, props = __rest(_a, ["label", "id", "options"]);
    return (_jsxs("label", { htmlFor: id, className: "block space-y-1", children: [_jsx("span", { className: "text-sm font-medium text-primary", children: label }), _jsx("select", Object.assign({ id: id, className: "w-full rounded-card border border-border bg-background px-3 py-2 text-sm" }, props, { children: options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }))] }));
}
export function CheckboxField(_a) {
    var { label, id } = _a, props = __rest(_a, ["label", "id"]);
    return (_jsxs("label", { htmlFor: id, className: "flex items-center gap-2", children: [_jsx("input", Object.assign({ id: id, type: "checkbox" }, props)), _jsx("span", { className: "text-sm font-medium text-primary", children: label })] }));
}
