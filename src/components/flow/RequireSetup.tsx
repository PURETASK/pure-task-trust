import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevBypass } from "@/hooks/useDevBypass";

/**
 * Gates booking-related routes behind first-time profile setup completion.
 * Clients without a completed setup are redirected to /setup.
 */
export function RequireSetup({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const { active: devBypass, state: devState } = useDevBypass();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("client_profiles")
        .select("setup_completed_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setDone(!!data?.setup_completed_at);
      setChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoading || (user && !checked)) {
    return (
      <div className="min-h-[60vh] grid place-items-center p-6">
        <Skeleton className="h-32 w-full max-w-md" />
      </div>
    );
  }

  if (user && !done && !(devBypass && devState.skipSetup)) {
    return <Navigate to="/setup" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
