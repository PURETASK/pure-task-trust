import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { useDevBypass } from '@/hooks/useDevBypass';

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireRole?: boolean;
}

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
  const { active: devBypass, state: devState } = useDevBypass();

  // Step 1: Wait for the auth session to be resolved
  if (authLoading) {
    return <AuthLoadingSkeleton />;
  }

  // Step 2: Not logged in → send to /auth (dev bypass cannot fake a session)
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Step 3: Never interrupt the onboarding flow
  if (location.pathname === '/cleaner/onboarding') {
    return <>{children}</>;
  }

  // Step 4: Determine effective role — dev override > AuthContext > profile query
  const effectiveRole =
    (devBypass && devState.roleOverride) || user?.role || role;

  // Step 5: If we don't have a role from AuthContext yet AND profile is still loading,
  // show skeleton briefly rather than making a wrong redirect decision
  if (!effectiveRole && profileLoading && requireRole && !devBypass) {
    return <AuthLoadingSkeleton />;
  }

  // Step 6: Role-based redirect decisions (only when we have settled state)
  if (
    requireRole &&
    !effectiveRole &&
    needsRoleSelection &&
    location.pathname !== '/role-selection' &&
    !(devBypass && devState.skipRoleSelection)
  ) {
    return <Navigate to="/role-selection" state={{ from: location }} replace />;
  }

  // Step 7: New cleaner needs onboarding
  if (
    requireRole &&
    effectiveRole === 'cleaner' &&
    needsOnboarding &&
    location.pathname !== '/cleaner/onboarding' &&
    location.pathname !== '/role-selection' &&
    !(devBypass && devState.skipOnboarding)
  ) {
    return <Navigate to="/cleaner/onboarding" replace />;
  }

  // Step 8: Wrong role for this route → redirect to their home
  if (
    allowedRoles &&
    effectiveRole &&
    !allowedRoles.includes(effectiveRole) &&
    !(devBypass && devState.skipRoleGuard)
  ) {
    const redirectPath =
      effectiveRole === 'cleaner' ? '/cleaner/dashboard' :
      effectiveRole === 'admin' ? '/admin/hub' :
      '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

// Convenience wrappers
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
