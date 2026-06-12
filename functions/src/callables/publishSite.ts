import { FieldValue, type CollectionReference } from 'firebase-admin/firestore';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { db } from '../lib/admin';
import { assertCompanyRateLimit } from '../lib/companyRateLimit';
import { MAX_PUBLISHED_VERSIONS_PER_PAGE } from '../lib/constants';
import {
  assertEditorPlusMember,
  resolveCompanyId,
} from '../lib/memberAuth';
import {
  pageSlugToPath,
  validateSiteForPublish,
} from '../lib/publishValidation';
import {
  sendSitePublishedEmailStub,
  triggerSiteRevalidation,
} from '../lib/revalidateSite';
import type { FeatureId, Section } from '@codedpixels/shared-types';

export const publishSitePayloadSchema = z.object({
  siteId: z.string().min(1),
});

export type PublishSitePayload = z.infer<typeof publishSitePayloadSchema>;

export interface PublishSiteResult {
  success: true;
  publishedAt: string;
  paths: string[];
}

interface PageDraftSnapshot {
  pageId: string;
  slug: string;
  draftVersionId: string;
  sections: Section[];
}

async function archiveExcessPublishedVersions(
  versionsRef: CollectionReference,
): Promise<void> {
  const publishedSnap = await versionsRef
    .where('status', '==', 'published')
    .get();

  if (publishedSnap.size <= MAX_PUBLISHED_VERSIONS_PER_PAGE) {
    return;
  }

  const sorted = publishedSnap.docs.sort((a, b) => {
    const aTime =
      a.data().publishedAt?.toMillis?.() ??
      a.data().createdAt?.toMillis?.() ??
      0;
    const bTime =
      b.data().publishedAt?.toMillis?.() ??
      b.data().createdAt?.toMillis?.() ??
      0;
    return bTime - aTime;
  });

  const toArchive = sorted.slice(MAX_PUBLISHED_VERSIONS_PER_PAGE);
  const batch = db.batch();

  for (const doc of toArchive) {
    batch.update(doc.ref, { status: 'archived' });
  }

  await batch.commit();
}

export async function handlePublishSite(
  request: CallableRequest,
): Promise<PublishSiteResult> {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const uid = request.auth.uid;
  let payload: PublishSitePayload;

  try {
    payload = publishSitePayloadSchema.parse(request.data);
  } catch {
    throw new HttpsError('invalid-argument', 'Invalid publishSite payload');
  }

  const companyId = await resolveCompanyId(uid, request.auth.token);
  await assertEditorPlusMember(uid, companyId);
  await assertCompanyRateLimit(companyId, 'publishSite');

  const siteRef = db
    .collection('companies')
    .doc(companyId)
    .collection('sites')
    .doc(payload.siteId);
  const siteSnap = await siteRef.get();

  if (!siteSnap.exists) {
    throw new HttpsError('not-found', 'Site not found');
  }

  const siteData = siteSnap.data()!;
  const featureIds = (siteData.featureIds ?? []) as string[];
  const slug = siteData.slug as string;

  const pagesSnap = await siteRef.collection('pages').get();
  if (pagesSnap.empty) {
    throw new HttpsError('failed-precondition', 'Site has no pages to publish');
  }

  const pageDrafts: PageDraftSnapshot[] = [];

  for (const pageDoc of pagesSnap.docs) {
    const pageData = pageDoc.data();
    const draftVersionId = pageData.draftVersionId as string | undefined;

    if (!draftVersionId) {
      throw new HttpsError(
        'failed-precondition',
        `Page "${pageData.slug}" has no draft version`,
      );
    }

    const draftSnap = await pageDoc.ref
      .collection('versions')
      .doc(draftVersionId)
      .get();

    if (!draftSnap.exists) {
      throw new HttpsError(
        'failed-precondition',
        `Draft version missing for page "${pageData.slug}"`,
      );
    }

    const draftData = draftSnap.data()!;
    pageDrafts.push({
      pageId: pageDoc.id,
      slug: pageData.slug as string,
      draftVersionId,
      sections: (draftData.sections ?? []) as Section[],
    });
  }

  const validationErrors = validateSiteForPublish({
    pages: pageDrafts.map((page) => ({
      pageId: page.pageId,
      slug: page.slug,
      sections: page.sections,
    })),
    featureIds: featureIds as FeatureId[],
  });

  if (validationErrors.length > 0) {
    throw new HttpsError('invalid-argument', 'Publish validation failed', {
      errors: validationErrors,
    });
  }

  const publishedPaths: string[] = [];
  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  for (const page of pageDrafts) {
    const pageRef = siteRef.collection('pages').doc(page.pageId);
    const draftSnap = await pageRef
      .collection('versions')
      .doc(page.draftVersionId)
      .get();
    const draftData = draftSnap.data()!;

    const newVersionRef = pageRef.collection('versions').doc();
    batch.set(newVersionRef, {
      status: 'published',
      schemaVersion: draftData.schemaVersion ?? 1,
      sections: draftData.sections,
      createdBy: uid,
      createdAt: now,
      publishedAt: now,
    });

    batch.update(pageRef, {
      publishedVersionId: newVersionRef.id,
      updatedAt: now,
    });

    publishedPaths.push(pageSlugToPath(page.slug));
  }

  batch.update(siteRef, {
    status: 'published',
    publishedAt: now,
    updatedAt: now,
  });

  await batch.commit();

  for (const page of pageDrafts) {
    const versionsRef = siteRef.collection('pages').doc(page.pageId).collection('versions');
    await archiveExcessPublishedVersions(versionsRef);
  }

  const revalidateBody = {
    companyId,
    siteId: payload.siteId,
    slug,
    paths: publishedPaths,
    tags: [`site:${payload.siteId}`],
  };

  await triggerSiteRevalidation(revalidateBody);
  sendSitePublishedEmailStub({ companyId, siteId: payload.siteId, slug });

  return {
    success: true,
    publishedAt: new Date().toISOString(),
    paths: publishedPaths,
  };
}
