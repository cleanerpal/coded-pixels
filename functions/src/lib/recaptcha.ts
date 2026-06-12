export interface RecaptchaVerificationResult {
  success: boolean;
  score: number;
}

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MIN_RECAPTCHA_SCORE = 0.5;

export function shouldBypassRecaptcha(): boolean {
  return process.env.DISABLE_RECAPTCHA === 'true';
}

export async function verifyRecaptchaToken(
  token: string,
): Promise<RecaptchaVerificationResult> {
  if (shouldBypassRecaptcha()) {
    return { success: true, score: 1 };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return { success: true, score: 1 };
  }

  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  if (!response.ok) {
    return { success: false, score: 0 };
  }

  const payload = (await response.json()) as {
    success?: boolean;
    score?: number;
  };

  return {
    success: payload.success === true,
    score: typeof payload.score === 'number' ? payload.score : 0,
  };
}

export function isRecaptchaScoreAcceptable(score: number): boolean {
  return score >= MIN_RECAPTCHA_SCORE;
}

export { MIN_RECAPTCHA_SCORE };
