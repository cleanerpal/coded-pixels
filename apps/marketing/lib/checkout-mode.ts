export type CheckoutMode = 'simulated' | 'stripe';

/**
 * B6 checkout mode — simulated MVP until B6-001 Stripe Extension is live.
 * NEXT_PUBLIC_CHECKOUT_MODE=stripe hides the simulation banner on /get-started.
 */
export function getCheckoutMode(): CheckoutMode {
  const mode = process.env.NEXT_PUBLIC_CHECKOUT_MODE;
  return mode === 'stripe' ? 'stripe' : 'simulated';
}

export function isSimulatedCheckout(): boolean {
  return getCheckoutMode() === 'simulated';
}
