// hooks/useAuth.ts

import { useState, useEffect } from 'react';

// NOTE: We rely on the fact that authClient.saveToken uses the 'token' key
const getAuthStatus = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // Not authenticated on the server
  }
  try {
    return !!localStorage.getItem('token');
  } catch {
    return false;
  }
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Only runs on the client side after component mounts
    setIsAuthenticated(getAuthStatus());
    setIsAuthReady(true);
  }, []);

  // You can extend this to return user data, logout function, etc.
  return { isAuthenticated, isAuthReady };
};