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
  const { user, session } = useAuth();
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
        needsOnboarding = !clientProfile;
      } else if (role === 'cleaner') {
        const { data } = await supabase
          .from('cleaner_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        cleanerProfile = data;
        // Check if cleaner has completed onboarding
        needsOnboarding = !cleanerProfile || !cleanerProfile.onboarding_completed_at;
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
    enabled: !!user?.id && !!session,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to set user role and create profile
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
        throw new Error('Role already assigned');
      }

      // Insert role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: selectedRole });

      if (roleError) throw roleError;

      // Create corresponding profile
      if (selectedRole === 'client') {
        // Check if client profile exists
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
          if (profileError) throw profileError;

          // Create credit account
          const { error: creditError } = await supabase
            .from('credit_accounts')
            .insert({ user_id: user.id });
          if (creditError && !creditError.message.includes('duplicate')) {
            console.error('Credit account error:', creditError);
          }
        }
      } else if (selectedRole === 'cleaner') {
        // Check if cleaner profile exists
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
          if (profileError) throw profileError;
        }
      }

      return selectedRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
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
