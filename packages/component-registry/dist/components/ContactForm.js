'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@codedpixels/ui';
import { useState } from 'react';
import { buildSubmitLeadFields, buildSubmitLeadPayload, HONEYPOT_FIELD_NAME, HoneypotFilledError, mapSubmitLeadError, } from '../lib/contact-form-submit';
export function ContactForm({ props, formContext, submitLead, getRecaptchaToken, }) {
    const form = props;
    const [submitState, setSubmitState] = useState('idle');
    const [errorMessage, setErrorMessage] = useState(null);
    const liveSubmitEnabled = Boolean(formContext && submitLead);
    async function handleSubmit(event) {
        event.preventDefault();
        if (!liveSubmitEnabled || !formContext || !submitLead) {
            return;
        }
        setSubmitState('submitting');
        setErrorMessage(null);
        const formData = new FormData(event.currentTarget);
        const entries = Object.fromEntries(formData.entries());
        try {
            const fields = buildSubmitLeadFields(entries, form.fields.map((field) => field.id));
            if (Object.keys(fields).length === 0) {
                setSubmitState('error');
                setErrorMessage('Something went wrong — please try again.');
                return;
            }
            const recaptchaToken = getRecaptchaToken
                ? await getRecaptchaToken()
                : undefined;
            const payload = buildSubmitLeadPayload(formContext, fields, recaptchaToken);
            await submitLead(payload);
            setSubmitState('success');
            event.currentTarget.reset();
        }
        catch (error) {
            if (error instanceof HoneypotFilledError) {
                setSubmitState('error');
                setErrorMessage('Couldn\u2019t send — please refresh and try again.');
                return;
            }
            setSubmitState('error');
            setErrorMessage(mapSubmitLeadError(error));
        }
    }
    const statusMessage = submitState === 'success'
        ? form.successMessage
        : submitState === 'error' && errorMessage
            ? errorMessage
            : null;
    return (_jsx("section", { className: "bg-surface px-6 py-12", children: _jsxs("form", { className: "mx-auto max-w-xl space-y-4", onSubmit: handleSubmit, noValidate: liveSubmitEnabled, "aria-busy": submitState === 'submitting', children: [form.headline ? (_jsx("h2", { className: "text-2xl font-semibold text-primary", children: form.headline })) : null, form.fields.map((field) => (_jsxs("label", { className: "block space-y-1", children: [_jsxs("span", { className: "text-sm font-medium text-primary", children: [field.label, field.required ? ' *' : ''] }), field.type === 'textarea' ? (_jsx("textarea", { name: field.id, required: field.required, rows: 4, disabled: submitState === 'submitting' || submitState === 'success', className: "w-full rounded-card border border-border bg-background px-3 py-2 text-sm" })) : (_jsx("input", { type: field.type, name: field.id, required: field.required, disabled: submitState === 'submitting' || submitState === 'success', className: "w-full rounded-card border border-border bg-background px-3 py-2 text-sm" }))] }, field.id))), liveSubmitEnabled ? (_jsxs("div", { className: "absolute -left-[9999px] h-0 w-0 overflow-hidden", "aria-hidden": "true", children: [_jsx("label", { htmlFor: `${HONEYPOT_FIELD_NAME}-contact`, children: "Leave blank" }), _jsx("input", { id: `${HONEYPOT_FIELD_NAME}-contact`, type: "text", name: HONEYPOT_FIELD_NAME, tabIndex: -1, autoComplete: "off" })] })) : null, _jsx(Button, { type: "submit", disabled: submitState === 'submitting' || submitState === 'success', children: submitState === 'submitting' ? 'Sending…' : form.submitLabel }), statusMessage ? (_jsx("p", { className: "text-sm text-muted", role: "status", "aria-live": "polite", children: statusMessage })) : liveSubmitEnabled ? null : (_jsx("p", { className: "text-xs text-muted", children: form.successMessage }))] }) }));
}
