import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TeamMember {
  id: string;
  team_id: number;
  cleaner_id: string;
  role: "member" | "lead";
  status: "active" | "pending" | "removed";
  joined_at: string;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  cleaner_profile: {
    first_name: string | null;
    last_name: string | null;
    user_id: string;
  } | null;
  background_check: {
    status: string;
    completed_at: string | null;
    expires_at: string | null;
  } | null;
}

export function useTeamMembers(teamId: number | null) {
  const queryClient = useQueryClient();

  // Fetch team members with their profiles and background checks
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      // Get team members
      const { data: memberData, error: memberError } = await supabase
        .from("team_members")
        .select(`
          id,
          team_id,
          cleaner_id,
          role,
          status,
          joined_at,
          invited_by,
          created_at,
          updated_at
        `)
        .eq("team_id", teamId)
        .neq("status", "removed")
        .order("joined_at", { ascending: true });
      
      if (memberError) throw memberError;
      if (!memberData || memberData.length === 0) return [];

      // Get cleaner profiles for these members
      const cleanerIds = memberData.map(m => m.cleaner_id);
      const { data: profiles, error: profileError } = await supabase
        .from("cleaner_profiles")
        .select("id, first_name, last_name, user_id")
        .in("id", cleanerIds);
      
      if (profileError) throw profileError;

      // Get background checks for these cleaners
      const { data: bgChecks, error: bgError } = await supabase
        .from("background_checks")
        .select("cleaner_id, status, completed_at, expires_at")
        .in("cleaner_id", cleanerIds)
        .order("created_at", { ascending: false });
      
      if (bgError) throw bgError;

      // Create lookup maps
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const bgCheckMap = new Map<string, typeof bgChecks[0]>();
      bgChecks?.forEach(check => {
        // Only keep the latest check per cleaner
        if (!bgCheckMap.has(check.cleaner_id)) {
          bgCheckMap.set(check.cleaner_id, check);
        }
      });

      // Combine data
      return memberData.map(member => ({
        ...member,
        cleaner_profile: profileMap.get(member.cleaner_id) || null,
        background_check: bgCheckMap.get(member.cleaner_id) || null,
      })) as TeamMember[];
    },
    enabled: !!teamId,
  });

  // Remove member from team
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("team_members")
        .update({ status: "removed", updated_at: new Date().toISOString() })
        .eq("id", memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      toast.success("Member removed from team");
    },
    onError: (error) => {
      toast.error("Failed to remove member: " + error.message);
    },
  });

  // Update member role
  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: "member" | "lead" }) => {
      const { error } = await supabase
        .from("team_members")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      toast.success("Member role updated");
    },
    onError: (error) => {
      toast.error("Failed to update role: " + error.message);
    },
  });

  // Get member count
  const memberCount = members.filter(m => m.status === "active").length;
  const pendingCount = members.filter(m => m.status === "pending").length;

  return {
    members,
    isLoading,
    memberCount,
    pendingCount,
    removeMember,
    updateMemberRole,
  };
}
