declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SCRIPT_ID = 'codedpixels-recaptcha-v3';

function getRecaptchaSiteKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ??
    process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY
  );
}

function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.grecaptcha) {
    return new Promise((resolve) => {
      window.grecaptcha!.ready(() => resolve());
    });
  }

  const existing = document.getElementById(RECAPTCHA_SCRIPT_ID);
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener('load', () => resolve(), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha?.ready(() => resolve());
    };
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });
}

/** Execute reCAPTCHA v3 for submitLead — site-renderer-architecture.md §9.1 */
export async function executeRecaptcha(
  action = 'submit_lead',
): Promise<string | undefined> {
  const siteKey = getRecaptchaSiteKey();
  if (!siteKey || typeof window === 'undefined') {
    return undefined;
  }

  await loadRecaptchaScript(siteKey);
  return window.grecaptcha!.execute(siteKey, { action });
}
