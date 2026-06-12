import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from 'firebase/app-check';
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from 'firebase/functions';

const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'codedpixels';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'demo-api-key',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
};

let firebaseApp: FirebaseApp | undefined;
let firebaseFunctions: Functions | undefined;
let firebaseFirestore: Firestore | undefined;
let appCheckInitialized = false;

function assertBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error('Firebase client is available in the browser only');
  }
}

function initAppCheck(app: FirebaseApp): void {
  if (appCheckInitialized) {
    return;
  }

  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY;
  if (!siteKey) {
    return;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  appCheckInitialized = true;
}

export function getFirebaseApp(): FirebaseApp {
  assertBrowser();

  if (!firebaseApp) {
    firebaseApp =
      getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

export function getFirebaseFunctions(): Functions {
  assertBrowser();

  if (!firebaseFunctions) {
    firebaseFunctions = getFunctions(getFirebaseApp(), 'europe-west2');

    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
      connectFunctionsEmulator(firebaseFunctions, '127.0.0.1', 5001);
    }
  }

  initAppCheck(getFirebaseApp());
  return firebaseFunctions;
}

export function getFirebaseFirestore(): Firestore {
  assertBrowser();

  if (!firebaseFirestore) {
    firebaseFirestore = getFirestore(getFirebaseApp());

    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
      connectFirestoreEmulator(firebaseFirestore, '127.0.0.1', 8080);
    }
  }

  initAppCheck(getFirebaseApp());
  return firebaseFirestore;
}
