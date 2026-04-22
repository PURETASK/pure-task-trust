import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Online/Offline availability toggle for cleaners, shown in the main header.
 */
export function CleanerAvailabilityToggle() {
  const { profile, isLoading } = useCleanerProfile();
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState(false);
  const isAvailable = profile?.is_available ?? false;
  const isBusy = toggling || isLoading;

  const handleToggle = async () => {
    if (!profile?.id) {
      toast.error("Cleaner profile not loaded yet");
      return;
    }
    const next = !isAvailable;
    setToggling(true);
    try {
      const { data, error } = await supabase
        .from("cleaner_profiles")
        .update({ is_available: next })
        .eq("id", profile.id)
        .select("id, is_available")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("No profile row updated (permission?)");

      // Optimistically update cache so the UI flips immediately.
      queryClient.setQueriesData({ queryKey: ["cleaner-profile"] }, (old: any) =>
        old ? { ...old, is_available: next } : old
      );
      await queryClient.invalidateQueries({ queryKey: ["cleaner-profile"] });

      toast.success(
        next
          ? "You're now online — clients can book you!"
          : "You're now offline — no new bookings."
      );
    } catch (err) {
      console.error("Availability toggle failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update availability"
      );
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isBusy || !profile}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95",
        isLoading
          ? "bg-muted border-border text-muted-foreground"
          : isAvailable
          ? "bg-success/10 border-success/30 text-success hover:bg-success/20 shadow-sm"
          : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
      )}
    >
      {isBusy ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <span
          className={cn(
            "h-2 w-2 rounded-full flex-shrink-0",
            isAvailable ? "bg-success animate-pulse" : "bg-muted-foreground"
          )}
        />
      )}
      <span className="hidden xs:inline">
        {isLoading ? "Loading" : isAvailable ? "Online" : "Offline"}
      </span>
    </button>
  );
}
