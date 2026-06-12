import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { getComponentDefinition } from './registry';
function renderSection(section, options) {
    var _a;
    const definition = getComponentDefinition(section.type);
    if (!definition) {
        return null;
    }
    const parsed = definition.schema.safeParse(section.props);
    const props = parsed.success ? parsed.data : definition.defaultProps;
    const Component = definition.Component;
    const formContext = section.type === 'contact-form' && options.tenantFormContext
        ? Object.assign(Object.assign({}, options.tenantFormContext), { formSectionId: section.id, formType: 'contact' }) : undefined;
    return (_jsxs("div", { "data-section-type": section.type, "data-section-id": section.id, children: [_jsx(Component, { props: props, formContext: formContext, submitLead: options.submitLead, getRecaptchaToken: options.getRecaptchaToken }), ((_a = section.children) === null || _a === void 0 ? void 0 : _a.length) ? (_jsx("div", { "data-section-children": "", children: section.children.map((child) => renderSection(child, options)) })) : null] }, section.id));
}
export function SectionRenderer({ sections, tenantFormContext, submitLead, getRecaptchaToken, }) {
    const options = {
        tenantFormContext,
        submitLead,
        getRecaptchaToken,
    };
    return _jsx(_Fragment, { children: sections.map((section) => renderSection(section, options)) });
}
