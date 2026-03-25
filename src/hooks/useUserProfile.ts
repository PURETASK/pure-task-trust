import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type ClientProfile = Database['public']['Tables']['client_profiles']['Row'];
type CleanerProfile = Database['public']['Tables']['cleaner_profiles']['Row'];

interface UserProfileData {
  role: UserRole | null;
  hasRole: boolean;
  clientProfile: ClientProfile | null;
  cleanerProfile: CleanerProfile | null;
  needsRoleSelection: boolean;
  needsOnboarding: boolean;
}

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async (): Promise<UserProfileData> => {
      if (!user?.id) {
        return {
          role: null,
          hasRole: false,
          clientProfile: null,
          cleanerProfile: null,
          needsRoleSelection: true,
          needsOnboarding: false,
        };
      }

      // Fetch role from user_roles table
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      const role = roleData?.role as UserRole | null;

      if (!role) {
        return {
          role: null,
          hasRole: false,
          clientProfile: null,
          cleanerProfile: null,
          needsRoleSelection: true,
          needsOnboarding: false,
        };
      }

      // Fetch appropriate profile based on role
      let clientProfile: ClientProfile | null = null;
      let cleanerProfile: CleanerProfile | null = null;
      let needsOnboarding = false;

      if (role === 'client') {
        const { data } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        clientProfile = data;
        // Client profile is auto-created by DB trigger — never block on missing profile
        needsOnboarding = false;
      } else if (role === 'cleaner') {
        const { data } = await supabase
          .from('cleaner_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        cleanerProfile = data;
        // Only redirect to onboarding if:
        // 1. Profile exists AND onboarding not completed AND
        // 2. The profile was created very recently (within 10 minutes) — i.e. brand new signup
        // This prevents redirect loops for existing cleaners whose onboarding_completed_at may be null
        const isNewProfile = cleanerProfile?.created_at 
          ? (Date.now() - new Date(cleanerProfile.created_at).getTime()) < 10 * 60 * 1000
          : false;
        needsOnboarding = !!cleanerProfile && !cleanerProfile.onboarding_completed_at && isNewProfile;
      }

      return {
        role,
        hasRole: true,
        clientProfile,
        cleanerProfile,
        needsRoleSelection: false,
        needsOnboarding,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to set user role and create profile
  // NOTE: The handle_new_user DB trigger already creates the role and profiles on signup.
  // This mutation handles the case for OAuth users who land on /role-selection without
  // a role set (e.g. if the trigger didn't fire with the expected metadata).
  const setRoleMutation = useMutation({
    mutationFn: async (selectedRole: UserRole) => {
      if (!user?.id) throw new Error('No user logged in');

      // Check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingRole) {
        // Role already set (e.g., by trigger) — just return it
        return existingRole.role as UserRole;
      }

      // Insert role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: selectedRole });

      if (roleError) throw roleError;

      // Create corresponding profile only if it doesn't already exist
      if (selectedRole === 'client') {
        const { data: existingProfile } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('client_profiles')
            .insert({ 
              user_id: user.id,
              first_name: user.name || user.email?.split('@')[0],
            });
          if (profileError && !profileError.message.includes('duplicate')) throw profileError;
        }

        // Ensure credit account exists
        const { error: creditError } = await supabase
          .from('credit_accounts')
          .insert({ user_id: user.id });
        if (creditError && !creditError.message.includes('duplicate')) {
          console.warn('Credit account warning:', creditError);
        }
      } else if (selectedRole === 'cleaner') {
        const { data: existingProfile } = await supabase
          .from('cleaner_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('cleaner_profiles')
            .insert({ 
              user_id: user.id,
              first_name: user.name || user.email?.split('@')[0],
            });
          if (profileError && !profileError.message.includes('duplicate')) throw profileError;
        }
      }

      return selectedRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['cleaner-profile'] });
    },
  });

  return {
    role: profileData?.role ?? null,
    hasRole: profileData?.hasRole ?? false,
    clientProfile: profileData?.clientProfile ?? null,
    cleanerProfile: profileData?.cleanerProfile ?? null,
    needsRoleSelection: profileData?.needsRoleSelection ?? false,
    needsOnboarding: profileData?.needsOnboarding ?? false,
    isLoading,
    error,
    setRole: setRoleMutation.mutateAsync,
    isSettingRole: setRoleMutation.isPending,
  };
}
