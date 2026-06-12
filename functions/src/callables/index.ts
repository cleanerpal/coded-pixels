import { onCall } from 'firebase-functions/v2/https';
import {
  handleCreateCheckoutSession,
  marketingCallableOptions as checkoutCallableOptions,
} from './createCheckoutSession';
import {
  handleSubmitSignup,
  handleSubmitSiteImportWaitlist,
  marketingCallableOptions,
} from './marketing';
import { handlePublishSite } from './publishSite';

/** Get Started email capture — firestore-schema.md §4.1 */
export const submitSignup = onCall(marketingCallableOptions, handleSubmitSignup);

/** Site Import waitlist — firestore-schema.md §4.2, Q17 config snapshot */
export const submitSiteImportWaitlist = onCall(
  marketingCallableOptions,
  handleSubmitSiteImportWaitlist,
);

/** Publish draft site to live — builder-ui-spec.md §7.1 */
export const publishSite = onCall(marketingCallableOptions, handlePublishSite);

/** Stripe Extension checkout — stripe-catalogue.md §11 (B6-001) */
export const createCheckoutSession = onCall(
  checkoutCallableOptions,
  handleCreateCheckoutSession,
);
