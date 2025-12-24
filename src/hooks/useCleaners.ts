import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CleanerListing {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  name: string;
  bio: string | null;
  hourlyRate: number;
  avgRating: number | null;
  reliabilityScore: number;
  jobsCompleted: number;
  travelRadius: number | null;
  isAvailable: boolean;
  tier: string;
  backgroundCheckStatus: string | null;
  verified: boolean;
  // Computed fields
  services: string[];
  distance?: string;
  image?: string;
}

interface UseCleanersOptions {
  searchQuery?: string;
  minRating?: number;
  maxRate?: number;
  minRate?: number;
  onlyAvailable?: boolean;
  onlyVerified?: boolean;
}

export function useCleaners(options: UseCleanersOptions = {}) {
  const { 
    searchQuery = '', 
    minRating, 
    maxRate, 
    minRate,
    onlyAvailable = false,
    onlyVerified = false,
  } = options;

  return useQuery({
    queryKey: ['cleaners', options],
    queryFn: async (): Promise<CleanerListing[]> => {
      let query = supabase
        .from('cleaner_profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          bio,
          hourly_rate_credits,
          avg_rating,
          reliability_score,
          jobs_completed,
          travel_radius_km,
          is_available,
          tier,
          background_check_status
        `)
        .order('avg_rating', { ascending: false, nullsFirst: false });

      // Apply filters
      if (onlyAvailable) {
        query = query.eq('is_available', true);
      }

      if (minRating) {
        query = query.gte('avg_rating', minRating);
      }

      if (maxRate) {
        query = query.lte('hourly_rate_credits', maxRate);
      }

      if (minRate) {
        query = query.gte('hourly_rate_credits', minRate);
      }

      if (onlyVerified) {
        query = query.eq('background_check_status', 'completed');
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match the CleanerListing interface
      let cleaners: CleanerListing[] = (data || []).map((cleaner) => {
        const firstName = cleaner.first_name || '';
        const lastName = cleaner.last_name || '';
        const name = `${firstName} ${lastName}`.trim() || 'Unnamed Cleaner';
        
        return {
          id: cleaner.id,
          userId: cleaner.user_id,
          firstName: cleaner.first_name,
          lastName: cleaner.last_name,
          name,
          bio: cleaner.bio,
          hourlyRate: cleaner.hourly_rate_credits || 35,
          avgRating: cleaner.avg_rating,
          reliabilityScore: cleaner.reliability_score || 100,
          jobsCompleted: cleaner.jobs_completed || 0,
          travelRadius: cleaner.travel_radius_km,
          isAvailable: cleaner.is_available ?? true,
          tier: cleaner.tier || 'standard',
          backgroundCheckStatus: cleaner.background_check_status,
          verified: cleaner.background_check_status === 'completed',
          services: getServicesFromTier(cleaner.tier || 'standard'),
          distance: cleaner.travel_radius_km ? `${cleaner.travel_radius_km} km radius` : undefined,
        };
      });

      // Client-side search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        cleaners = cleaners.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.bio?.toLowerCase().includes(query) ||
            c.services.some((s) => s.toLowerCase().includes(query))
        );
      }

      return cleaners;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Helper to derive services from tier (can be enhanced with cleaner_preferences later)
function getServicesFromTier(tier: string): string[] {
  const baseServices = ['Standard Clean'];
  
  switch (tier) {
    case 'gold':
      return [...baseServices, 'Deep Clean', 'Move-out', 'Eco-friendly'];
    case 'silver':
      return [...baseServices, 'Deep Clean', 'Move-out'];
    default:
      return baseServices;
  }
}

export function useCleaner(cleanerId: string) {
  return useQuery({
    queryKey: ['cleaner', cleanerId],
    queryFn: async (): Promise<CleanerListing | null> => {
      const { data, error } = await supabase
        .from('cleaner_profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          bio,
          hourly_rate_credits,
          avg_rating,
          reliability_score,
          jobs_completed,
          travel_radius_km,
          is_available,
          tier,
          background_check_status
        `)
        .eq('id', cleanerId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      const name = `${firstName} ${lastName}`.trim() || 'Unnamed Cleaner';

      return {
        id: data.id,
        userId: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        name,
        bio: data.bio,
        hourlyRate: data.hourly_rate_credits || 35,
        avgRating: data.avg_rating,
        reliabilityScore: data.reliability_score || 100,
        jobsCompleted: data.jobs_completed || 0,
        travelRadius: data.travel_radius_km,
        isAvailable: data.is_available ?? true,
        tier: data.tier || 'standard',
        backgroundCheckStatus: data.background_check_status,
        verified: data.background_check_status === 'completed',
        services: getServicesFromTier(data.tier || 'standard'),
        distance: data.travel_radius_km ? `${data.travel_radius_km} km radius` : undefined,
      };
    },
    enabled: !!cleanerId,
  });
}
