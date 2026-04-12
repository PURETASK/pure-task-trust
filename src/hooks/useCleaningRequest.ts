import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const STORAGE_KEY = "puretask_cleaning_request";

export interface CleaningRequestData {
  cleaning_type: "basic" | "deep" | "move_out" | "other";
  custom_description?: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  preferred_date?: string;
  preferred_time?: string;
  estimated_hours?: number;
  number_of_bedrooms?: number;
  number_of_bathrooms?: number;
  has_pets?: boolean;
  notes?: string;
}

/** Save request data to localStorage for pre-auth persistence */
export function saveRequestToLocal(data: CleaningRequestData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Read and clear stored request */
export function consumeStoredRequest(): CleaningRequestData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CleaningRequestData;
  } catch {
    return null;
  }
}

export function clearStoredRequest() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Hook: after login, check if there's a pending cleaning request in localStorage.
 * If so, persist it to the database and clear localStorage.
 */
export function useCleaningRequestSync() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const stored = consumeStoredRequest();
    if (!stored) return;

    const persist = async () => {
      const { error } = await supabase.from("cleaning_requests").insert({
        ...stored,
        user_id: user.id,
      });

      if (error) {
        console.error("Failed to save cleaning request:", error);
        // Put it back so we don't lose data
        saveRequestToLocal(stored);
      } else {
        clearStoredRequest();
        toast.success("Your cleaning request has been saved!");
      }
    };

    persist();
  }, [isAuthenticated, user]);
}
