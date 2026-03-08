import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, DollarSign, Clock, Flag, Save, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface ConfigEntry {
  key: string;
  value: any;
  description: string;
  updated_at: string;
  updated_by: string;
}

const DEFAULT_CONFIGS = [
  { key: "platform_fee_pct_bronze", value: 20, description: "Platform fee % for Bronze tier cleaners", category: "Fees" },
  { key: "platform_fee_pct_silver", value: 18, description: "Platform fee % for Silver tier cleaners", category: "Fees" },
  { key: "platform_fee_pct_gold", value: 16, description: "Platform fee % for Gold tier cleaners", category: "Fees" },
  { key: "platform_fee_pct_platinum", value: 15, description: "Platform fee % for Platinum tier cleaners", category: "Fees" },
  { key: "cancellation_grace_hours", value: 24, description: "Hours before job start within which cancellation is free", category: "Cancellations" },
  { key: "cancellation_fee_pct_late", value: 50, description: "Fee % charged for cancellations within grace period", category: "Cancellations" },
  { key: "instant_payout_fee_pct", value: 5, description: "Fee % charged for instant payouts (vs free weekly)", category: "Pricing" },
  { key: "minimum_instant_payout_credits", value: 10, description: "Minimum credits required to request instant payout", category: "Pricing" },
  { key: "credit_to_usd_rate", value: 1.0, description: "Exchange rate: 1 credit = X USD", category: "Pricing" },
  { key: "feature_instant_payout", value: true, description: "Enable instant payout feature for cleaners", category: "Features" },
  { key: "feature_client_rating", value: true, description: "Enable cleaners to rate clients", category: "Features" },
  { key: "feature_marketplace_jobs", value: true, description: "Enable open marketplace for unmatched jobs", category: "Features" },
  { key: "feature_referral_program", value: true, description: "Enable the referral rewards program", category: "Features" },
];

const CATEGORY_ICONS: Record<string, any> = {
  Fees: DollarSign,
  Cancellations: Clock,
  Pricing: DollarSign,
  Features: Flag,
};

const AdminPlatformConfig = () => {
  const queryClient = useQueryClient();
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const { data: configs, isLoading, refetch } = useQuery({
    queryKey: ["platform-config"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_config" as any).select("*");
      // Merge DB values with defaults
      const dbMap: Record<string, any> = {};
      (data || []).forEach((c: any) => { dbMap[c.key] = c; });
      return DEFAULT_CONFIGS.map((def) => ({
        ...def,
        value: dbMap[def.key]?.value ?? def.value,
        updated_at: dbMap[def.key]?.updated_at || null,
        updated_by: dbMap[def.key]?.updated_by || null,
      }));
    },
    staleTime: 60_000,
  });

  const saveConfig = async (key: string, value: any) => {
    setSaving(key);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { error } = await supabase.from("platform_config" as any).upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      }, { onConflict: "key" });
      if (error) throw error;

      await supabase.from("admin_audit_log").insert({
        admin_user_id: userId || "",
        action: "platform_config_updated",
        entity_type: "platform_config",
        entity_id: key,
        new_values: { [key]: value },
        reason: `Config updated via Platform Config panel`,
      });

      queryClient.invalidateQueries({ queryKey: ["platform-config"] });
      setEditValues((prev) => { const n = { ...prev }; delete n[key]; return n; });
      toast.success(`${key} updated successfully`);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const categories = [...new Set(DEFAULT_CONFIGS.map(c => c.category))];

  const getValue = (cfg: any) =>
    editValues[cfg.key] !== undefined ? editValues[cfg.key] : cfg.value;

  const hasChanges = (cfg: any) =>
    editValues[cfg.key] !== undefined && editValues[cfg.key] !== cfg.value;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary">Analytics</Link>
              <span>/</span><span>Platform Config</span>
            </div>
            <h1 className="text-3xl font-bold">Platform Configuration</h1>
            <p className="text-muted-foreground mt-1">Adjust fees, limits, and feature flags without code deploys</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category] || Settings;
              const catConfigs = (configs || []).filter(c => c.category === category);
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      {category} Settings
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {catConfigs.length} configuration{catConfigs.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {catConfigs.map((cfg, idx) => (
                        <div key={cfg.key}>
                          {idx > 0 && <Separator className="mb-4" />}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm">{cfg.description}</p>
                                {hasChanges(cfg) && <Badge variant="secondary" className="text-xs">Modified</Badge>}
                              </div>
                              <p className="font-mono text-xs text-muted-foreground">{cfg.key}</p>
                              {cfg.updated_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Last updated: {format(new Date(cfg.updated_at), "MMM d, yyyy 'at' HH:mm")}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {typeof cfg.value === "boolean" ? (
                                <Switch
                                  checked={getValue(cfg) as boolean}
                                  onCheckedChange={(v) => setEditValues(prev => ({ ...prev, [cfg.key]: v }))}
                                />
                              ) : (
                                <Input
                                  type="number"
                                  value={getValue(cfg) as number}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, [cfg.key]: parseFloat(e.target.value) || 0 }))}
                                  className="w-24 text-sm text-center"
                                />
                              )}
                              <Button
                                size="sm"
                                variant={hasChanges(cfg) ? "default" : "outline"}
                                disabled={!hasChanges(cfg) || saving === cfg.key}
                                onClick={() => saveConfig(cfg.key, getValue(cfg))}
                                className="gap-1 min-w-[72px]"
                              >
                                {saving === cfg.key ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : hasChanges(cfg) ? (
                                  <><Save className="h-3.5 w-3.5" />Save</>
                                ) : (
                                  <><CheckCircle className="h-3.5 w-3.5 text-success" />Saved</>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link to="/admin/analytics">← Back to Analytics</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPlatformConfig;
