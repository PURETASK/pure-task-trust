import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireRole?: boolean;
}

// Simple inline loading state to avoid circular dependencies
function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pt-8 pb-12">
        <div className="container max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  );
}

export function RequireAuth({ children, allowedRoles, requireRole = true }: RequireAuthProps) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { needsRoleSelection, needsOnboarding, role } = useUserProfile();
  const location = useLocation();

  // Only block on the initial auth check — never block once we know the auth state
  if (authLoading) {
    return <AuthLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Never redirect away from onboarding mid-flow
  if (location.pathname === '/cleaner/onboarding') {
    return <>{children}</>;
  }

  // Use role from AuthContext (set immediately after login), fall back to profile query role
  const effectiveRole = user?.role ?? role;

  // Check if user needs to select a role (only when we know they don't have one)
  const hasNoRole = requireRole && !effectiveRole && needsRoleSelection;
  if (hasNoRole && location.pathname !== '/role-selection') {
    return <Navigate to="/role-selection" state={{ from: location }} replace />;
  }

  // Check if cleaner needs to complete onboarding — ONLY redirect brand-new cleaners
  if (requireRole && effectiveRole === 'cleaner' && needsOnboarding && 
      location.pathname !== '/cleaner/onboarding' && 
      location.pathname !== '/role-selection') {
    return <Navigate to="/cleaner/onboarding" replace />;
  }

  // Check role if specified — use effectiveRole so cleaners/admins get correct redirects
  if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole)) {
    const redirectPath = effectiveRole === 'cleaner' ? '/cleaner/dashboard' : effectiveRole === 'admin' ? '/admin/hub' : '/dashboard';
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
