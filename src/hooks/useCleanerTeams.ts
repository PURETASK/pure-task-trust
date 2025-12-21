import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CleanerTeam {
  id: number;
  name: string;
  description: string | null;
  owner_cleaner_id: string;
  max_members: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCleanerTeams() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cleanerProfile } = useQuery({
    queryKey: ["cleaner-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("cleaner_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const cleanerId = cleanerProfile?.id;

  // Get teams I own
  const { data: ownedTeams = [], isLoading: loadingOwned } = useQuery({
    queryKey: ["owned-teams", cleanerId],
    queryFn: async () => {
      if (!cleanerId) return [];
      const { data, error } = await supabase
        .from("cleaner_teams")
        .select("*")
        .eq("owner_cleaner_id", cleanerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CleanerTeam[];
    },
    enabled: !!cleanerId,
  });

  const createTeam = useMutation({
    mutationFn: async (input: { name: string; description?: string; max_members?: number }) => {
      if (!cleanerId) throw new Error("No cleaner profile");
      const { data, error } = await supabase
        .from("cleaner_teams")
        .insert({ ...input, owner_cleaner_id: cleanerId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owned-teams", cleanerId] });
      toast.success("Team created");
    },
    onError: (error) => {
      toast.error("Failed to create team: " + error.message);
    },
  });

  const updateTeam = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CleanerTeam> & { id: number }) => {
      const { data, error } = await supabase
        .from("cleaner_teams")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owned-teams", cleanerId] });
      toast.success("Team updated");
    },
    onError: (error) => {
      toast.error("Failed to update team: " + error.message);
    },
  });

  const deleteTeam = useMutation({
    mutationFn: async (teamId: number) => {
      const { error } = await supabase.from("cleaner_teams").delete().eq("id", teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owned-teams", cleanerId] });
      toast.success("Team deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete team: " + error.message);
    },
  });

  return {
    ownedTeams,
    isLoading: loadingOwned,
    createTeam,
    updateTeam,
    deleteTeam,
    cleanerId,
  };
}

// Get team by ID
export function useTeam(teamId: number | null) {
  const { data: team, isLoading } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      if (!teamId) return null;
      const { data, error } = await supabase
        .from("cleaner_teams")
        .select("*")
        .eq("id", teamId)
        .single();
      if (error) throw error;
      return data as CleanerTeam;
    },
    enabled: !!teamId,
  });

  return { team, isLoading };
}
