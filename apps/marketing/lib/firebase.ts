import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from 'firebase/app-check';
import {
  connectAuthEmulator,
  getAuth,
  signInWithCustomToken,
  type Auth,
} from 'firebase/auth';
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
let firebaseAuth: Auth | undefined;
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

/** Lazily initialise the Firebase web app (browser only). */
export function getFirebaseApp(): FirebaseApp {
  assertBrowser();

  if (!firebaseApp) {
    firebaseApp =
      getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

/** Firebase Auth — required before Stripe Extension checkout (B6-001). */
export function getFirebaseAuth(): Auth {
  assertBrowser();

  if (!firebaseAuth) {
    firebaseAuth = getAuth(getFirebaseApp());

    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
      connectAuthEmulator(firebaseAuth, 'http://127.0.0.1:9099', {
        disableWarnings: true,
      });
    }
  }

  return firebaseAuth;
}

export async function signInWithCheckoutToken(customToken: string): Promise<void> {
  await signInWithCustomToken(getFirebaseAuth(), customToken);
}

/** Cloud Functions client — europe-west2 per Q33. */
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
