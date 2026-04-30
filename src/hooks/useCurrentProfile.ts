/**
 * useCurrentProfile — Phase C primitive (Refactor Wave 3, Data/Auth hardening).
 *
 * Single source of truth for "who is the logged-in user, what role do they have,
 * and what is their client_profiles.id / cleaner_profiles.id?". Every per-user
 * page and mutation should use this instead of re-querying user_roles +
 * client_profiles + cleaner_profiles by hand.
 *
 * Two flavours:
 *   - useCurrentProfile()       — hook (renders, returns data + loading state)
 *   - getCurrentProfileIds(uid) — async helper, safe to call inside useMutation
 *                                 callbacks where you can't call hooks. Cached
 *                                 against the same TanStack Query as the hook,
 *                                 so a mutation gets the same identity the UI
 *                                 sees without an extra round-trip when warm.
 *
 * NEVER call `supabase.from('client_profiles').select('id').eq('user_id', …)`
 * or the cleaner equivalent in a component or hook. Use this primitive.
 * See docs/REFACTOR_WAVE_1_2_AUDIT.md (and the upcoming Wave 3 entry).
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, type UserRole } from '@/contexts/AuthContext';

export interface CurrentProfileSnapshot {
  userId: string | null;
  role: UserRole | null;
  clientProfileId: string | null;
  cleanerProfileId: string | null;
}

const EMPTY: CurrentProfileSnapshot = {
  userId: null,
  role: null,
  clientProfileId: null,
  cleanerProfileId: null,
};

const queryKey = (userId: string | null | undefined) =>
  ['currentProfile', userId ?? null] as const;

async function fetchCurrentProfile(userId: string): Promise<CurrentProfileSnapshot> {
  // Resolve role + both profile ids in parallel; caller decides which to use.
  // Both .maybeSingle() so an admin (no client/cleaner profile) is a clean null.
  const [{ data: roleRow }, { data: clientRow }, { data: cleanerRow }] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
    supabase.from('client_profiles').select('id').eq('user_id', userId).maybeSingle(),
    supabase.from('cleaner_profiles').select('id').eq('user_id', userId).maybeSingle(),
  ]);

  return {
    userId,
    role: (roleRow?.role as UserRole | undefined) ?? null,
    clientProfileId: clientRow?.id ?? null,
    cleanerProfileId: cleanerRow?.id ?? null,
  };
}

export function useCurrentProfile() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const { data, isLoading, error } = useQuery({
    queryKey: queryKey(userId),
    queryFn: () => fetchCurrentProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 min — role/profile-id is very stable
  });

  return {
    ...(data ?? EMPTY),
    userId,
    isLoading,
    error,
  };
}

/**
 * Imperative variant for use inside useMutation callbacks (where you can't
 * call hooks). Reads from the TanStack Query cache when warm, otherwise
 * fetches and seeds the cache so the next render is instant.
 *
 * Pass the queryClient from `useQueryClient()` and the current `user.id`.
 */
export async function getCurrentProfileIds(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
): Promise<CurrentProfileSnapshot> {
  return queryClient.fetchQuery({
    queryKey: queryKey(userId),
    queryFn: () => fetchCurrentProfile(userId),
    staleTime: 1000 * 60 * 5,
  });
}