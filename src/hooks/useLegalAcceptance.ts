import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LEGAL_VERSIONS, type LegalDocType } from "@/lib/legal-versions";

export function useLegalAcceptance() {
  const recordAcceptance = useCallback(
    async (userId: string, docs: LegalDocType[] = ["terms", "privacy", "cookies", "acceptable_use"]) => {
      const rows = docs.map((d) => ({
        user_id: userId,
        document_type: d,
        document_version: LEGAL_VERSIONS[d],
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      }));
      const { error } = await supabase.from("legal_acceptances").insert(rows);
      if (error) throw error;
    },
    [],
  );

  return { recordAcceptance };
}