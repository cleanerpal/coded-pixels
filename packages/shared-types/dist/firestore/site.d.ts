import type { FeatureId } from '../marketing/config';
import type { SiteStatus, TimestampLike } from './common';
/** `companies/{companyId}/sites/{siteId}` (firestore-schema.md §7) */
export interface Site {
    name: string;
    slug: string;
    templateId: string;
    featureIds: FeatureId[];
    status: SiteStatus;
    homepagePageId: string;
    publishedAt?: TimestampLike;
    createdAt: TimestampLike;
    updatedAt: TimestampLike;
}
//# sourceMappingURL=site.d.ts.map