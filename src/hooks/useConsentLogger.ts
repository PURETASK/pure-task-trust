import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ConsentDocumentType =
  | "terms_of_service" | "privacy_policy" | "cookie_policy"
  | "aup" | "cancellation_policy" | "pro_ic_agreement"
  | "fcra_disclosure" | "sms_transactional" | "sms_marketing"
  | "cookies_functional" | "cookies_analytics" | "cookies_advertising"
  | "ccpa_optout" | "gpc_signal" | "arbitration_optout" | "age_18_plus";

export type ConsentMethod =
  | "signup_clickwrap" | "settings_toggle" | "gpc_signal"
  | "cookie_banner" | "sms_keyword" | "email_unsubscribe" | "api";

export interface ConsentRecordInput {
  documentType: ConsentDocumentType;
  documentVersion: string;
  consentGiven: boolean;
  exactTextShown: string;
  method: ConsentMethod;
}

/**
 * Writes an immutable consent record to `consent_records`.
 * Falls back silently for unauthenticated callers — RLS will block, which is OK
 * for cookie banner pre-signup actions (those use localStorage as evidence).
 * Brief: Doc 15, CHG-001.
 */
export function useConsentLogger() {
  return useCallback(async (input: ConsentRecordInput) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { skipped: true as const };

    const { error } = await supabase.from("consent_records").insert({
      user_id: user.id,
      document_type: input.documentType,
      document_version: input.documentVersion,
      consent_given: input.consentGiven,
      exact_text_shown: input.exactTextShown,
      consent_method: input.method,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
    if (error) {
      console.warn("[consent] failed to log:", error.message);
      return { error };
    }
    return { ok: true as const };
  }, []);
}