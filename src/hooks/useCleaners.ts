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
  profilePhotoUrl: string | null;
  professionalHeadline: string | null;
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
        .from('cleaner_public_profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          bio,
          professional_headline,
          profile_photo_url,
          hourly_rate_credits,
          avg_rating,
          reliability_score,
          jobs_completed,
          travel_radius_km,
          is_available,
          tier
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

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match the CleanerListing interface
      let cleaners: CleanerListing[] = (data || []).map((cleaner) => {
        const firstName = cleaner.first_name || '';
        const lastName = cleaner.last_name || '';
        const name = `${firstName} ${lastName}`.trim() || 'Unnamed Cleaner';
        
        return {
          id: cleaner.id!,
          userId: cleaner.user_id!,
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
          backgroundCheckStatus: null, // not exposed in public view
          verified: false, // not available in public view
          profilePhotoUrl: cleaner.profile_photo_url,
          professionalHeadline: cleaner.professional_headline,
          services: getServicesFromTier(cleaner.tier || 'standard'),
          distance: cleaner.travel_radius_km ? `${cleaner.travel_radius_km} km radius` : undefined,
        };
      });

      // Client-side search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        cleaners = cleaners.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.bio?.toLowerCase().includes(q) ||
            c.services.some((s) => s.toLowerCase().includes(q))
        );
      }

      // Client-side verified filter (not available in public view)
      // onlyVerified filter is a no-op on the public view since background_check_status isn't exposed

      return cleaners;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Helper to derive services from tier
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
      if (!cleanerId) return null;
      
      const { data, error } = await supabase
        .from('cleaner_public_profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          bio,
          professional_headline,
          profile_photo_url,
          hourly_rate_credits,
          avg_rating,
          reliability_score,
          jobs_completed,
          travel_radius_km,
          is_available,
          tier
        `)
        .eq('id', cleanerId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      const name = `${firstName} ${lastName}`.trim() || 'Unnamed Cleaner';

      return {
        id: data.id!,
        userId: data.user_id!,
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
        backgroundCheckStatus: null,
        verified: false,
        profilePhotoUrl: data.profile_photo_url,
        professionalHeadline: data.professional_headline,
        services: getServicesFromTier(data.tier || 'standard'),
        distance: data.travel_radius_km ? `${data.travel_radius_km} km radius` : undefined,
      };
    },
    enabled: !!cleanerId,
    staleTime: 1000 * 60 * 5,
  });
}
