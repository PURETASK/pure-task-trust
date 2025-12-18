import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/ui/page-skeleton';

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    // Redirect to auth page, preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role if specified
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

// Convenience wrappers for role-specific routes
export function RequireClient({ children }: { children: ReactNode }) {
  return <RequireAuth allowedRoles={['client']}>{children}</RequireAuth>;
}

export function RequireCleaner({ children }: { children: ReactNode }) {
  return <RequireAuth allowedRoles={['cleaner']}>{children}</RequireAuth>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  return <RequireAuth allowedRoles={['admin']}>{children}</RequireAuth>;
}

export function RequireClientOrCleaner({ children }: { children: ReactNode }) {
  return <RequireAuth allowedRoles={['client', 'cleaner']}>{children}</RequireAuth>;
}
