// components/AuthGuard.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Adjust path
import React, { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Component to protect a route, redirecting unauthenticated users to /login.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isAuthReady } = useAuth();

  useEffect(() => {
    // Only execute client-side logic after the hook is ready
    if (isAuthReady && !isAuthenticated) {
      // Redirect unauthenticated users to the login page
      router.replace('/login');
    }
  }, [isAuthenticated, isAuthReady, router]);

  // If the hook is not ready (still checking localStorage) or 
  // the user is not authenticated (and redirection is pending), show a loading state.
  if (!isAuthReady || !isAuthenticated) {
    // Optional: Return a loading spinner or an empty div
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // If authenticated, render the children (the actual page content)
  return <>{children}</>;
};