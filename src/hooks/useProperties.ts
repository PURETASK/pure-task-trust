import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Property {
  id: number;
  client_id: string;
  label: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_region: string | null;
  postal_code: string | null;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  has_pets: boolean | null;
  has_kids: boolean | null;
  notes: string | null;
  cleaning_score: number;
  last_basic_at: string | null;
  last_deep_at: string | null;
  last_moveout_at: string | null;
  service_area_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyInput {
  label: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state_region?: string | null;
  postal_code?: string | null;
  country_code?: string;
  latitude?: number | null;
  longitude?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  square_feet?: number | null;
  has_pets?: boolean | null;
  has_kids?: boolean | null;
  notes?: string | null;
}

export function useProperties() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clientProfile } = useQuery({
    queryKey: ["client-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const clientId = clientProfile?.id;

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
    enabled: !!clientId,
  });

  const addProperty = useMutation({
    mutationFn: async (input: PropertyInput) => {
      if (!clientId) throw new Error("No client profile");
      const { data, error } = await supabase
        .from("properties")
        .insert({ ...input, client_id: clientId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", clientId] });
      toast.success("Property added");
    },
    onError: (error) => {
      toast.error("Failed to add property: " + error.message);
    },
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PropertyInput> & { id: number }) => {
      const { data, error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", clientId] });
      toast.success("Property updated");
    },
    onError: (error) => {
      toast.error("Failed to update property: " + error.message);
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (propertyId: number) => {
      const { error } = await supabase.from("properties").delete().eq("id", propertyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", clientId] });
      toast.success("Property deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete property: " + error.message);
    },
  });

  return {
    properties,
    isLoading,
    addProperty,
    updateProperty,
    deleteProperty,
  };
}

export function useProperty(propertyId: number | null) {
  const { data: property, isLoading } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();
      if (error) throw error;
      return data as Property;
    },
    enabled: !!propertyId,
  });

  return { property, isLoading };
}
