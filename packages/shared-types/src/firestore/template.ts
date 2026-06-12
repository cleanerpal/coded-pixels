import type { Section } from '../section';
import type { PageSeo, TimestampLike } from './common';

/** Page defaults embedded in platform template catalogue (firestore-schema.md §5.2) */
export interface TemplateDefaultPage {
  title: string;
  slug: string;
  seo: PageSeo;
  sections: Section[];
}

/** Platform-managed template doc — `templates/{templateId}` */
export interface TemplateDoc {
  name: string;
  category: string;
  description: string;
  sortOrder: number;
  defaultPage: TemplateDefaultPage;
  isCustomTemplate: boolean;
  updatedAt: TimestampLike;
  /** CI-managed — optional on read; set by seed job */
  seedVersion?: number;
  /** CI-managed — SHA-256 of canonical seed payload */
  contentHash?: string;
}

/** Authoring source shape — maps to Firestore on seed (template-seeding-ci-spec §3.2) */
export interface TemplateSeedFile {
  templateId: string;
  metadata: {
    name: string;
    category: string;
    description: string;
    sortOrder: number;
    isCustomTemplate: boolean;
  };
  defaultPage: {
    title: string;
    slug: string;
    seo: PageSeo;
  };
  defaultSections: Section[];
}

export interface TemplateSeedManifest {
  schemaVersion: number;
  seedVersion: number;
  templates: string[];
}
