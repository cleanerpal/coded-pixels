'use client';

import { Button } from '@codedpixels/ui';
import { useState, type FormEvent } from 'react';
import {
  buildSubmitLeadFields,
  buildSubmitLeadPayload,
  HONEYPOT_FIELD_NAME,
  HoneypotFilledError,
  mapSubmitLeadError,
} from '../lib/contact-form-submit';
import type { ContactFormProps } from '../schemas/contact-form';
import type { SectionComponentProps } from '../types';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm({
  props,
  formContext,
  submitLead,
  getRecaptchaToken,
}: SectionComponentProps) {
  const form = props as ContactFormProps;
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const liveSubmitEnabled = Boolean(formContext && submitLead);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!liveSubmitEnabled || !formContext || !submitLead) {
      return;
    }

    setSubmitState('submitting');
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const entries = Object.fromEntries(formData.entries());

    try {
      const fields = buildSubmitLeadFields(
        entries,
        form.fields.map((field) => field.id),
      );

      if (Object.keys(fields).length === 0) {
        setSubmitState('error');
        setErrorMessage('Something went wrong — please try again.');
        return;
      }

      const recaptchaToken = getRecaptchaToken
        ? await getRecaptchaToken()
        : undefined;

      const payload = buildSubmitLeadPayload(
        formContext,
        fields,
        recaptchaToken,
      );

      await submitLead(payload);
      setSubmitState('success');
      event.currentTarget.reset();
    } catch (error) {
      if (error instanceof HoneypotFilledError) {
        setSubmitState('error');
        setErrorMessage('Couldn\u2019t send — please refresh and try again.');
        return;
      }

      setSubmitState('error');
      setErrorMessage(mapSubmitLeadError(error));
    }
  }

  const statusMessage =
    submitState === 'success'
      ? form.successMessage
      : submitState === 'error' && errorMessage
        ? errorMessage
        : null;

  return (
    <section className="bg-surface px-6 py-12">
      <form
        className="mx-auto max-w-xl space-y-4"
        onSubmit={handleSubmit}
        noValidate={liveSubmitEnabled}
        aria-busy={submitState === 'submitting'}
      >
        {form.headline ? (
          <h2 className="text-2xl font-semibold text-primary">{form.headline}</h2>
        ) : null}
        {form.fields.map((field) => (
          <label key={field.id} className="block space-y-1">
            <span className="text-sm font-medium text-primary">
              {field.label}
              {field.required ? ' *' : ''}
            </span>
            {field.type === 'textarea' ? (
              <textarea
                name={field.id}
                required={field.required}
                rows={4}
                disabled={submitState === 'submitting' || submitState === 'success'}
                className="w-full rounded-card border border-border bg-background px-3 py-2 text-sm"
              />
            ) : (
              <input
                type={field.type}
                name={field.id}
                required={field.required}
                disabled={submitState === 'submitting' || submitState === 'success'}
                className="w-full rounded-card border border-border bg-background px-3 py-2 text-sm"
              />
            )}
          </label>
        ))}
        {liveSubmitEnabled ? (
          <div
            className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
            aria-hidden="true"
          >
            <label htmlFor={`${HONEYPOT_FIELD_NAME}-contact`}>Leave blank</label>
            <input
              id={`${HONEYPOT_FIELD_NAME}-contact`}
              type="text"
              name={HONEYPOT_FIELD_NAME}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
        ) : null}
        <Button
          type="submit"
          disabled={submitState === 'submitting' || submitState === 'success'}
        >
          {submitState === 'submitting' ? 'Sending…' : form.submitLabel}
        </Button>
        {statusMessage ? (
          <p
            className="text-sm text-muted"
            role="status"
            aria-live="polite"
          >
            {statusMessage}
          </p>
        ) : liveSubmitEnabled ? null : (
          <p className="text-xs text-muted">{form.successMessage}</p>
        )}
      </form>
    </section>
  );
}
