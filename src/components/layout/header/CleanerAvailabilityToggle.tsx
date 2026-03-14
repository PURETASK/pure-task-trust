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
  const { profile } = useCleanerProfile();
  const queryClient = useQueryClient();
  const [toggling, setToggling] = useState(false);
  const isAvailable = profile?.is_available ?? false;

  const handleToggle = async () => {
    if (!profile?.id) return;
    setToggling(true);
    try {
      const { error } = await supabase
        .from("cleaner_profiles")
        .update({ is_available: !isAvailable })
        .eq("id", profile.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["cleaner-profile"] });
      toast.success(
        !isAvailable
          ? "You're now online — clients can book you!"
          : "You're now offline — no new bookings."
      );
    } catch {
      toast.error("Failed to update availability");
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={toggling || !profile}
      className={cn(
        "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all",
        isAvailable
          ? "bg-success/10 border-success/30 text-success hover:bg-success/20 shadow-sm"
          : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
      )}
    >
      {toggling ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            isAvailable ? "bg-success animate-pulse" : "bg-muted-foreground"
          )}
        />
      )}
      {isAvailable ? "Online" : "Offline"}
    </button>
  );
}
