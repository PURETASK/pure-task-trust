import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CleanerServiceArea {
  id: string;
  cleaner_id: string;
  zip_code: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_miles: number | null;
  created_at: string;
}

export interface City {
  id: number;
  name: string;
  state_region: string | null;
  country_code: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
}

export interface PlatformServiceArea {
  id: number;
  city_id: number;
  name: string;
  zip_codes: string[];
  base_multiplier: number;
  is_active: boolean;
  created_at: string;
  city?: City;
}

export function useCleanerServiceAreas() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const fetchCleanerProfile = async () => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("cleaner_profiles")
      .select("id, travel_radius_km")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const getCleanerProfileOrThrow = async () => {
    const profile = await fetchCleanerProfile();

    if (!profile?.id) {
      throw new Error("Cleaner profile not found");
    }

    return profile;
  };

  const cleanerProfileQuery = useQuery({
    queryKey: ["cleaner-profile", user?.id],
    queryFn: fetchCleanerProfile,
    enabled: !!user?.id && !authLoading,
  });

  const cleanerProfile = cleanerProfileQuery.data;
  const cleanerId = cleanerProfile?.id;

  const serviceAreasQuery = useQuery({
    queryKey: ["cleaner-service-areas", cleanerId],
    queryFn: async () => {
      if (!cleanerId) return [];
      const { data, error } = await supabase
        .from("cleaner_service_areas")
        .select("*")
        .eq("cleaner_id", cleanerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CleanerServiceArea[];
    },
    enabled: !!cleanerId && !cleanerProfileQuery.isLoading,
  });

  const addServiceArea = useMutation({
    mutationFn: async (input: Omit<CleanerServiceArea, "id" | "cleaner_id" | "created_at">) => {
      const profile = cleanerProfile?.id ? cleanerProfile : await getCleanerProfileOrThrow();

      const { data, error } = await supabase
        .from("cleaner_service_areas")
        .insert({ ...input, cleaner_id: profile.id })
        .select()
        .single();
      if (error) throw error;

      if (input.latitude != null && input.longitude != null) {
        const { error: profileError } = await supabase
          .from("cleaner_profiles")
          .update({ latitude: input.latitude, longitude: input.longitude })
          .eq("id", profile.id);

        if (profileError) throw profileError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cleaner-service-areas"] });
      queryClient.invalidateQueries({ queryKey: ["cleaner-profile", user?.id] });
      toast.success("Service area added");
    },
    onError: (error) => {
      toast.error("Failed to add service area: " + error.message);
    },
  });

  const removeServiceArea = useMutation({
    mutationFn: async (areaId: string) => {
      const { error } = await supabase.from("cleaner_service_areas").delete().eq("id", areaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cleaner-service-areas"] });
      toast.success("Service area removed");
    },
    onError: (error) => {
      toast.error("Failed to remove service area: " + error.message);
    },
  });

  const updateTravelRadius = useMutation({
    mutationFn: async (radiusKm: number) => {
      const profile = cleanerProfile?.id ? cleanerProfile : await getCleanerProfileOrThrow();

      const { error } = await supabase
        .from("cleaner_profiles")
        .update({ travel_radius_km: radiusKm })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cleaner-profile", user?.id] });
      toast.success("Travel radius updated");
    },
    onError: (error) => {
      toast.error("Failed to update travel radius: " + error.message);
    },
  });

  return {
    serviceAreas: serviceAreasQuery.data ?? [],
    isLoading: authLoading || cleanerProfileQuery.isLoading || serviceAreasQuery.isLoading,
    travelRadius: cleanerProfile?.travel_radius_km,
    addServiceArea,
    removeServiceArea,
    updateTravelRadius,
  };
}

// Platform-level service areas (for admin/discovery)
export function usePlatformServiceAreas() {
  const { data: areas = [], isLoading } = useQuery({
    queryKey: ["platform-service-areas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_service_areas")
        .select(`
          *,
          city:cities(*)
        `)
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as (PlatformServiceArea & { city: City })[];
    },
  });

  return { areas, isLoading };
}

export function useCities() {
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as City[];
    },
  });

  return { cities, isLoading };
}
