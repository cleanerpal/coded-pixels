import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import {
  handleCheckoutCompleted,
  type CheckoutSessionSnapshot,
} from '../lib/handleCheckoutCompleted';

/**
 * Stripe Extension writes customers/{uid}/checkout_sessions/{id}.
 * Custom handler provisions tenant on checkout.session.completed (Q63).
 */
export const onStripeCheckoutSessionUpdated = onDocumentUpdated(
  {
    document: 'customers/{uid}/checkout_sessions/{sessionId}',
    region: 'europe-west2',
  },
  async (event) => {
    const before = event.data?.before.data() as CheckoutSessionSnapshot | undefined;
    const after = event.data?.after.data() as CheckoutSessionSnapshot | undefined;

    if (!after) {
      return;
    }

    const wasComplete = before ? isPreviouslyComplete(before) : false;
    const isComplete = isPreviouslyComplete(after);

    if (wasComplete || !isComplete) {
      return;
    }

    const uid = event.params.uid;
    const sessionId = event.params.sessionId;
    const checkoutSessionPath = `customers/${uid}/checkout_sessions/${sessionId}`;

    await handleCheckoutCompleted({
      ownerUid: uid,
      checkoutSessionPath,
      sessionData: after,
    });
  },
);

function isPreviouslyComplete(data: CheckoutSessionSnapshot): boolean {
  if (data.provisioned === true) {
    return true;
  }

  return (
    data.payment_status === 'paid' ||
    data.payment_status === 'no_payment_required' ||
    data.status === 'complete'
  );
}
