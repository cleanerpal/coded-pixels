import { onCall } from 'firebase-functions/v2/https';
import {
  handleCreateCheckoutSession,
  marketingCallableOptions as checkoutCallableOptions,
} from './createCheckoutSession';
import { handleCreateAssetUpload } from './createAssetUpload';
import {
  createPortalSessionCallableOptions,
  handleCreatePortalSession,
} from './createPortalSession';
import {
  handleManageProduct,
  manageProductCallableOptions,
} from './manageProduct';
import {
  handleSubmitSignup,
  handleSubmitSiteImportWaitlist,
  marketingCallableOptions,
} from './marketing';
import { handlePublishSite } from './publishSite';
import {
  handleSubmitLead,
  submitLeadCallableOptions,
} from './submitLead';

/** Get Started email capture — firestore-schema.md §4.1 */
export const submitSignup = onCall(marketingCallableOptions, handleSubmitSignup);

/** Site Import waitlist — firestore-schema.md §4.2, Q17 config snapshot */
export const submitSiteImportWaitlist = onCall(
  marketingCallableOptions,
  handleSubmitSiteImportWaitlist,
);

/** Publish draft site to live — builder-ui-spec.md §7.1 */
export const publishSite = onCall(marketingCallableOptions, handlePublishSite);

/** Public contact/booking form → lead — firestore-schema.md §7.4 (B8-001) */
export const submitLead = onCall(submitLeadCallableOptions, handleSubmitLead);

/** Ecommerce product CRUD — firestore-schema.md §7.5 (B8-001) */
export const manageProduct = onCall(
  manageProductCallableOptions,
  handleManageProduct,
);

/** Stripe Customer Portal session — Q46 (B8-001) */
export const createPortalSession = onCall(
  createPortalSessionCallableOptions,
  handleCreatePortalSession,
);

/** Stripe Extension checkout — stripe-catalogue.md §11 (B6-001) */
export const createCheckoutSession = onCall(
  checkoutCallableOptions,
  handleCreateCheckoutSession,
);

/** Asset upload signed URL + pending metadata — firestore-schema.md §7.3 (B7-001) */
export const createAssetUpload = onCall(
  marketingCallableOptions,
  handleCreateAssetUpload,
);
