import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type MFAMethod = "none" | "totp" | "email" | "both";

interface MFASettings {
  method: MFAMethod;
  is_enabled: boolean;
  totp_verified: boolean;
}

export function useMFA() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["mfa-settings", user?.id],
    queryFn: async (): Promise<MFASettings> => {
      if (!user) return { method: "none", is_enabled: false, totp_verified: false };
      
      const [{ data: mfaData }, { data: totpData }] = await Promise.all([
        supabase.from("mfa_settings").select("method, is_enabled").eq("user_id", user.id).maybeSingle(),
        supabase.from("totp_secrets").select("verified_at").eq("user_id", user.id).maybeSingle(),
      ]);

      return {
        method: (mfaData?.method as MFAMethod) || "none",
        is_enabled: mfaData?.is_enabled || false,
        totp_verified: !!totpData?.verified_at,
      };
    },
    enabled: !!user,
  });

  const setupTOTP = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      // Generate a base32 secret client-side for QR code display
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      let secret = "";
      for (let i = 0; i < 32; i++) {
        secret += chars[Math.floor(Math.random() * chars.length)];
      }
      const codes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      // Upsert TOTP secret
      const { error } = await supabase.from("totp_secrets").upsert({
        user_id: user.id,
        encrypted_secret: secret, // In production, encrypt server-side
        recovery_codes: codes,
        verified_at: null,
      }, { onConflict: "user_id" });

      if (error) throw error;

      // Upsert MFA settings
      await supabase.from("mfa_settings").upsert({
        user_id: user.id,
        method: settings?.method === "email" ? "both" : "totp",
        is_enabled: true,
      }, { onConflict: "user_id" });

      setTotpSecret(secret);
      setRecoveryCodes(codes);
      return { secret, codes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mfa-settings"] });
      toast.success("TOTP setup initiated — scan the QR code with your authenticator app");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setupEmailMFA = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("mfa_settings").upsert({
        user_id: user.id,
        method: settings?.method === "totp" ? "both" : "email",
        is_enabled: true,
      }, { onConflict: "user_id" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mfa-settings"] });
      toast.success("Email-based 2FA enabled");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disableMFA = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("mfa_settings").upsert({
        user_id: user.id,
        method: "none",
        is_enabled: false,
      }, { onConflict: "user_id" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mfa-settings"] });
      toast.success("2FA disabled");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totpUri = totpSecret && user
    ? `otpauth://totp/PureTask:${user.email}?secret=${totpSecret}&issuer=PureTask&digits=6&period=30`
    : null;

  return {
    settings: settings || { method: "none" as MFAMethod, is_enabled: false, totp_verified: false },
    isLoading,
    setupTOTP,
    setupEmailMFA,
    disableMFA,
    totpSecret,
    totpUri,
    recoveryCodes,
  };
}
