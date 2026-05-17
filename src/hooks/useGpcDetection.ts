import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LEGAL_CONSTANTS } from "@/lib/legal-constants";

/**
 * Detects Global Privacy Control (GPC) signal from the browser and, for
 * authenticated users, auto-records a CCPA opt-out plus flags the profile.
 * Brief: Doc 15, CHG-013.
 * Spec: https://globalprivacycontrol.org/
 */
export function useGpcDetection() {
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
    if (gpc !== true) return;

    // Cache locally so the cookie banner reads the same signal.
    try { localStorage.setItem("pt_gpc_signal", "1"); } catch {}

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Flip profile flags (idempotent — only if not already set).
      const { data: profile } = await supabase
        .from("profiles")
        .select("gpc_signal_detected, ccpa_opted_out_of_sale_share")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && (!profile.gpc_signal_detected || !profile.ccpa_opted_out_of_sale_share)) {
        await supabase
          .from("profiles")
          .update({
            gpc_signal_detected: true,
            ccpa_opted_out_of_sale_share: true,
            ccpa_optout_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        await supabase.from("consent_records").insert({
          user_id: user.id,
          document_type: "gpc_signal",
          document_version: LEGAL_CONSTANTS.DOCUMENT_VERSIONS.PRIVACY_POLICY,
          consent_given: false, // GPC = opt OUT of sale/share
          exact_text_shown: "Browser sent Global Privacy Control (GPC) signal — interpreted as a request to opt out of the sale/sharing of personal information under CCPA/CPRA.",
          consent_method: "gpc_signal",
          user_agent: navigator.userAgent,
        });
      }
    })();
  }, []);
}