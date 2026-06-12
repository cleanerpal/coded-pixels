'use client';

import {
  getAuth,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

import { getFirebaseApp } from '@/lib/firebase';
import { MOCK_USER } from '@/lib/mock-data';

export interface AuthState {
  user: User | null;
  loading: boolean;
  isMock: boolean;
}

function useMockAuth(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true' ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY === undefined ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-api-key'
  );
}

/**
 * Auth gate hook — real Firebase Auth with mock fallback for local dev.
 * Aligned with Dr. Fatima Al-Sayed on post-Stripe auth structure.
 */
export function useAuth(): AuthState {
  const isMock = useMockAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMock) {
      setUser({
        uid: 'mock-owner-uid',
        email: MOCK_USER.email,
        displayName: MOCK_USER.displayName,
      } as User);
      setLoading(false);
      return;
    }

    const auth = getAuth(getFirebaseApp());
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [isMock]);

  return { user, loading, isMock };
}
