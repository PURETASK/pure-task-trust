import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string | null;
  author_location: string | null;
  quote: string;
  rating: number;
  avatar_url: string | null;
}

export function useFeaturedTestimonials() {
  return useQuery({
    queryKey: ["featured-testimonials"],
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase
        .from("featured_testimonials")
        .select("id, author_name, author_role, author_location, quote, rating, avatar_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching testimonials:", error);
        throw error;
      }

      return data ?? [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  });
}
