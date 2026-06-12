import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

import {
  cleanupRulesTestEnvironment,
  getRulesTestEnvironment,
} from '../setup';

type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

interface TenantMember {
  uid: string;
  role: MemberRole;
}

interface SeedTenantOptions {
  companyId: string;
  siteId?: string;
  pageId?: string;
  members?: TenantMember[];
  featureIds?: string[];
  withPublishedVersions?: boolean;
  withLead?: boolean;
  withInvite?: boolean;
  withDomain?: boolean;
  withProducts?: boolean;
}

const DEFAULT_PLAN = {
  billingCycle: 'monthly',
  monthlyTotalPence: 2900,
} as const;

async function seedTenant(
  testEnv: RulesTestEnvironment,
  options: SeedTenantOptions,
): Promise<void> {
  const {
    companyId,
    siteId = 'site-1',
    pageId = 'page-1',
    members = [],
    featureIds = ['crm', 'ecommerce'],
    withPublishedVersions = false,
    withLead = false,
    withInvite = false,
    withDomain = false,
    withProducts = false,
  } = options;

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const ownerUid =
      members.find((member) => member.role === 'owner')?.uid ??
      members[0]?.uid ??
      'owner-uid';

    await setDoc(doc(db, 'companies', companyId), {
      name: 'Test Company',
      slug: companyId,
      ownerUid,
      status: 'active',
      plan: {
        ...DEFAULT_PLAN,
        featureIds,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (const member of members) {
      await setDoc(doc(db, 'companies', companyId, 'members', member.uid), {
        email: `${member.uid}@example.com`,
        role: member.role,
        joinedAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await setDoc(doc(db, 'companies', companyId, 'sites', siteId), {
      name: 'Test Site',
      slug: companyId,
      templateId: 'starter-template',
      featureIds,
      status: 'active',
      homepagePageId: pageId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (withPublishedVersions) {
      await setDoc(
        doc(db, 'companies', companyId, 'sites', siteId, 'pages', pageId),
        {
          title: 'Home',
          slug: 'home',
          publishedVersionId: 'version-published',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
      await setDoc(
        doc(
          db,
          'companies',
          companyId,
          'sites',
          siteId,
          'pages',
          pageId,
          'versions',
          'version-published',
        ),
        {
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
      await setDoc(
        doc(
          db,
          'companies',
          companyId,
          'sites',
          siteId,
          'pages',
          pageId,
          'versions',
          'version-draft',
        ),
        {
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    }

    if (withLead) {
      await setDoc(
        doc(db, 'companies', companyId, 'sites', siteId, 'leads', 'lead-1'),
        {
          status: 'new',
          email: 'lead@example.com',
          createdAt: new Date(),
        },
      );
    }

    if (withInvite) {
      await setDoc(
        doc(db, 'companies', companyId, 'invites', 'invite-1'),
        {
          email: 'invite@example.com',
          role: 'editor',
          status: 'pending',
          invitedBy: ownerUid,
          expiresAt: new Date(),
          createdAt: new Date(),
        },
      );
    }

    if (withDomain) {
      await setDoc(
        doc(db, 'companies', companyId, 'sites', siteId, 'domains', 'domain-1'),
        {
          hostname: 'example.com',
          status: 'pending',
          createdAt: new Date(),
        },
      );
    }

    if (withProducts) {
      await setDoc(
        doc(
          db,
          'companies',
          companyId,
          'sites',
          siteId,
          'products',
          'product-published',
        ),
        {
          name: 'Published product',
          status: 'published',
          createdAt: new Date(),
        },
      );
      await setDoc(
        doc(
          db,
          'companies',
          companyId,
          'sites',
          siteId,
          'products',
          'product-draft',
        ),
        {
          name: 'Draft product',
          status: 'draft',
          createdAt: new Date(),
        },
      );
    }
  });
}

describe('Firestore security rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await getRulesTestEnvironment();
  });

  afterAll(async () => {
    await cleanupRulesTestEnvironment();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('M3 signups — client denied', () => {
    it('denies unauthenticated read', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(db, 'signups/signup-1')));
    });

    it('denies unauthenticated create', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        addDoc(collection(db, 'signups'), { email: 'a@example.com' }),
      );
    });

    it('denies authenticated read', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(getDoc(doc(db, 'signups/signup-1')));
    });

    it('denies authenticated write', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(
        setDoc(doc(db, 'signups/signup-1'), { email: 'a@example.com' }),
      );
    });
  });

  describe('M3 waitlist_site_import — client denied', () => {
    it('denies unauthenticated read', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(db, 'waitlist_site_import/entry-1')));
    });

    it('denies unauthenticated create', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        addDoc(collection(db, 'waitlist_site_import'), {
          email: 'a@example.com',
        }),
      );
    });

    it('denies authenticated read', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(getDoc(doc(db, 'waitlist_site_import/entry-1')));
    });

    it('denies authenticated write', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(
        setDoc(doc(db, 'waitlist_site_import/entry-1'), {
          email: 'a@example.com',
        }),
      );
    });
  });

  describe('M3 rateLimits — client denied', () => {
    it('denies unauthenticated read', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(db, 'rateLimits/limit-1')));
    });

    it('denies unauthenticated write', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        setDoc(doc(db, 'rateLimits/limit-1'), { count: 1 }),
      );
    });

    it('denies authenticated read', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(getDoc(doc(db, 'rateLimits/limit-1')));
    });

    it('denies authenticated write', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(
        setDoc(doc(db, 'rateLimits/limit-1'), { count: 1 }),
      );
    });
  });

  describe('templates — authenticated read only', () => {
    const templateId = 'starter-template';

    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'templates', templateId), {
          name: 'Starter',
        });
      });
    });

    it('denies unauthenticated read', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(db, 'templates', templateId)));
    });

    it('allows authenticated read', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertSucceeds(getDoc(doc(db, 'templates', templateId)));
    });

    it('denies authenticated write', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(
        setDoc(doc(db, 'templates', 'new-template'), { name: 'New' }),
      );
    });

    it('denies authenticated update', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(
        setDoc(doc(db, 'templates', templateId), { name: 'Updated' }),
      );
    });
  });

  describe('users/{uid} — own read only', () => {
    const userId = 'user-self';
    const otherUserId = 'user-other';

    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, 'users', userId), { email: 'self@example.com' });
        await setDoc(doc(db, 'users', otherUserId), {
          email: 'other@example.com',
        });
      });
    });

    it('allows authenticated user to read own doc', async () => {
      const db = testEnv.authenticatedContext(userId).firestore();
      await assertSucceeds(getDoc(doc(db, 'users', userId)));
    });

    it('denies authenticated user reading another user doc', async () => {
      const db = testEnv.authenticatedContext(userId).firestore();
      await assertFails(getDoc(doc(db, 'users', otherUserId)));
    });

    it('denies unauthenticated read', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(db, 'users', userId)));
    });

    it('denies authenticated write to own doc', async () => {
      const db = testEnv.authenticatedContext(userId).firestore();
      await assertFails(
        setDoc(doc(db, 'users', userId), { email: 'changed@example.com' }),
      );
    });
  });

  describe('slugs — all client access denied', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'slugs', 'acme'), {
          companyId: 'company-1',
          siteId: 'site-1',
        });
      });
    });

    it('denies unauthenticated read', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(db, 'slugs', 'acme')));
    });

    it('denies authenticated read', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(getDoc(doc(db, 'slugs', 'acme')));
    });

    it('denies authenticated write', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(setDoc(doc(db, 'slugs', 'new-slug'), { companyId: 'x' }));
    });
  });

  describe('Stripe Extension collections — all client access denied', () => {
    beforeEach(async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, 'customers', 'user-1'), { stripeId: 'cus_123' });
        await setDoc(doc(db, 'products', 'prod_123'), { name: 'Plan' });
        await setDoc(doc(db, 'checkout_sessions', 'cs_123'), { status: 'open' });
        await setDoc(doc(db, 'subscriptions', 'sub_123'), { status: 'active' });
      });
    });

    it('denies client read on customers', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(getDoc(doc(db, 'customers', 'user-1')));
    });

    it('denies client write on customers', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(
        setDoc(doc(db, 'customers', 'user-1'), { stripeId: 'cus_new' }),
      );
    });

    it('denies client read on top-level Stripe products', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(getDoc(doc(db, 'products', 'prod_123')));
    });

    it('denies client read on checkout_sessions', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(getDoc(doc(db, 'checkout_sessions', 'cs_123')));
    });

    it('denies client read on subscriptions', async () => {
      const db = testEnv.authenticatedContext('user-1').firestore();
      await assertFails(getDoc(doc(db, 'subscriptions', 'sub_123')));
    });
  });

  describe('tenant isolation', () => {
    beforeEach(async () => {
      await seedTenant(testEnv, {
        companyId: 'company-1',
        members: [{ uid: 'user-a', role: 'viewer' }],
      });
      await seedTenant(testEnv, {
        companyId: 'company-2',
        members: [{ uid: 'user-b', role: 'viewer' }],
      });
    });

    it('denies member of company-1 reading company-2 root', async () => {
      const db = testEnv.authenticatedContext('user-a').firestore();
      await assertFails(getDoc(doc(db, 'companies', 'company-2')));
    });

    it('denies member of company-1 reading company-2 site', async () => {
      const db = testEnv.authenticatedContext('user-a').firestore();
      await assertFails(
        getDoc(doc(db, 'companies', 'company-2', 'sites', 'site-1')),
      );
    });

    it('denies member of company-1 reading company-2 member doc', async () => {
      const db = testEnv.authenticatedContext('user-a').firestore();
      await assertFails(
        getDoc(doc(db, 'companies', 'company-2', 'members', 'user-b')),
      );
    });

    it('allows member reading own company', async () => {
      const db = testEnv.authenticatedContext('user-a').firestore();
      await assertSucceeds(getDoc(doc(db, 'companies', 'company-1')));
    });
  });

  describe('role hierarchy', () => {
    const companyId = 'company-roles';
    const siteId = 'site-1';

    beforeEach(async () => {
      await seedTenant(testEnv, {
        companyId,
        siteId,
        members: [
          { uid: 'user-viewer', role: 'viewer' },
          { uid: 'user-editor', role: 'editor' },
          { uid: 'user-admin', role: 'admin' },
          { uid: 'user-owner', role: 'owner' },
        ],
        withLead: true,
        withInvite: true,
        withDomain: true,
      });
    });

    it('allows viewer to read company, site, and lead', async () => {
      const db = testEnv.authenticatedContext('user-viewer').firestore();
      await assertSucceeds(getDoc(doc(db, 'companies', companyId)));
      await assertSucceeds(
        getDoc(doc(db, 'companies', companyId, 'sites', siteId)),
      );
      await assertSucceeds(
        getDoc(doc(db, 'companies', companyId, 'sites', siteId, 'leads', 'lead-1')),
      );
    });

    it('denies viewer reading invites and domains', async () => {
      const db = testEnv.authenticatedContext('user-viewer').firestore();
      await assertFails(getDoc(doc(db, 'companies', companyId, 'invites', 'invite-1')));
      await assertFails(
        getDoc(doc(db, 'companies', companyId, 'sites', siteId, 'domains', 'domain-1')),
      );
    });

    it('allows admin to read invites and domains', async () => {
      const db = testEnv.authenticatedContext('user-admin').firestore();
      await assertSucceeds(getDoc(doc(db, 'companies', companyId, 'invites', 'invite-1')));
      await assertSucceeds(
        getDoc(doc(db, 'companies', companyId, 'sites', siteId, 'domains', 'domain-1')),
      );
    });

    it('allows owner to read invites and domains', async () => {
      const db = testEnv.authenticatedContext('user-owner').firestore();
      await assertSucceeds(getDoc(doc(db, 'companies', companyId, 'invites', 'invite-1')));
      await assertSucceeds(
        getDoc(doc(db, 'companies', companyId, 'sites', siteId, 'domains', 'domain-1')),
      );
    });

    it('denies editor reading invites', async () => {
      const db = testEnv.authenticatedContext('user-editor').firestore();
      await assertFails(getDoc(doc(db, 'companies', companyId, 'invites', 'invite-1')));
    });

    it('denies all roles writing company docs', async () => {
      const ownerDb = testEnv.authenticatedContext('user-owner').firestore();
      await assertFails(
        setDoc(doc(ownerDb, 'companies', companyId), { name: 'Changed' }),
      );
    });
  });

  describe('published versions', () => {
    const companyId = 'company-versions';
    const siteId = 'site-1';
    const pageId = 'page-1';

    beforeEach(async () => {
      await seedTenant(testEnv, {
        companyId,
        siteId,
        pageId,
        members: [{ uid: 'tenant-member', role: 'viewer' }],
        withPublishedVersions: true,
      });
    });

    it('allows unauthenticated read of published version only', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(
        getDoc(
          doc(
            db,
            'companies',
            companyId,
            'sites',
            siteId,
            'pages',
            pageId,
            'versions',
            'version-published',
          ),
        ),
      );
      await assertFails(
        getDoc(
          doc(
            db,
            'companies',
            companyId,
            'sites',
            siteId,
            'pages',
            pageId,
            'versions',
            'version-draft',
          ),
        ),
      );
    });

    it('allows tenant member to read draft version', async () => {
      const db = testEnv.authenticatedContext('tenant-member').firestore();
      await assertSucceeds(
        getDoc(
          doc(
            db,
            'companies',
            companyId,
            'sites',
            siteId,
            'pages',
            pageId,
            'versions',
            'version-draft',
          ),
        ),
      );
    });

    it('denies cross-tenant member reading draft version', async () => {
      await seedTenant(testEnv, {
        companyId: 'company-other',
        members: [{ uid: 'other-member', role: 'viewer' }],
      });

      const db = testEnv.authenticatedContext('other-member').firestore();
      await assertFails(
        getDoc(
          doc(
            db,
            'companies',
            companyId,
            'sites',
            siteId,
            'pages',
            pageId,
            'versions',
            'version-draft',
          ),
        ),
      );
    });
  });

  describe('leads — CRM feature gate and editor field limits', () => {
    const companyId = 'company-leads';
    const siteId = 'site-1';

    beforeEach(async () => {
      await seedTenant(testEnv, {
        companyId,
        siteId,
        members: [
          { uid: 'user-viewer', role: 'viewer' },
          { uid: 'user-editor', role: 'editor' },
          { uid: 'user-admin', role: 'admin' },
        ],
        withLead: true,
      });
    });

    it('denies lead read when company lacks crm feature', async () => {
      await seedTenant(testEnv, {
        companyId: 'company-no-crm',
        siteId,
        members: [{ uid: 'viewer-no-crm', role: 'viewer' }],
        featureIds: ['ecommerce'],
        withLead: true,
      });

      const db = testEnv.authenticatedContext('viewer-no-crm').firestore();
      await assertFails(
        getDoc(
          doc(db, 'companies', 'company-no-crm', 'sites', siteId, 'leads', 'lead-1'),
        ),
      );
    });

    it('allows editor to update status, readAt, and archivedAt only', async () => {
      const db = testEnv.authenticatedContext('user-editor').firestore();
      const leadRef = doc(
        db,
        'companies',
        companyId,
        'sites',
        siteId,
        'leads',
        'lead-1',
      );

      await assertSucceeds(
        updateDoc(leadRef, {
          status: 'read',
          readAt: new Date(),
        }),
      );
      await assertSucceeds(
        updateDoc(leadRef, {
          archivedAt: new Date(),
        }),
      );
    });

    it('denies editor updating non-allowed lead fields', async () => {
      const db = testEnv.authenticatedContext('user-editor').firestore();
      await assertFails(
        updateDoc(
          doc(db, 'companies', companyId, 'sites', siteId, 'leads', 'lead-1'),
          { email: 'changed@example.com' },
        ),
      );
    });

    it('denies viewer updating lead status', async () => {
      const db = testEnv.authenticatedContext('user-viewer').firestore();
      await assertFails(
        updateDoc(
          doc(db, 'companies', companyId, 'sites', siteId, 'leads', 'lead-1'),
          { status: 'read' },
        ),
      );
    });

    it('denies editor creating leads', async () => {
      const db = testEnv.authenticatedContext('user-editor').firestore();
      await assertFails(
        setDoc(
          doc(db, 'companies', companyId, 'sites', siteId, 'leads', 'lead-new'),
          { status: 'new', email: 'new@example.com' },
        ),
      );
    });

    it('denies editor deleting leads', async () => {
      const db = testEnv.authenticatedContext('user-editor').firestore();
      await assertFails(
        deleteDoc(
          doc(db, 'companies', companyId, 'sites', siteId, 'leads', 'lead-1'),
        ),
      );
    });

    it('allows admin to delete leads', async () => {
      const db = testEnv.authenticatedContext('user-admin').firestore();
      await assertSucceeds(
        deleteDoc(
          doc(db, 'companies', companyId, 'sites', siteId, 'leads', 'lead-1'),
        ),
      );
    });
  });

  describe('tenant products — published public read with ecommerce feature', () => {
    const companyId = 'company-products';
    const siteId = 'site-1';

    beforeEach(async () => {
      await seedTenant(testEnv, {
        companyId,
        siteId,
        members: [{ uid: 'tenant-viewer', role: 'viewer' }],
        withProducts: true,
      });
    });

    it('allows unauthenticated read of published product when ecommerce enabled', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertSucceeds(
        getDoc(
          doc(
            db,
            'companies',
            companyId,
            'sites',
            siteId,
            'products',
            'product-published',
          ),
        ),
      );
    });

    it('denies unauthenticated read of draft product', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        getDoc(
          doc(
            db,
            'companies',
            companyId,
            'sites',
            siteId,
            'products',
            'product-draft',
          ),
        ),
      );
    });

    it('allows tenant viewer to read draft product', async () => {
      const db = testEnv.authenticatedContext('tenant-viewer').firestore();
      await assertSucceeds(
        getDoc(
          doc(
            db,
            'companies',
            companyId,
            'sites',
            siteId,
            'products',
            'product-draft',
          ),
        ),
      );
    });

    it('denies public read of published product without ecommerce feature', async () => {
      await seedTenant(testEnv, {
        companyId: 'company-no-ecommerce',
        siteId,
        members: [{ uid: 'viewer-no-ecom', role: 'viewer' }],
        featureIds: ['crm'],
        withProducts: true,
      });

      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(
        getDoc(
          doc(
            db,
            'companies',
            'company-no-ecommerce',
            'sites',
            siteId,
            'products',
            'product-published',
          ),
        ),
      );
    });
  });
});
