import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, ToggleLeft, ToggleRight, Package, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

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

export default function AdminPricingManagement() {
  const queryClient = useQueryClient();
  const [showBundleDialog, setShowBundleDialog] = useState(false);
  const [newBundle, setNewBundle] = useState({
    name: '',
    description: '',
    hours_included: 3,
    credits_price: 250,
    discount_percent: 10
  });

  const { data: pricingRules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['pricing-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('priority', { ascending: false });
      if (error) throw error;
      return data as PricingRule[];
    }
  });

  const { data: bundleOffers = [], isLoading: bundlesLoading } = useQuery({
    queryKey: ['bundle-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundle_offers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BundleOffer[];
    }
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, currentStatus }: { ruleId: string; currentStatus: boolean }) => {
      const { error } = await supabase
        .from('pricing_rules')
        .update({ is_active: !currentStatus })
        .eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Rule updated');
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    },
    onError: () => toast.error('Failed to update rule')
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Rule deleted');
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    },
    onError: () => toast.error('Failed to delete rule')
  });

  const toggleBundleMutation = useMutation({
    mutationFn: async ({ bundleId, currentStatus }: { bundleId: string; currentStatus: boolean }) => {
      const { error } = await supabase
        .from('bundle_offers')
        .update({ is_active: !currentStatus })
        .eq('id', bundleId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Bundle updated');
      queryClient.invalidateQueries({ queryKey: ['bundle-offers'] });
    },
    onError: () => toast.error('Failed to update bundle')
  });

  const deleteBundleMutation = useMutation({
    mutationFn: async (bundleId: string) => {
      const { error } = await supabase
        .from('bundle_offers')
        .delete()
        .eq('id', bundleId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Bundle deleted');
      queryClient.invalidateQueries({ queryKey: ['bundle-offers'] });
    },
    onError: () => toast.error('Failed to delete bundle')
  });

  const createBundleMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('bundle_offers')
        .insert([newBundle]);
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

  const ruleTypeColors: Record<string, string> = {
    time_based: 'bg-blue-100 text-blue-800',
    day_based: 'bg-purple-100 text-purple-800',
    urgency: 'bg-yellow-100 text-yellow-800',
    holiday: 'bg-pink-100 text-pink-800',
    loyalty: 'bg-indigo-100 text-indigo-800',
    service: 'bg-green-100 text-green-800'
  };

  const isLoading = rulesLoading || bundlesLoading;

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pricing Management</h1>
              <p className="text-muted-foreground">Manage dynamic pricing rules and bundle offers</p>
            </div>
          </div>
          <Button onClick={() => setShowBundleDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Bundle
          </Button>
        </div>

        {/* Pricing Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Active Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pricingRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pricing rules configured</p>
              </div>
            ) : (
              pricingRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRuleMutation.mutate({ ruleId: rule.id, currentStatus: rule.is_active })}
                    >
                      {rule.is_active ? (
                        <ToggleRight className="h-6 w-6 text-primary" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={ruleTypeColors[rule.rule_type] || 'bg-muted'}>
                          {rule.rule_type?.replace('_', ' ')}
                        </Badge>
                        <span className="font-medium">{rule.display_label || 'Unnamed Rule'}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Multiplier: {((rule.multiplier || 1) * 100).toFixed(0)}% • Priority: {rule.priority || 0}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Delete this pricing rule?')) {
                        deleteRuleMutation.mutate(rule.id);
                      }
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Bundle Offers */}
        <Card>
          <CardHeader>
            <CardTitle>Bundle Offers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bundleOffers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No bundle offers configured</p>
              </div>
            ) : (
              bundleOffers.map((bundle) => (
                <div key={bundle.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleBundleMutation.mutate({ bundleId: bundle.id, currentStatus: bundle.is_active })}
                    >
                      {bundle.is_active ? (
                        <ToggleRight className="h-6 w-6 text-primary" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{bundle.name}</span>
                        {bundle.discount_percent && bundle.discount_percent > 0 && (
                          <Badge variant="secondary">{bundle.discount_percent}% off</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bundle.hours_included} hours • {bundle.credits_price} credits
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Delete this bundle offer?')) {
                        deleteBundleMutation.mutate(bundle.id);
                      }
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Create Bundle Dialog */}
        <Dialog open={showBundleDialog} onOpenChange={setShowBundleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Bundle Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Bundle Name</Label>
                <Input
                  value={newBundle.name}
                  onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })}
                  placeholder="e.g. Weekly Clean Package"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newBundle.description}
                  onChange={(e) => setNewBundle({ ...newBundle, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hours Included</Label>
                  <Input
                    type="number"
                    value={newBundle.hours_included}
                    onChange={(e) => setNewBundle({ ...newBundle, hours_included: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Price (Credits)</Label>
                  <Input
                    type="number"
                    value={newBundle.credits_price}
                    onChange={(e) => setNewBundle({ ...newBundle, credits_price: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label>Discount Percent</Label>
                <Input
                  type="number"
                  value={newBundle.discount_percent}
                  onChange={(e) => setNewBundle({ ...newBundle, discount_percent: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <Button 
                onClick={() => createBundleMutation.mutate()} 
                disabled={!newBundle.name || createBundleMutation.isPending}
                className="w-full"
              >
                {createBundleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Bundle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
