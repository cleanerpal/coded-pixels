import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const projectId =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.GCLOUD_PROJECT ??
  process.env.GOOGLE_CLOUD_PROJECT ??
  'codedpixels';

const globalForAdmin = globalThis as typeof globalThis & {
  codedpixelsAdminDb?: Firestore;
};

function initAdminDb(): Firestore {
  if (globalForAdmin.codedpixelsAdminDb) {
    return globalForAdmin.codedpixelsAdminDb;
  }

  if (getApps().length === 0) {
    initializeApp({ projectId });
  }

  const db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
  globalForAdmin.codedpixelsAdminDb = db;
  return db;
}

export const adminDb = initAdminDb();
