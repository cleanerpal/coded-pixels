import type { Metadata } from 'next';

import { BillingPageClient } from './BillingPageClient';

export const metadata: Metadata = {
  title: 'Billing',
};

export default function BillingPage() {
  return <BillingPageClient />;
}
