import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign } from 'lucide-react';
import { DEFAULT_PRICING_RULES } from '@/lib/pricing-rules';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

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

      // If no rules in DB, seed defaults
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
        
        const { error: insertError } = await supabase
          .from('pricing_rules')
          .insert(seedData);

        if (insertError) throw insertError;

        const { data: seededData, error: refetchError } = await supabase
          .from('pricing_rules')
          .select('*')
          .order('priority', { ascending: true });

        if (refetchError) throw refetchError;
        return seededData as PricingRule[];
      }

      return data as PricingRule[];
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ ruleId, currentStatus }: { ruleId: string; currentStatus: boolean }) => {
      const { error } = await supabase
        .from('pricing_rules')
        .update({ is_active: !currentStatus })
        .eq('id', ruleId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Rule ${!variables.currentStatus ? 'enabled' : 'disabled'}`);
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    },
    onError: () => {
      toast.error('Failed to update rule');
    }
  });

  const updateMultiplierMutation = useMutation({
    mutationFn: async ({ ruleId, multiplier }: { ruleId: string; multiplier: number }) => {
      const { error } = await supabase
        .from('pricing_rules')
        .update({ multiplier })
        .eq('id', ruleId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Multiplier updated');
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    },
    onError: () => {
      toast.error('Failed to update multiplier');
    }
  });

  const handleMultiplierChange = (ruleId: string, value: string) => {
    const multiplier = parseFloat(value);
    if (!isNaN(multiplier) && multiplier > 0) {
      updateMultiplierMutation.mutate({ ruleId, multiplier });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Pricing Rules Manager
            </h1>
            <p className="text-muted-foreground">
              Configure dynamic pricing multipliers for different scenarios
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {rules.map(rule => (
            <Card key={rule.id} className={`transition-all ${!rule.is_active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{rule.rule_name}</CardTitle>
                      <Badge variant="outline">
                        {rule.rule_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.display_label}</p>
                    <p className="text-xs text-muted-foreground">Priority: {rule.priority}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => toggleMutation.mutate({ 
                        ruleId: rule.id, 
                        currentStatus: rule.is_active 
                      })}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Multiplier</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={rule.multiplier}
                    onChange={(e) => handleMultiplierChange(rule.id, e.target.value)}
                    disabled={!rule.is_active}
                    className="text-lg font-bold"
                  />
                  <p className={`text-sm ${rule.multiplier > 1 ? 'text-amber-600' : 'text-primary'}`}>
                    {rule.multiplier > 1 
                      ? `+${((rule.multiplier - 1) * 100).toFixed(0)}% increase`
                      : `-${((1 - rule.multiplier) * 100).toFixed(0)}% discount`
                    }
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Example Impact</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">$100 booking becomes</p>
                    <p className="text-xl font-bold text-primary">
                      ${(100 * rule.multiplier).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Conditions:</Label>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-24">
                    {JSON.stringify(rule.conditions, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
