import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type CleanerProfile = Database["public"]["Tables"]["cleaner_profiles"]["Row"];

/**
 * Always-On availability indicator for cleaners.
 * Cleaners stay online at all times — if the profile is somehow offline,
 * we silently flip it back to available.
 */
export function CleanerAvailabilityToggle() {
  const { profile, isLoading } = useCleanerProfile();
  const queryClient = useQueryClient();
  const showLoading = isLoading && !profile;

  // Auto-restore to online if the cleaner profile is offline.
  useEffect(() => {
    if (!profile?.id || profile.is_available) return;
    (async () => {
      const { error } = await supabase
        .rpc("set_my_cleaner_availability", { _is_available: true });
      if (error) return;
      const cleanerProfileQueryKey = ["cleaner-profile", profile.user_id] as const;
      queryClient.setQueryData<CleanerProfile | null>(cleanerProfileQueryKey, (old) =>
        old ? { ...old, is_available: true } : old
      );
    })();
  }, [profile?.id, profile?.is_available, profile?.user_id, queryClient]);

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold",
        showLoading
          ? "bg-muted border-border text-muted-foreground"
          : "bg-success/10 border-success/30 text-success shadow-sm"
      )}
    >
      {showLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <span className="h-2 w-2 rounded-full flex-shrink-0 bg-success animate-pulse" />
      )}
      <span className="hidden xs:inline">{showLoading ? "Loading" : "Online"}</span>
    </div>
  );
}
