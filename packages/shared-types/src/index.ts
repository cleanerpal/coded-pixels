/** @codedpixels/shared-types — cross-cutting TypeScript shapes (no React, no Firebase SDK) */

export type {
  FeatureId,
  BillingCycle,
  PackageId,
  CustomTemplateBilling,
  ConfigSnapshot,
  ConfigState,
  LineItem,
} from './marketing/config';

export type { Section } from './section';

export type {
  TimestampLike,
  PageSeo,
  MemberRole,
  LeadStatus,
  VersionStatus,
  DomainStatus,
  ProductStatus,
  SiteStatus,
  CompanyStatus,
  TemplateDefaultPage,
  TemplateDoc,
  TemplateSeedFile,
  TemplateSeedManifest,
  Company,
  CompanyPlan,
  Member,
  Site,
  Page,
  PageVersion,
  ProvisioningJob,
  ProvisioningJobStatus,
  Lead,
  LeadContact,
  LeadFormType,
  LeadSource,
  Product,
} from './firestore';
