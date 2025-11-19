// src/components/AuthGuard.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/auth';
import { toast } from 'sonner';

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
      toast.error('You need to be logged in to access this page.');
      const timer = setTimeout(() => {
        router.push(redirectTo);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [isLoading, user, router, redirectTo]);

  if (isLoading) return <>{fallback}</>;
  if (!user) return null; // redirecting
  return <>{children}</>;
}
