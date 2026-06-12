import type { Product } from '@codedpixels/shared-types';

export interface ProductWithId extends Product {
  id: string;
}

export const MOCK_PRODUCTS: ProductWithId[] = [
  {
    id: 'mock-product-1',
    name: 'Starter Kit',
    slug: 'starter-kit',
    description: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Everything you need to get started.' }] }],
    },
    pricePence: 2499,
    sku: 'SKU-001',
    status: 'published',
    sortOrder: 0,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: 'mock-product-2',
    name: 'Premium Bundle',
    slug: 'premium-bundle',
    pricePence: 4999,
    status: 'draft',
    sortOrder: 1,
    createdAt: '2026-06-05T14:00:00.000Z',
    updatedAt: '2026-06-05T14:00:00.000Z',
  },
];

export function formatPricePence(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100);
}

export function slugifyProductName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
