import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface JobCheckin {
  id: string;
  job_id: string;
  cleaner_id: string;
  type: 'check_in' | 'check_out';
  lat: number | null;
  lng: number | null;
  is_within_radius: boolean | null;
  distance_from_job_meters: number | null;
  device_info: Record<string, unknown> | null;
  created_at: string;
}

export interface GPSLocation {
  lat: number;
  lng: number;
}

const CHECKIN_RADIUS_METERS = 200; // Must be within 200m of job location

function calculateDistance(
  lat1: number, lng1: number, 
  lat2: number, lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export function useJobCheckins(jobId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch check-ins for a specific job
  const { data: checkins, isLoading } = useQuery({
    queryKey: ['job-checkins', jobId],
    queryFn: async () => {
      if (!jobId) return [];

      const { data, error } = await supabase
        .from('job_checkins')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as JobCheckin[];
    },
    enabled: !!jobId,
  });

  // Get current location
  const getCurrentLocation = (): Promise<GPSLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Perform GPS check-in
  const checkIn = useMutation({
    mutationFn: async ({ 
      jobId, 
      jobLat, 
      jobLng 
    }: { 
      jobId: string; 
      jobLat: number; 
      jobLng: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Get cleaner profile
      const { data: profile } = await supabase
        .from('cleaner_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Cleaner profile not found');

      // Get current GPS location
      const location = await getCurrentLocation();
      
      // Calculate distance from job
      const distance = calculateDistance(
        location.lat, location.lng,
        jobLat, jobLng
      );

      const isWithinRadius = distance <= CHECKIN_RADIUS_METERS;

      // Record check-in
      const { data, error } = await supabase
        .from('job_checkins')
        .insert({
          job_id: jobId,
          cleaner_id: profile.id,
          type: 'check_in',
          lat: location.lat,
          lng: location.lng,
          is_within_radius: isWithinRadius,
          distance_from_job_meters: Math.round(distance),
          device_info: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Update job with check-in time
      await supabase
        .from('jobs')
        .update({
          check_in_at: new Date().toISOString(),
          check_in_lat: location.lat,
          check_in_lng: location.lng,
          actual_start_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      return { checkin: data, isWithinRadius, distance };
    },
    onSuccess: ({ isWithinRadius, distance }) => {
      queryClient.invalidateQueries({ queryKey: ['job-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      if (isWithinRadius) {
        toast.success('GPS check-in successful!');
      } else {
        toast.warning(`Check-in recorded but you're ${Math.round(distance)}m from the job location`);
      }
    },
    onError: (error) => {
      if (error instanceof GeolocationPositionError) {
        toast.error('Unable to get your location. Please enable GPS.');
      } else {
        toast.error('Failed to check in');
      }
      console.error(error);
    },
  });

  // Perform GPS check-out
  const checkOut = useMutation({
    mutationFn: async ({ 
      jobId, 
      jobLat, 
      jobLng 
    }: { 
      jobId: string; 
      jobLat: number; 
      jobLng: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('cleaner_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Cleaner profile not found');

      const location = await getCurrentLocation();
      const distance = calculateDistance(
        location.lat, location.lng,
        jobLat, jobLng
      );

      const isWithinRadius = distance <= CHECKIN_RADIUS_METERS;

      const { data, error } = await supabase
        .from('job_checkins')
        .insert({
          job_id: jobId,
          cleaner_id: profile.id,
          type: 'check_out',
          lat: location.lat,
          lng: location.lng,
          is_within_radius: isWithinRadius,
          distance_from_job_meters: Math.round(distance),
          device_info: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Update job with check-out time
      await supabase
        .from('jobs')
        .update({
          check_out_at: new Date().toISOString(),
          check_out_lat: location.lat,
          check_out_lng: location.lng,
          actual_end_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      return { checkin: data, isWithinRadius, distance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('GPS check-out successful!');
    },
    onError: (error) => {
      toast.error('Failed to check out');
      console.error(error);
    },
  });

  const hasCheckedIn = checkins?.some(c => c.type === 'check_in');
  const hasCheckedOut = checkins?.some(c => c.type === 'check_out');

  return {
    checkins,
    isLoading,
    checkIn,
    checkOut,
    hasCheckedIn,
    hasCheckedOut,
    getCurrentLocation,
  };
}
