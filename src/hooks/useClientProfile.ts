import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ClientProfileSummary {
  clientId: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  preferredContactMethod: string | null;
  property: {
    id: string;
    parkingNotes: string | null;
    accessInstructions: string | null;
    gateCode: string | null;
    doormanNotes: string | null;
    hasPets: boolean | null;
    petInfo: string | null;
    petFriendlyRequired: boolean | null;
  } | null;
  prefs: {
    extraAttentionNotes: string | null;
    avoidNotes: string | null;
    allergyNotes: string | null;
    productPreferences: string | null;
  } | null;
}

/**
 * Loads the client's saved profile, default property, and cleaning preferences
 * for use across booking and post-booking surfaces (auto-populate fields,
 * pre-fill notes, show "Booking as ___" confirmations, etc.).
 */
export function useClientProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-profile-summary", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ClientProfileSummary | null> => {
      if (!user) return null;

      const { data: cp } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cp) return null;

      const [{ data: prop }, { data: prefs }] = await Promise.all([
        supabase
          .from("property_profiles")
          .select("*")
          .eq("client_id", cp.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("cleaning_preferences")
          .select("*")
          .eq("client_id", cp.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      return {
        clientId: cp.id,
        firstName: cp.first_name,
        lastName: cp.last_name,
        fullName: [cp.first_name, cp.last_name].filter(Boolean).join(" ").trim(),
        email: cp.email ?? user.email ?? null,
        phone: cp.phone,
        preferredContactMethod: (cp as any).preferred_contact_method ?? null,
        property: prop
          ? {
              id: prop.id,
              parkingNotes: prop.parking_notes,
              accessInstructions: prop.access_instructions,
              gateCode: prop.gate_code,
              doormanNotes: prop.doorman_notes,
              hasPets: prop.has_pets,
              petInfo: prop.pet_info,
              petFriendlyRequired: prop.pet_friendly_required,
            }
          : null,
        prefs: prefs
          ? {
              extraAttentionNotes: prefs.extra_attention_notes,
              avoidNotes: prefs.avoid_notes,
              allergyNotes: prefs.allergy_notes,
              productPreferences: prefs.product_preferences,
            }
          : null,
      };
    },
  });
}

/** Build a friendly default "notes for cleaner" string from saved profile data. */
export function buildDefaultNotes(p: ClientProfileSummary | null | undefined): string {
  if (!p) return "";
  const lines: string[] = [];
  if (p.property?.parkingNotes) lines.push(`Parking: ${p.property.parkingNotes}`);
  if (p.property?.accessInstructions) lines.push(`Entry: ${p.property.accessInstructions}`);
  if (p.property?.gateCode) lines.push(`Gate code: ${p.property.gateCode}`);
  if (p.property?.doormanNotes) lines.push(`Doorman: ${p.property.doormanNotes}`);
  if (p.property?.hasPets && p.property?.petInfo) lines.push(`Pets: ${p.property.petInfo}`);
  if (p.prefs?.extraAttentionNotes) lines.push(`Extra attention: ${p.prefs.extraAttentionNotes}`);
  if (p.prefs?.avoidNotes) lines.push(`Please avoid: ${p.prefs.avoidNotes}`);
  if (p.prefs?.allergyNotes) lines.push(`Allergies: ${p.prefs.allergyNotes}`);
  if (p.prefs?.productPreferences) lines.push(`Products: ${p.prefs.productPreferences}`);
  return lines.join("\n");
}
