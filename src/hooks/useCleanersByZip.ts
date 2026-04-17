import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CleanerListing } from "@/hooks/useCleaners";

export type MatchType = "zip" | "radius";

export interface CleanerMatch extends CleanerListing {
  matchType: MatchType;
  distanceMiles?: number;
}

interface Args {
  zip: string | null;
  lat: number | null;
  lng: number | null;
  searchQuery?: string;
  minRating?: number;
  maxRate?: number;
  onlyAvailable?: boolean;
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function getServicesFromTier(tier: string): string[] {
  const base = ["Standard Clean"];
  switch (tier) {
    case "gold":
      return [...base, "Deep Clean", "Move-out", "Eco-friendly"];
    case "silver":
      return [...base, "Deep Clean", "Move-out"];
    default:
      return base;
  }
}

export function useCleanersByZip({
  zip,
  lat,
  lng,
  searchQuery = "",
  minRating,
  maxRate,
  onlyAvailable,
}: Args) {
  return useQuery({
    queryKey: ["cleaners-by-zip", zip, lat, lng, searchQuery, minRating, maxRate, onlyAvailable],
    enabled: !!zip,
    staleTime: 1000 * 60 * 2,
    queryFn: async (): Promise<CleanerMatch[]> => {
      if (!zip) return [];

      // Fetch service areas (we'll filter client-side for distance)
      const { data: areas, error: areasErr } = await supabase
        .from("cleaner_service_areas")
        .select("cleaner_id, zip_code, latitude, longitude, radius_miles");
      if (areasErr) throw areasErr;

      const matchesByCleaner = new Map<string, { matchType: MatchType; distanceMiles?: number }>();
      for (const a of areas ?? []) {
        if (!a.cleaner_id) continue;
        // Exact ZIP match wins
        if (a.zip_code && a.zip_code === zip) {
          matchesByCleaner.set(a.cleaner_id, { matchType: "zip", distanceMiles: 0 });
          continue;
        }
        // Radius match (only if we already have client lat/lng)
        if (lat != null && lng != null && a.latitude != null && a.longitude != null) {
          const dist = haversineMiles(lat, lng, a.latitude, a.longitude);
          const radius = a.radius_miles ?? 15;
          if (dist <= radius) {
            const existing = matchesByCleaner.get(a.cleaner_id);
            if (!existing || (existing.distanceMiles ?? Infinity) > dist) {
              matchesByCleaner.set(a.cleaner_id, { matchType: "radius", distanceMiles: dist });
            }
          }
        }
      }

      const cleanerIds = Array.from(matchesByCleaner.keys());
      if (cleanerIds.length === 0) return [];

      let query = supabase
        .from("cleaner_public_profiles")
        .select(
          `id, user_id, first_name, last_name, bio, professional_headline,
           profile_photo_url, hourly_rate_credits, avg_rating, reliability_score,
           jobs_completed, travel_radius_km, is_available, tier`
        )
        .in("id", cleanerIds);

      if (onlyAvailable) query = query.eq("is_available", true);
      if (minRating) query = query.gte("avg_rating", minRating);
      if (maxRate) query = query.lte("hourly_rate_credits", maxRate);

      const { data, error } = await query;
      if (error) throw error;

      let cleaners: CleanerMatch[] = (data ?? []).map((c) => {
        const firstName = c.first_name || "";
        const lastName = c.last_name || "";
        const name = `${firstName} ${lastName}`.trim() || "Unnamed Cleaner";
        const match = matchesByCleaner.get(c.id!) ?? { matchType: "radius" as MatchType };
        return {
          id: c.id!,
          userId: c.user_id!,
          firstName: c.first_name,
          lastName: c.last_name,
          name,
          bio: c.bio,
          hourlyRate: c.hourly_rate_credits || 35,
          avgRating: c.avg_rating,
          reliabilityScore: c.reliability_score || 100,
          jobsCompleted: c.jobs_completed || 0,
          travelRadius: c.travel_radius_km,
          isAvailable: c.is_available ?? true,
          tier: c.tier || "standard",
          backgroundCheckStatus: null,
          verified: false,
          profilePhotoUrl: c.profile_photo_url,
          professionalHeadline: c.professional_headline,
          services: getServicesFromTier(c.tier || "standard"),
          distance:
            match.distanceMiles != null
              ? `${match.distanceMiles.toFixed(1)} mi away`
              : "Serves your ZIP",
          matchType: match.matchType,
          distanceMiles: match.distanceMiles,
        };
      });

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        cleaners = cleaners.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.bio?.toLowerCase().includes(q) ||
            c.services.some((s) => s.toLowerCase().includes(q))
        );
      }

      // Sort: exact ZIP first, then distance asc, then rating desc
      cleaners.sort((a, b) => {
        if (a.matchType !== b.matchType) return a.matchType === "zip" ? -1 : 1;
        const da = a.distanceMiles ?? Infinity;
        const db = b.distanceMiles ?? Infinity;
        if (da !== db) return da - db;
        return (b.avgRating ?? 0) - (a.avgRating ?? 0);
      });

      return cleaners;
    },
  });
}
