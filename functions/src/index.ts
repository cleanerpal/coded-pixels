/**
 * CodedPixels Cloud Functions (v2) — europe-west2 (London)
 *
 * Callable implementations: INF-003, B3-001, B6-001, B7-001.
 * Storage pipeline: ClamAV scan + Resize Images Extension (Q44, Q64).
 *
 * Aligned with Dr. Kai Nakamura on Functions setup (Q29, Q33).
 */
import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({ region: 'europe-west2' });

export {
  submitSignup,
  submitSiteImportWaitlist,
  publishSite,
  submitLead,
  manageProduct,
  createPortalSession,
  createCheckoutSession,
  createAssetUpload,
} from './callables';

export { onStripeCheckoutSessionUpdated } from './triggers/checkoutSessionCompleted';
export { onAssetObjectFinalized } from './triggers/clamAvAssetScan';
