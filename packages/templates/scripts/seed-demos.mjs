#!/usr/bin/env node
/**
 * INF-005 — platform demo tenant seed (marketing-template-preview-spec §3.4–3.5)
 * Aligned with Dr. Alex Rivera on seed idempotency · Dr. Rafael Ortiz on Admin-only writes
 * · Dr. Kai Nakamura on no provisionTenant / Stripe
 *
 * Creates one published demo site per library templateId (excludes `custom`).
 * Deterministic companyId: demo-{templateId}; slug index: slugs/{templateId}.
 *
 * Env:
 *   PLATFORM_DEMO_OWNER_UID — owner UID (emulator default: demo-platform-owner)
 *   FIREBASE_PROJECT_ID — default codedpixels (match seed.mjs)
 *   REVALIDATE_SECRET + SITE_RENDERER_REVALIDATE_URL — optional on-demand ISR after content update
 *
 * Usage:
 *   node scripts/seed-demos.mjs --emulator
 *   node scripts/seed-demos.mjs
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
/** @codedpixels/shared-types — direct dist import (barrel lacks .js extensions for Node ESM) */
import { RESERVED_TEMPLATE_SLUGS } from '../../shared-types/dist/constants/reserved-template-slugs.js';
import {
  cloneSectionsWithNewIds,
  demoCompanyId,
  resolveDemoUpsertAction,
} from './lib/demo-seed-logic.mjs';

const useEmulator = process.argv.includes('--emulator');
const projectId =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.GCLOUD_PROJECT ??
  process.env.GOOGLE_CLOUD_PROJECT ??
  'codedpixels';

/** Emulator default — document for local dev (spec §3.4). */
const DEFAULT_PLATFORM_DEMO_OWNER_UID = 'demo-platform-owner';

const DEMO_SITE_ID = 'main';
const DEMO_HOMEPAGE_PAGE_ID = 'homepage';
const DEMO_PUBLISHED_VERSION_ID = 'published';

function initAdmin() {
  if (getApps().length > 0) {
    return getFirestore();
  }

  if (useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  }

  initializeApp({ projectId });
  return getFirestore();
}

/**
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} templateId
 */
async function loadTemplateDoc(db, templateId) {
  const snap = await db.collection('templates').doc(templateId).get();
  if (!snap.exists) {
    return null;
  }

  const data = snap.data();
  const defaultPage = data?.defaultPage;
  if (!defaultPage?.title || !defaultPage.slug || !defaultPage.seo) {
    throw new Error(`Template ${templateId} missing defaultPage metadata — run seed:templates first`);
  }

  return {
    name: data.name ?? defaultPage.title,
    contentHash: data.contentHash ?? '',
    defaultPage,
    sections: defaultPage.sections ?? [],
  };
}

/**
 * Optional POST to site-renderer /api/revalidate (spec §3.5 contentHash bump).
 * @param {{ companyId: string; siteId: string; slug: string }} params
 */
async function triggerRevalidationIfConfigured(params) {
  const secret = process.env.REVALIDATE_SECRET;
  const baseUrl = process.env.SITE_RENDERER_REVALIDATE_URL;
  if (!secret || !baseUrl) {
    return;
  }

  const url = baseUrl.endsWith('/api/revalidate')
    ? baseUrl
    : `${baseUrl.replace(/\/$/, '')}/api/revalidate`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({
        companyId: params.companyId,
        siteId: params.siteId,
        slug: params.slug,
        tags: [`site-slug:${params.slug}`, `site:${params.siteId}`],
      }),
    });

    if (!response.ok) {
      console.warn(
        `revalidate ${params.slug} — HTTP ${response.status} (cache tag site-slug:${params.slug} may be stale until TTL)`,
      );
    }
  } catch (error) {
    console.warn(
      `revalidate ${params.slug} — ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} templateId
 * @param {string} ownerUid
 * @param {Awaited<ReturnType<typeof loadTemplateDoc>> & object} template
 */
async function createDemoTenant(db, templateId, ownerUid, template) {
  const companyId = demoCompanyId(templateId);
  const now = FieldValue.serverTimestamp();
  const clonedSections = cloneSectionsWithNewIds(template.sections);

  const companyRef = db.collection('companies').doc(companyId);
  const siteRef = companyRef.collection('sites').doc(DEMO_SITE_ID);
  const pageRef = siteRef.collection('pages').doc(DEMO_HOMEPAGE_PAGE_ID);
  const versionRef = pageRef.collection('versions').doc(DEMO_PUBLISHED_VERSION_ID);
  const slugRef = db.collection('slugs').doc(templateId);

  await db.runTransaction(async (transaction) => {
    transaction.set(companyRef, {
      name: template.name,
      slug: templateId,
      ownerUid,
      status: 'active',
      isPlatformDemo: true,
      plan: {
        featureIds: [],
        billingCycle: 'monthly',
        monthlyTotalPence: 0,
      },
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(siteRef, {
      name: template.name,
      slug: templateId,
      templateId,
      featureIds: [],
      status: 'published',
      homepagePageId: DEMO_HOMEPAGE_PAGE_ID,
      appliedTemplateContentHash: template.contentHash,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(pageRef, {
      title: template.defaultPage.title,
      slug: template.defaultPage.slug,
      sortOrder: 0,
      seo: template.defaultPage.seo,
      draftVersionId: DEMO_PUBLISHED_VERSION_ID,
      publishedVersionId: DEMO_PUBLISHED_VERSION_ID,
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(versionRef, {
      status: 'published',
      schemaVersion: 1,
      sections: clonedSections,
      createdBy: ownerUid,
      createdAt: now,
      publishedAt: now,
    });

    transaction.set(slugRef, {
      companyId,
      siteId: DEMO_SITE_ID,
      createdAt: now,
      updatedAt: now,
    });
  });

  console.log(`created demo tenant ${templateId} → ${companyId}`);
}

/**
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} templateId
 * @param {string} ownerUid
 * @param {Awaited<ReturnType<typeof loadTemplateDoc>> & object} template
 */
async function updateDemoTenantSections(db, templateId, ownerUid, template) {
  const companyId = demoCompanyId(templateId);
  const now = FieldValue.serverTimestamp();
  const clonedSections = cloneSectionsWithNewIds(template.sections);

  const companyRef = db.collection('companies').doc(companyId);
  const siteRef = companyRef.collection('sites').doc(DEMO_SITE_ID);
  const pageRef = siteRef.collection('pages').doc(DEMO_HOMEPAGE_PAGE_ID);
  const versionRef = pageRef.collection('versions').doc(DEMO_PUBLISHED_VERSION_ID);

  await db.runTransaction(async (transaction) => {
    transaction.update(companyRef, { updatedAt: now });
    transaction.update(siteRef, {
      appliedTemplateContentHash: template.contentHash,
      updatedAt: now,
    });
    transaction.update(pageRef, { updatedAt: now });
    transaction.set(versionRef, {
      status: 'published',
      schemaVersion: 1,
      sections: clonedSections,
      createdBy: ownerUid,
      createdAt: now,
      publishedAt: now,
    });
  });

  await triggerRevalidationIfConfigured({
    companyId,
    siteId: DEMO_SITE_ID,
    slug: templateId,
  });

  console.log(`updated demo tenant ${templateId} — template contentHash changed`);
}

/**
 * @param {import('firebase-admin/firestore').Firestore} db
 * @param {string} templateId
 * @param {string} ownerUid
 */
async function upsertDemoTenant(db, templateId, ownerUid) {
  const template = await loadTemplateDoc(db, templateId);
  const companyId = demoCompanyId(templateId);
  const companySnap = template
    ? await db.collection('companies').doc(companyId).get()
    : null;

  let appliedHash;
  if (template && companySnap?.exists) {
    const siteSnap = await db
      .collection('companies')
      .doc(companyId)
      .collection('sites')
      .doc(DEMO_SITE_ID)
      .get();
    appliedHash = siteSnap.exists
      ? siteSnap.get('appliedTemplateContentHash')
      : undefined;
  }

  const action = resolveDemoUpsertAction({
    templateExists: Boolean(template),
    templateContentHash: template?.contentHash,
    companyExists: Boolean(companySnap?.exists),
    appliedTemplateContentHash: appliedHash,
  });

  if (action === 'missing-template') {
    console.warn(`skip ${templateId} — templates/${templateId} not found (run seed:templates first)`);
    return 'missing-template';
  }

  if (!template?.contentHash) {
    throw new Error(`Template ${templateId} missing contentHash — run seed:templates first`);
  }

  if (action === 'create') {
    await createDemoTenant(db, templateId, ownerUid, template);
    return 'created';
  }

  if (action === 'skip') {
    console.log(`skip ${templateId} — unchanged (contentHash match)`);
    return 'skipped';
  }

  await updateDemoTenantSections(db, templateId, ownerUid, template);
  return 'updated';
}

async function main() {
  const ownerUid =
    process.env.PLATFORM_DEMO_OWNER_UID ?? DEFAULT_PLATFORM_DEMO_OWNER_UID;

  if (useEmulator && !process.env.PLATFORM_DEMO_OWNER_UID) {
    console.log(
      `seed:template-demos:emulator — using default PLATFORM_DEMO_OWNER_UID=${DEFAULT_PLATFORM_DEMO_OWNER_UID}`,
    );
  }

  const db = initAdmin();

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const templateId of RESERVED_TEMPLATE_SLUGS) {
    const result = await upsertDemoTenant(db, templateId, ownerUid);
    if (result === 'created') created += 1;
    else if (result === 'updated') updated += 1;
    else if (result === 'skipped') skipped += 1;
    else if (result === 'missing-template') missing += 1;
  }

  console.log(
    `seed:template-demos${useEmulator ? ':emulator' : ''} — done (created ${created}, updated ${updated}, skipped ${skipped}, missing-template ${missing})`,
  );

  if (missing > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
