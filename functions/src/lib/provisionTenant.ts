import { randomUUID } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { CompanyPlan, ConfigSnapshot } from '@codedpixels/shared-types';
import { db } from './admin';
import { cloneSectionsWithNewIds, type SectionNode } from './cloneSections';
import { businessNameFromEmail, buildProvisionalSlug } from './provisionSlug';
import { SIGNUP_STATUS_CONVERTED } from './constants';

export interface ProvisionTenantInput {
  signupId: string;
  ownerUid: string;
  email: string;
  config: ConfigSnapshot;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  featureIds: ConfigSnapshot['featureIds'];
  companyStatus?: 'active' | 'trialing';
}

export interface ProvisionTenantResult {
  companyId: string;
  siteId: string;
  slug: string;
  alreadyProvisioned: boolean;
}

interface TemplateDefaultPage {
  title: string;
  slug: string;
  seo: { title: string; description: string };
  sections?: SectionNode[];
}

function buildPlanObject(
  config: ConfigSnapshot,
  featureIds: ConfigSnapshot['featureIds'],
): CompanyPlan {
  return {
    featureIds,
    billingCycle: config.billingCycle,
    monthlyTotalPence: config.monthlyTotalPence,
    ...(config.annualTotalPence !== undefined
      ? { annualTotalPence: config.annualTotalPence }
      : {}),
    ...(config.customTemplateBilling
      ? { customTemplateBilling: config.customTemplateBilling }
      : {}),
    ...(config.packageId ? { packageId: config.packageId } : {}),
  };
}

async function loadTemplateSections(
  templateId: string,
): Promise<{ defaultPage: TemplateDefaultPage; sections: SectionNode[] }> {
  const templateSnap = await db.collection('templates').doc(templateId).get();
  if (!templateSnap.exists) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const data = templateSnap.data() as {
    defaultPage?: TemplateDefaultPage;
  };

  const defaultPage = data.defaultPage;
  if (!defaultPage?.title || !defaultPage.slug || !defaultPage.seo) {
    throw new Error(`Template ${templateId} missing defaultPage metadata`);
  }

  const sections = defaultPage.sections ?? [];
  return { defaultPage, sections };
}

/**
 * Provision tenant per firestore-schema.md §13.
 * Idempotent when signup already converted — returns existing companyId.
 */
export async function provisionTenant(
  input: ProvisionTenantInput,
): Promise<ProvisionTenantResult> {
  const signupRef = db.collection('signups').doc(input.signupId);
  const signupSnap = await signupRef.get();
  if (!signupSnap.exists) {
    throw new Error(`Signup not found: ${input.signupId}`);
  }

  const signupData = signupSnap.data() as {
    status?: string;
    convertedCompanyId?: string;
    email?: string;
  };

  if (signupData.status === SIGNUP_STATUS_CONVERTED && signupData.convertedCompanyId) {
    const companySnap = await db
      .collection('companies')
      .doc(signupData.convertedCompanyId)
      .get();

    if (companySnap.exists) {
      const company = companySnap.data() as { slug?: string };
      const siteQuery = await db
        .collection('companies')
        .doc(signupData.convertedCompanyId)
        .collection('sites')
        .limit(1)
        .get();

      return {
        companyId: signupData.convertedCompanyId,
        siteId: siteQuery.docs[0]?.id ?? '',
        slug: company.slug ?? '',
        alreadyProvisioned: true,
      };
    }
  }

  if (input.config.templateId === 'unset') {
    throw new Error('Configurator templateId is required for provisioning');
  }

  const { defaultPage, sections } = await loadTemplateSections(
    input.config.templateId,
  );

  const companyId = db.collection('companies').doc().id;
  const siteId = db.collection('companies').doc(companyId).collection('sites').doc().id;
  const pageId = randomUUID();
  const draftVersionId = randomUUID();
  const slug = buildProvisionalSlug(input.signupId);
  const businessName = businessNameFromEmail(input.email);
  const now = FieldValue.serverTimestamp();
  const clonedSections = cloneSectionsWithNewIds(sections);
  const plan = buildPlanObject(input.config, input.featureIds);
  const companyStatus = input.companyStatus ?? 'active';

  await db.runTransaction(async (transaction) => {
    const slugRef = db.collection('slugs').doc(slug);
    const slugSnap = await transaction.get(slugRef);
    if (slugSnap.exists) {
      throw new Error(`Slug already taken: ${slug}`);
    }

    const companyRef = db.collection('companies').doc(companyId);
    const memberRef = companyRef.collection('members').doc(input.ownerUid);
    const siteRef = companyRef.collection('sites').doc(siteId);
    const pageRef = siteRef.collection('pages').doc(pageId);
    const versionRef = pageRef.collection('versions').doc(draftVersionId);
    const userRef = db.collection('users').doc(input.ownerUid);

    transaction.set(companyRef, {
      name: businessName,
      slug,
      ownerUid: input.ownerUid,
      status: companyStatus,
      plan,
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId,
      onboardingStep: 1,
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(memberRef, {
      email: input.email.toLowerCase(),
      role: 'owner',
      joinedAt: now,
      updatedAt: now,
    });

    transaction.set(siteRef, {
      name: businessName,
      slug,
      templateId: input.config.templateId,
      featureIds: [...input.featureIds],
      status: 'draft',
      homepagePageId: pageId,
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(pageRef, {
      title: defaultPage.title,
      slug: defaultPage.slug,
      sortOrder: 0,
      seo: defaultPage.seo,
      draftVersionId,
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(versionRef, {
      status: 'draft',
      schemaVersion: 1,
      sections: clonedSections,
      createdBy: input.ownerUid,
      createdAt: now,
    });

    transaction.set(slugRef, {
      companyId,
      siteId,
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(
      userRef,
      {
        email: input.email.toLowerCase(),
        defaultCompanyId: companyId,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true },
    );

    transaction.update(signupRef, {
      status: SIGNUP_STATUS_CONVERTED,
      convertedCompanyId: companyId,
    });
  });

  await getAuth().setCustomUserClaims(input.ownerUid, {
    companyId,
    role: 'owner',
  });

  return {
    companyId,
    siteId,
    slug,
    alreadyProvisioned: false,
  };
}
