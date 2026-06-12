/** ISO date string or Firestore Timestamp shape — no Firebase SDK in this package */
export type TimestampLike =
  | string
  | Date
  | { seconds: number; nanoseconds: number };

export interface PageSeo {
  title: string;
  description: string;
}

export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type LeadStatus = 'new' | 'read' | 'archived';
export type VersionStatus = 'draft' | 'published' | 'archived';
export type DomainStatus = 'pending' | 'verifying' | 'active' | 'failed';
export type ProductStatus = 'draft' | 'published';
export type SiteStatus = 'draft' | 'published' | 'suspended';
export type CompanyStatus = 'active' | 'trialing' | 'past_due' | 'cancelled';
