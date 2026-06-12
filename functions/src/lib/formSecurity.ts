/**
 * Form abuse helpers (B9-001) — honeypot + reCAPTCHA verification.
 */
export {
  HONEYPOT_FIELD_NAME,
  assertHoneypotClean,
  stripHoneypotField,
} from './honeypot';

export {
  isRecaptchaScoreAcceptable,
  shouldBypassRecaptcha,
  verifyRecaptchaToken,
  type RecaptchaVerificationResult,
} from './recaptcha';
