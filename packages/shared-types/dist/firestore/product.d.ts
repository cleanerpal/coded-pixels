import type { ProductStatus, TimestampLike } from './common';
/** Ecommerce product — `companies/{companyId}/sites/{siteId}/products/{productId}` (schema §7.5) */
export interface Product {
    name: string;
    slug: string;
    description?: Record<string, unknown>;
    pricePence: number;
    sku?: string;
    status: ProductStatus;
    imageAssetIds?: string[];
    stripePriceId?: string;
    sortOrder: number;
    createdAt: TimestampLike;
    updatedAt: TimestampLike;
}
//# sourceMappingURL=product.d.ts.map