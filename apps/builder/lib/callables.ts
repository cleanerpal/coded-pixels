import { httpsCallable } from 'firebase/functions';

import { getFirebaseFunctions } from '@/lib/firebase';

export interface PublishSitePayload {
  siteId: string;
}

export interface PublishValidationErrorDetail {
  pageSlug: string;
  sectionId: string;
  sectionType: string;
  message: string;
}

export interface PublishSiteResult {
  success: true;
  publishedAt: string;
  paths: string[];
}

export class PublishSiteError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly validationErrors?: PublishValidationErrorDetail[],
  ) {
    super(message);
    this.name = 'PublishSiteError';
  }
}

/**
 * Publish site via B3-001 Callable — builder-ui-spec.md §7.1.
 * Aligned with Dr. Kai Nakamura on publishSite · Dr. Lena Petrova on revalidation.
 */
export async function publishSite(
  payload: PublishSitePayload,
): Promise<PublishSiteResult> {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<PublishSitePayload, PublishSiteResult>(
    functions,
    'publishSite',
  );

  try {
    const result = await callable(payload);
    return result.data;
  } catch (error) {
    const firebaseError = error as {
      code?: string;
      message?: string;
      details?: { errors?: PublishValidationErrorDetail[] };
    };

    throw new PublishSiteError(
      firebaseError.message ?? 'Publish failed',
      firebaseError.code,
      firebaseError.details?.errors,
    );
  }
}
