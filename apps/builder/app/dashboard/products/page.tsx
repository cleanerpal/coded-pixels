import type { Metadata } from 'next';

import { ProductsPageClient } from './ProductsPageClient';

export const metadata: Metadata = {
  title: 'Products',
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
