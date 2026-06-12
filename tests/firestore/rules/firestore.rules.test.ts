import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

import {
  cleanupRulesTestEnvironment,
  getRulesTestEnvironment,
} from '../setup';

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
  });
});
