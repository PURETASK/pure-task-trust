import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { DEFAULT_PRICING_RULES } from '@/lib/pricing-rules';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';
import { motion } from 'framer-motion';

interface PricingRule {
  id: string;
  rule_name: string;
  rule_type: string;
  display_label: string;
  multiplier: number;
  priority: number;
  is_active: boolean;
  conditions: Record<string, unknown>;
}

const RULE_TYPE_COLORS: Record<string, string> = {
  time_of_day: 'bg-primary/10 text-primary border-primary/20',
  day_of_week: 'bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple)/0.2)]',
  surge: 'bg-destructive/10 text-destructive border-destructive/20',
  last_minute: 'bg-warning/10 text-warning border-warning/20',
  holiday: 'bg-[hsl(var(--pt-amber)/0.1)] text-[hsl(var(--pt-amber))] border-[hsl(var(--pt-amber)/0.2)]',
  first_booking_discount: 'bg-success/10 text-success border-success/20',
  distance: 'bg-muted text-muted-foreground border-border',
};

export default function AdminPricingRules() {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['pricing-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('priority', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        const seedData = DEFAULT_PRICING_RULES.map(rule => ({
          rule_name: rule.rule_name,
          rule_type: rule.rule_type,
          display_label: rule.display_label,
          multiplier: rule.multiplier,
          priority: rule.priority,
          is_active: rule.is_active,
          conditions: rule.conditions as Json
        }));
        const { error: insertError } = await supabase.from('pricing_rules').insert(seedData);
        if (insertError) throw insertError;
        const { data: seededData, error: refetchError } = await supabase.from('pricing_rules').select('*').order('priority', { ascending: true });
        if (refetchError) throw refetchError;
        return seededData as PricingRule[];
      }
      return data as PricingRule[];
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ ruleId, currentStatus }: { ruleId: string; currentStatus: boolean }) => {
      const { error } = await supabase.from('pricing_rules').update({ is_active: !currentStatus }).eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Rule ${!variables.currentStatus ? 'enabled' : 'disabled'}`);
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    },
    onError: () => toast.error('Failed to update rule')
  });

  const updateMultiplierMutation = useMutation({
    mutationFn: async ({ ruleId, multiplier }: { ruleId: string; multiplier: number }) => {
      const { error } = await supabase.from('pricing_rules').update({ multiplier }).eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Multiplier updated');
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    },
    onError: () => toast.error('Failed to update multiplier')
  });

  const handleMultiplierChange = (ruleId: string, value: string) => {
    const multiplier = parseFloat(value);
    if (!isNaN(multiplier) && multiplier > 0) {
      updateMultiplierMutation.mutate({ ruleId, multiplier });
    }
  };

  const activeCount = rules.filter(r => r.is_active).length;
  const surgeRules = rules.filter(r => r.multiplier > 1 && r.is_active).length;
  const discountRules = rules.filter(r => r.multiplier < 1 && r.is_active).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-poppins font-bold text-gradient-aero">Pricing Rules Manager</h1>
                <p className="text-sm text-muted-foreground">Configure dynamic pricing multipliers for different scenarios</p>
              </div>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'Active Rules', value: activeCount, icon: Zap, color: 'text-primary' },
                { label: 'Surge', value: surgeRules, icon: TrendingUp, color: 'text-warning' },
                { label: 'Discounts', value: discountRules, icon: TrendingDown, color: 'text-success' },
              ].map(stat => (
                <div key={stat.label} className="text-center px-4 py-2 rounded-xl bg-muted/50 border border-border/40">
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {rules.map((rule, index) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <Card className={`transition-all duration-200 ${!rule.is_active ? 'opacity-50' : 'hover:shadow-elevated'}`}>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{rule.rule_name}</h3>
                      <Badge variant="outline" className={`text-xs ${RULE_TYPE_COLORS[rule.rule_type] || 'bg-muted text-muted-foreground'}`}>
                        {rule.rule_type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-muted-foreground">P{rule.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.display_label}</p>
                  </div>

                  {/* Multiplier */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="space-y-1 w-32">
                      <Label className="text-xs text-muted-foreground">Multiplier</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={rule.multiplier}
                        onChange={(e) => handleMultiplierChange(rule.id, e.target.value)}
                        disabled={!rule.is_active}
                        className="text-sm font-bold text-center h-9"
                      />
                      <p className={`text-xs font-medium ${rule.multiplier > 1 ? 'text-warning' : rule.multiplier < 1 ? 'text-success' : 'text-muted-foreground'}`}>
                        {rule.multiplier === 1 ? 'No change' : rule.multiplier > 1
                          ? `+${((rule.multiplier - 1) * 100).toFixed(0)}% surge`
                          : `-${((1 - rule.multiplier) * 100).toFixed(0)}% discount`}
                      </p>
                    </div>

                    {/* Impact */}
                    <div className="space-y-1 w-28 hidden sm:block">
                      <Label className="text-xs text-muted-foreground">$100 becomes</Label>
                      <div className={`h-9 flex items-center justify-center rounded-lg font-bold text-sm border ${rule.multiplier > 1 ? 'bg-warning/10 border-warning/30 text-warning' : rule.multiplier < 1 ? 'bg-success/10 border-success/30 text-success' : 'bg-muted border-border text-foreground'}`}>
                        ${(100 * rule.multiplier).toFixed(0)}
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex flex-col items-center gap-1">
                      <Label className="text-xs text-muted-foreground">{rule.is_active ? 'Active' : 'Off'}</Label>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => toggleMutation.mutate({ ruleId: rule.id, currentStatus: rule.is_active })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
