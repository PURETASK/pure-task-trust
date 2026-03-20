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
  const { needsRoleSelection, needsOnboarding, role, isLoading: profileLoading } = useUserProfile();
  const location = useLocation();

  // While profile is (re)loading, keep showing the skeleton so we never
  // redirect away mid-mutation (e.g. during onboarding step saves).
  const isLoading = authLoading || (isAuthenticated && profileLoading);

  if (isLoading) {
    return <AuthLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    // Redirect to auth page, preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user needs to select a role (for OAuth users without role metadata)
  if (requireRole && needsRoleSelection && location.pathname !== '/role-selection') {
    return <Navigate to="/role-selection" state={{ from: location }} replace />;
  }

  // Check if cleaner needs to complete onboarding.
  // Only redirect TO onboarding — never redirect AWAY while already on it,
  // even during a brief moment when profileData is stale after a mutation.
  if (requireRole && role === 'cleaner' && needsOnboarding && 
      location.pathname !== '/cleaner/onboarding' && 
      location.pathname !== '/role-selection') {
    return <Navigate to="/cleaner/onboarding" replace />;
  }

  // If we're already on the onboarding page, never redirect away mid-flow.
  if (location.pathname === '/cleaner/onboarding') {
    return <>{children}</>;
  }

  // Check role if specified
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = user.role === 'cleaner' ? '/cleaner/dashboard' : user.role === 'admin' ? '/admin/hub' : '/dashboard';
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
