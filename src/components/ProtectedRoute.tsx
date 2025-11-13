import { useAuth } from '../lib/auth';
import { useEffect, ReactNode, useRef } from 'react';
import { useLocation } from 'wouter';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const attemptedRedirect = useRef(false);
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  useEffect(() => {
    // Only redirect if auth finished loading AND no user AND no token to recover.
    if (!isLoading && !user && !hasToken && !attemptedRedirect.current) {
      attemptedRedirect.current = true;
      setLocation('/login');
    }
  }, [user, isLoading, hasToken, setLocation]);

  // While loading, or while we have a token but haven't hydrated user yet, show a spinner.
  if (isLoading || (!user && hasToken)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return user ? <>{children}</> : null;
}