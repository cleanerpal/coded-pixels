'use client';

import type { ReactNode } from 'react';

import { useAuth } from '@/lib/auth/use-auth';

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        aria-busy="true"
        aria-label="Checking sign-in"
      >
        <p className="text-sm text-text-muted">Checking sign-in…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-xl font-bold text-text">Sign in required</h1>
          <p className="text-sm text-text-muted">
            Complete checkout with the same email you used at sign-up, then
            return to this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
