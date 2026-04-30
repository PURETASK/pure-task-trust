import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SetupStep =
  | "welcome"
  | "contact"
  | "home"
  | "access"
  | "preferences"
  | "review"
  | "complete";

export const SETUP_STEPS: SetupStep[] = [
  "welcome",
  "contact",
  "home",
  "access",
  "preferences",
  "review",
];

export interface ContactData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  alternate_email?: string;
  preferred_contact_method?: "email" | "sms" | "call";
  sms_opt_in?: boolean;
}

export interface HomeData {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  /** Persisted on the address row — user confirmed the map pin matches their home. */
  address_confirmed?: boolean;
}

export interface AccessData {
  parking_notes?: string;
  access_instructions?: string;
  gate_code?: string;
  doorman_notes?: string;
  has_pets?: boolean;
  pet_info?: string;
  pet_friendly_required?: boolean;
}

export interface PrefsData {
  extra_attention_notes?: string;
  avoid_notes?: string;
  product_preferences?: string;
  allergy_notes?: string;
}

export interface SetupState {
  contact: ContactData;
  home: HomeData;
  access: AccessData;
  prefs: PrefsData;
  clientId?: string;
  propertyId?: string;
  addressId?: string;
  prefsId?: string;
  setupCompleted: boolean;
  lastStep?: SetupStep;
  loading: boolean;
}

const empty: SetupState = {
  contact: { first_name: "", last_name: "", phone: "", email: "" },
  home: { line1: "", city: "", state: "", postal_code: "" },
  access: { has_pets: false },
  prefs: {},
  setupCompleted: false,
  loading: true,
};

export function useClientSetup() {
  const { user } = useAuth();
  const [state, setState] = useState<SetupState>(empty);
  const [saving, setSaving] = useState(false);

  // Load existing data so users can resume / edit
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { data: cp } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cp) {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
        return;
      }

      const [{ data: prop }, { data: addr }, { data: prefs }] = await Promise.all([
        supabase
          .from("property_profiles")
          .select("*, address:addresses(*)")
          .eq("client_id", cp.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_default", true)
          .maybeSingle(),
        supabase
          .from("cleaning_preferences")
          .select("*")
          .eq("client_id", cp.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      const address = (prop as any)?.address ?? addr;

      setState({
        clientId: cp.id,
        propertyId: prop?.id,
        addressId: address?.id,
        prefsId: prefs?.id,
        setupCompleted: !!cp.setup_completed_at,
        lastStep: (cp.setup_current_step as SetupStep) ?? undefined,
        loading: false,
        contact: {
          first_name: cp.first_name ?? "",
          last_name: cp.last_name ?? "",
          phone: cp.phone ?? "",
          email: cp.email ?? user.email ?? "",
          alternate_email: cp.alternate_email ?? "",
          preferred_contact_method: (cp.preferred_contact_method as any) ?? "email",
          sms_opt_in: cp.sms_opt_in ?? false,
        },
        home: {
          line1: address?.line1 ?? "",
          line2: address?.line2 ?? "",
          city: address?.city ?? "",
          state: address?.state ?? "",
          postal_code: address?.postal_code ?? "",
          address_confirmed: address?.address_confirmed ?? false,
        },
        access: {
          parking_notes: prop?.parking_notes ?? "",
          access_instructions: prop?.access_instructions ?? "",
          gate_code: prop?.gate_code ?? "",
          doorman_notes: prop?.doorman_notes ?? "",
          has_pets: prop?.has_pets ?? false,
          pet_info: prop?.pet_info ?? "",
          pet_friendly_required: prop?.pet_friendly_required ?? false,
        },
        prefs: {
          extra_attention_notes: prefs?.extra_attention_notes ?? "",
          avoid_notes: prefs?.avoid_notes ?? "",
          product_preferences: prefs?.product_preferences ?? "",
          allergy_notes: prefs?.allergy_notes ?? "",
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const updateContact = useCallback(
    (patch: Partial<ContactData>) =>
      setState((s) => ({ ...s, contact: { ...s.contact, ...patch } })),
    []
  );
  const updateHome = useCallback(
    (patch: Partial<HomeData>) =>
      setState((s) => ({ ...s, home: { ...s.home, ...patch } })),
    []
  );
  const updateAccess = useCallback(
    (patch: Partial<AccessData>) =>
      setState((s) => ({ ...s, access: { ...s.access, ...patch } })),
    []
  );
  const updatePrefs = useCallback(
    (patch: Partial<PrefsData>) =>
      setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch } })),
    []
  );

  /** Save current step + advance flag to DB. Returns {ok, error?}. */
  const saveStep = useCallback(
    async (nextStep: SetupStep): Promise<{ ok: boolean; error?: string }> => {
      if (!user) return { ok: false, error: "Not signed in" };
      setSaving(true);
      try {
        // 1. Upsert client_profiles (contact)
        const { data: cp, error: cpErr } = await supabase
          .from("client_profiles")
          .upsert(
            {
              user_id: user.id,
              first_name: state.contact.first_name || null,
              last_name: state.contact.last_name || null,
              phone: state.contact.phone || null,
              email: state.contact.email || user.email || null,
              alternate_email: state.contact.alternate_email || null,
              preferred_contact_method: state.contact.preferred_contact_method || null,
              sms_opt_in: !!state.contact.sms_opt_in,
              setup_current_step: nextStep,
              setup_completed_at:
                nextStep === "complete" ? new Date().toISOString() : null,
            },
            { onConflict: "user_id" }
          )
          .select()
          .single();

        if (cpErr) throw cpErr;
        const clientId = cp.id;

        // 2. Upsert default address (only after we have basic home data)
        let addressId = state.addressId;
        if (state.home.line1 && state.home.city) {
          const addressPayload = {
            user_id: user.id,
            line1: state.home.line1,
            line2: state.home.line2 || null,
            city: state.home.city,
            state: state.home.state || null,
            postal_code: state.home.postal_code || null,
            is_default: true,
            label: "Home",
            address_confirmed: !!state.home.address_confirmed,
          };
          if (addressId) {
            const { error } = await supabase
              .from("addresses")
              .update(addressPayload)
              .eq("id", addressId);
            if (error) throw error;
          } else {
            const { data: addr, error } = await supabase
              .from("addresses")
              .insert(addressPayload)
              .select()
              .single();
            if (error) throw error;
            addressId = addr.id;
          }
        }

        // 3. Upsert property_profiles (home + access)
        let propertyId = state.propertyId;
        const propertyPayload = {
          client_id: clientId,
          address_id: addressId ?? null,
          name: "My Home",
          parking_notes: state.access.parking_notes || null,
          access_instructions: state.access.access_instructions || null,
          gate_code: state.access.gate_code || null,
          doorman_notes: state.access.doorman_notes || null,
          has_pets: !!state.access.has_pets,
          pet_info: state.access.pet_info || null,
          pet_friendly_required: !!state.access.pet_friendly_required,
        };
        if (propertyId) {
          const { error } = await supabase
            .from("property_profiles")
            .update(propertyPayload)
            .eq("id", propertyId);
          if (error) throw error;
        } else if (state.home.line1) {
          const { data: prop, error } = await supabase
            .from("property_profiles")
            .insert(propertyPayload)
            .select()
            .single();
          if (error) throw error;
          propertyId = prop.id;
        }

        // 4. Upsert cleaning preferences
        let prefsId = state.prefsId;
        const prefsPayload = {
          client_id: clientId,
          property_id: propertyId ?? null,
          extra_attention_notes: state.prefs.extra_attention_notes || null,
          avoid_notes: state.prefs.avoid_notes || null,
          product_preferences: state.prefs.product_preferences || null,
          allergy_notes: state.prefs.allergy_notes || null,
        };
        if (prefsId) {
          const { error } = await supabase
            .from("cleaning_preferences")
            .update(prefsPayload)
            .eq("id", prefsId);
          if (error) throw error;
        } else {
          const { data: p, error } = await supabase
            .from("cleaning_preferences")
            .insert(prefsPayload)
            .select()
            .single();
          if (error) throw error;
          prefsId = p.id;
        }

        setState((s) => ({
          ...s,
          clientId,
          addressId,
          propertyId,
          prefsId,
          lastStep: nextStep,
          setupCompleted: nextStep === "complete" ? true : s.setupCompleted,
        }));
        return { ok: true };
      } catch (e: any) {
        console.error("[useClientSetup] saveStep failed", e);
        return { ok: false, error: e?.message || "Save failed" };
      } finally {
        setSaving(false);
      }
    },
    [user, state]
  );

  return {
    state,
    saving,
    updateContact,
    updateHome,
    updateAccess,
    updatePrefs,
    saveStep,
  };
}
