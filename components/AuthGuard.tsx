// src/components/AuthGuard.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/auth';

type AuthGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode; // shown while checking auth
  redirectTo?: string;
};

export default function AuthGuard({ children, fallback = <div>Loading…</div>, redirectTo = '/login' }: AuthGuardProps) {
  const { data: user, isLoading } = useMe();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [isLoading, user, router, redirectTo]);

  if (isLoading) return <>{fallback}</>;
  if (!user) return null; // redirecting
  return <>{children}</>;
}
