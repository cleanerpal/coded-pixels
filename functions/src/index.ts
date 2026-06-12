/**
 * CodedPixels Cloud Functions (v2) — europe-west2 (London)
 *
 * Callable implementations: INF-003 (`submitSignup`, `submitSiteImportWaitlist`).
 * Firestore rules deploy: INF-002 (docs/specs/firestore-rules-spec.md §11).
 *
 * Aligned with Dr. Kai Nakamura on Functions setup (Q29, Q33).
 */
import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({ region: 'europe-west2' });

export {
  submitSignup,
  submitSiteImportWaitlist,
  publishSite,
  createCheckoutSession,
} from './callables';

export { onStripeCheckoutSessionUpdated } from './triggers/checkoutSessionCompleted';
