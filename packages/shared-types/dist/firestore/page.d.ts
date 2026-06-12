import type { Section } from '../section';
import type { PageSeo, TimestampLike, VersionStatus } from './common';
/** Page metadata — `.../pages/{pageId}` (firestore-schema.md §7.1) */
export interface Page {
    title: string;
    slug: string;
    sortOrder: number;
    seo: PageSeo;
    draftVersionId: string;
    publishedVersionId?: string;
    createdAt: TimestampLike;
    updatedAt: TimestampLike;
}
/** Page content version — `.../pages/{pageId}/versions/{versionId}` (firestore-schema.md §7.2) */
export interface PageVersion {
    status: VersionStatus;
    schemaVersion: number;
    sections: Section[];
    createdBy: string;
    createdAt: TimestampLike;
    publishedAt?: TimestampLike;
    label?: string;
}
//# sourceMappingURL=page.d.ts.map