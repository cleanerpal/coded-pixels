import { afterEach, describe, expect, it, vi } from 'vitest';

describe('checkout mode', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to simulated checkout', async () => {
    vi.stubEnv('NEXT_PUBLIC_CHECKOUT_MODE', undefined);
    vi.resetModules();
    const { isSimulatedCheckout } = await import('@/lib/checkout-mode');
    expect(isSimulatedCheckout()).toBe(true);
  });

  it('hides simulation banner when stripe mode is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_CHECKOUT_MODE', 'stripe');
    vi.resetModules();
    const { isSimulatedCheckout } = await import('@/lib/checkout-mode');
    expect(isSimulatedCheckout()).toBe(false);
  });
});
