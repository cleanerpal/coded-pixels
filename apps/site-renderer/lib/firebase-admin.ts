import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.GCLOUD_PROJECT ??
  process.env.GOOGLE_CLOUD_PROJECT ??
  'codedpixels';

function initAdminApp(): void {
  if (getApps().length > 0) {
    return;
  }

  initializeApp({ projectId });
}

initAdminApp();

export const adminDb = getFirestore();
adminDb.settings({ ignoreUndefinedProperties: true });
