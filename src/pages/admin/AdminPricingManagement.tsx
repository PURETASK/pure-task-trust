import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Trash2, Package, Settings, Clock, Tag, TrendingUp, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface PricingRule {
  id: string;
  rule_name: string;
  rule_type: string;
  display_label: string;
  multiplier: number;
  priority: number;
  is_active: boolean;
}

interface BundleOffer {
  id: string;
  name: string;
  description: string | null;
  hours_included: number;
  credits_price: number;
  discount_percent: number | null;
  is_active: boolean;
}

const RULE_TYPE_COLORS: Record<string, string> = {
  time_based: 'bg-primary/10 text-primary border-primary/20',
  day_based: 'bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple)/0.2)]',
  urgency: 'bg-warning/10 text-warning border-warning/20',
  holiday: 'bg-destructive/10 text-destructive border-destructive/20',
  loyalty: 'bg-success/10 text-success border-success/20',
  service: 'bg-muted text-muted-foreground border-border',
};

export default function AdminPricingManagement() {
  const queryClient = useQueryClient();
  const [showBundleDialog, setShowBundleDialog] = useState(false);
  const [newBundle, setNewBundle] = useState({ name: '', description: '', hours_included: 3, credits_price: 250, discount_percent: 10 });

  const { data: pricingRules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['pricing-rules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pricing_rules').select('*').order('priority', { ascending: false });
      if (error) throw error;
      return data as PricingRule[];
    }
  });

  const { data: bundleOffers = [], isLoading: bundlesLoading } = useQuery({
    queryKey: ['bundle-offers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('bundle_offers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as BundleOffer[];
    }
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, currentStatus }: { ruleId: string; currentStatus: boolean }) => {
      const { error } = await supabase.from('pricing_rules').update({ is_active: !currentStatus }).eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Rule updated'); queryClient.invalidateQueries({ queryKey: ['pricing-rules'] }); },
    onError: () => toast.error('Failed to update rule')
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase.from('pricing_rules').delete().eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Rule deleted'); queryClient.invalidateQueries({ queryKey: ['pricing-rules'] }); },
    onError: () => toast.error('Failed to delete rule')
  });

  const toggleBundleMutation = useMutation({
    mutationFn: async ({ bundleId, currentStatus }: { bundleId: string; currentStatus: boolean }) => {
      const { error } = await supabase.from('bundle_offers').update({ is_active: !currentStatus }).eq('id', bundleId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Bundle updated'); queryClient.invalidateQueries({ queryKey: ['bundle-offers'] }); },
    onError: () => toast.error('Failed to update bundle')
  });

  const deleteBundleMutation = useMutation({
    mutationFn: async (bundleId: string) => {
      const { error } = await supabase.from('bundle_offers').delete().eq('id', bundleId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Bundle deleted'); queryClient.invalidateQueries({ queryKey: ['bundle-offers'] }); },
    onError: () => toast.error('Failed to delete bundle')
  });

  const createBundleMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('bundle_offers').insert([newBundle]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Bundle created');
      setShowBundleDialog(false);
      setNewBundle({ name: '', description: '', hours_included: 3, credits_price: 250, discount_percent: 10 });
      queryClient.invalidateQueries({ queryKey: ['bundle-offers'] });
    },
    onError: () => toast.error('Failed to create bundle')
  });

  if (rulesLoading || bundlesLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const activeRules = pricingRules.filter(r => r.is_active).length;
  const activeBundles = bundleOffers.filter(b => b.is_active).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-poppins font-bold text-gradient-aero">Pricing Management</h1>
                <p className="text-sm text-muted-foreground">Dynamic pricing rules and credit bundle offers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-muted/50 border border-border/40">
                  <p className="text-lg font-bold">{activeRules}/{pricingRules.length}</p>
                  <p className="text-xs text-muted-foreground">Active Rules</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-muted/50 border border-border/40">
                  <p className="text-lg font-bold">{activeBundles}/{bundleOffers.length}</p>
                  <p className="text-xs text-muted-foreground">Active Bundles</p>
                </div>
              </div>
              <Button onClick={() => setShowBundleDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" /> New Bundle
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Pricing Rules */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Dynamic Pricing Rules</h2>
          </div>

          {pricingRules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Settings className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground">No pricing rules configured yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pricingRules.map((rule, i) => (
                <motion.div key={rule.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className={`transition-all ${!rule.is_active ? 'opacity-50' : 'hover:shadow-sm'}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => toggleRuleMutation.mutate({ ruleId: rule.id, currentStatus: rule.is_active })}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <Badge variant="outline" className={`text-xs ${RULE_TYPE_COLORS[rule.rule_type] || 'bg-muted'}`}>
                            {rule.rule_type?.replace('_', ' ')}
                          </Badge>
                          <span className="font-medium text-sm">{rule.display_label || rule.rule_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Multiplier: {((rule.multiplier || 1) * 100).toFixed(0)}% · Priority: {rule.priority || 0}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-sm font-bold ${rule.multiplier > 1 ? 'bg-warning/10 text-warning' : rule.multiplier < 1 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        ×{rule.multiplier.toFixed(2)}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete this rule?')) deleteRuleMutation.mutate(rule.id); }} className="text-destructive hover:bg-destructive/10 h-8 w-8">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Bundle Offers */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-success" />
            </div>
            <h2 className="text-lg font-semibold">Bundle Offers</h2>
          </div>

          {bundleOffers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground">No bundle offers yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowBundleDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Create First Bundle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {bundleOffers.map((bundle, i) => (
                <motion.div key={bundle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className={`transition-all ${!bundle.is_active ? 'opacity-50' : 'hover:shadow-sm'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">{bundle.name}</CardTitle>
                            {bundle.discount_percent && bundle.discount_percent > 0 && (
                              <Badge className="bg-success/10 text-success border-success/20 text-xs">{bundle.discount_percent}% off</Badge>
                            )}
                          </div>
                          {bundle.description && <p className="text-xs text-muted-foreground">{bundle.description}</p>}
                        </div>
                        <Switch
                          checked={bundle.is_active}
                          onCheckedChange={() => toggleBundleMutation.mutate({ bundleId: bundle.id, currentStatus: bundle.is_active })}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{bundle.hours_included}h</span>
                          <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{bundle.credits_price} cr</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete this bundle?')) deleteBundleMutation.mutate(bundle.id); }} className="text-destructive hover:bg-destructive/10 h-8 w-8">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* Create Bundle Dialog */}
      <Dialog open={showBundleDialog} onOpenChange={setShowBundleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" />Create Bundle Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Bundle Name</Label><Input value={newBundle.name} onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })} placeholder="e.g. Weekly Clean Package" /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={newBundle.description} onChange={(e) => setNewBundle({ ...newBundle, description: e.target.value })} placeholder="Optional description" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Hours</Label><Input type="number" value={newBundle.hours_included} onChange={(e) => setNewBundle({ ...newBundle, hours_included: parseInt(e.target.value) || 1 })} /></div>
              <div className="space-y-2"><Label>Price (cr)</Label><Input type="number" value={newBundle.credits_price} onChange={(e) => setNewBundle({ ...newBundle, credits_price: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Discount %</Label><Input type="number" value={newBundle.discount_percent} onChange={(e) => setNewBundle({ ...newBundle, discount_percent: parseFloat(e.target.value) || 0 })} /></div>
            </div>
            <Button onClick={() => createBundleMutation.mutate()} disabled={!newBundle.name || createBundleMutation.isPending} className="w-full">
              {createBundleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Bundle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
