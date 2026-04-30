import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Search, Eye, DollarSign, User, Calendar, RefreshCw, Loader2, Shield, FileText, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, differenceInHours } from 'date-fns';
import { toast } from 'sonner';
import { withAdminAuditLog } from '@/lib/audit';

interface AdminDispute {
  id: string;
  job_id: string;
  client_id: string;
  status: string;
  client_notes: string;
  admin_notes: string | null;
  resolution_type: string | null;
  resolution_notes: string | null;
  refund_amount_credits: number | null;
  created_at: string;
  resolved_at: string | null;
  job?: {
    cleaning_type: string;
    scheduled_start_at: string | null;
    escrow_credits_reserved: number;
    cleaner: { first_name: string | null; last_name: string | null } | null;
    client: { first_name: string | null; last_name: string | null } | null;
  };
}

function SLABadge({ createdAt, status }: { createdAt: string; status: string }) {
  if (status === 'resolved' || status === 'dismissed' || status === 'closed') return null;
  const hours = differenceInHours(new Date(), new Date(createdAt));
  const urgency = hours >= 48 ? 'critical' : hours >= 24 ? 'high' : hours >= 8 ? 'medium' : 'low';
  const label = hours >= 48 ? `${Math.floor(hours / 24)}d old` : hours >= 1 ? `${hours}h old` : '<1h old';
  const styles = {
    critical: 'bg-destructive/10 text-destructive border-destructive/30',
    high: 'bg-warning/10 text-warning border-warning/30',
    medium: 'bg-warning/10 text-warning border-warning/20',
    low: 'bg-muted text-muted-foreground border-border',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${styles[urgency]}`}>
      <Timer className="h-3 w-3" />{label}
    </span>
  );
}

const AdminDisputes = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionType, setResolutionType] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const { data: disputes = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-disputes-full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select(`*, job:jobs(cleaning_type, scheduled_start_at, escrow_credits_reserved, cleaner:cleaner_profiles(first_name, last_name), client:client_profiles(first_name, last_name))`)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as AdminDispute[];
    },
  });

  const resolveDispute = useMutation({
    mutationFn: async ({ disputeId, type, notes, refund }: { disputeId: string; type: string; notes: string; refund: number }) => {
      const updates = {
        status: 'resolved' as const,
        resolution_type: type,
        resolution_notes: notes,
        refund_amount_credits: refund || null,
        resolved_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      };
      await withAdminAuditLog(
        'dispute_resolved',
        {
          entity_type: 'dispute',
          entity_id: disputeId,
          new_values: updates,
          reason: notes,
        },
        async () => {
          const { error } = await supabase.from('disputes').update(updates).eq('id', disputeId);
          if (error) throw error;
        },
      );
    },
    onSuccess: () => {
      toast.success('Dispute resolved');
      setSelectedDispute(null);
      queryClient.invalidateQueries({ queryKey: ['admin-disputes-full'] });
    },
    onError: () => toast.error('Failed to resolve dispute'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ disputeId, status, notes }: { disputeId: string; status: string; notes?: string }) => {
      await withAdminAuditLog(
        'dispute_status_updated',
        {
          entity_type: 'dispute',
          entity_id: disputeId,
          new_values: { status, admin_notes: notes ?? null },
        },
        async () => {
          const { error } = await supabase.from('disputes').update({
            status: status as 'open' | 'investigating' | 'resolved' | 'closed',
            admin_notes: notes || null,
          }).eq('id', disputeId);
          if (error) throw error;
        },
      );
    },
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-disputes-full'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const filtered = disputes.filter(d => {
    const matchSearch = !search || d.job_id.includes(search) || d.client_notes?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCount = disputes.filter(d => d.status === 'open').length;
  const investigatingCount = disputes.filter(d => d.status === 'investigating').length;
  const resolvedCount = disputes.filter(d => d.status === 'resolved').length;
  const urgentCount = disputes.filter(d => d.status !== 'resolved' && d.status !== 'dismissed' && differenceInHours(new Date(), new Date(d.created_at)) >= 24).length;
  const totalRefunds = disputes.filter(d => d.refund_amount_credits).reduce((s, d) => s + (d.refund_amount_credits || 0), 0);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      open: 'bg-warning/10 text-warning border-warning/20',
      investigating: 'bg-primary/10 text-primary border-primary/20',
      resolved: 'bg-success/10 text-success border-success/20',
      escalated: 'bg-destructive/10 text-destructive border-destructive/20',
      dismissed: 'bg-muted text-muted-foreground border-border',
    };
    return <Badge variant="outline" className={map[status] || ''}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-poppins font-bold text-gradient-aero">Disputes Management</h1>
                <p className="text-sm text-muted-foreground">Review, investigate, and resolve customer disputes</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Open', count: openCount, color: 'border-warning/30 bg-warning/5', iconColor: 'text-warning', Icon: AlertCircle },
            { label: 'Investigating', count: investigatingCount, color: 'border-primary/30 bg-primary/5', iconColor: 'text-primary', Icon: Clock },
            { label: 'Resolved', count: resolvedCount, color: 'border-success/30 bg-success/5', iconColor: 'text-success', Icon: CheckCircle },
            { label: '24h+ Urgent', count: urgentCount, color: 'border-destructive/30 bg-destructive/5', iconColor: 'text-destructive', Icon: Timer },
            { label: 'Total Refunds', count: `${totalRefunds} cr`, color: 'border-[hsl(var(--pt-purple)/0.3)] bg-[hsl(var(--pt-purple)/0.05)]', iconColor: 'text-[hsl(var(--pt-purple))]', Icon: DollarSign },
          ].map(({ label, count, color, iconColor, Icon }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`border ${color}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by job ID or description..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-primary" /> Disputes ({filtered.length})
            </CardTitle>
            <CardDescription>Click a dispute to review and take action</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground">No disputes found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((dispute, i) => (
                  <motion.div
                    key={dispute.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer"
                    onClick={() => { setSelectedDispute(dispute); setAdminNotes(dispute.admin_notes || ''); setResolutionType(dispute.resolution_type || ''); setResolutionNotes(dispute.resolution_notes || ''); setRefundAmount(dispute.refund_amount_credits?.toString() || ''); }}
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs text-muted-foreground">#{dispute.job_id.slice(0, 8)}</span>
                        {getStatusBadge(dispute.status)}
                        <SLABadge createdAt={dispute.created_at} status={dispute.status} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{dispute.client_notes}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {dispute.job?.client && <span className="flex items-center gap-1"><User className="h-3 w-3" />{dispute.job.client.first_name}</span>}
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(dispute.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0 text-xs">
                      <Eye className="h-3.5 w-3.5 mr-1" />Review
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Dispute #{selectedDispute?.job_id.slice(0, 8)}</DialogTitle>
            <DialogDescription>Review and take action</DialogDescription>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-5 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedDispute.status)}
                  <SLABadge createdAt={selectedDispute.created_at} status={selectedDispute.status} />
                </div>
                <div className="flex gap-2">
                  {selectedDispute.status === 'open' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ disputeId: selectedDispute.id, status: 'investigating', notes: adminNotes })} disabled={updateStatus.isPending}>
                      Start Investigation
                    </Button>
                  )}
                  {selectedDispute.status !== 'dismissed' && selectedDispute.status !== 'resolved' && (
                    <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => updateStatus.mutate({ disputeId: selectedDispute.id, status: 'dismissed' })} disabled={updateStatus.isPending}>
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/50">
                <div><p className="text-xs text-muted-foreground mb-1">Client</p><p className="font-medium text-sm">{selectedDispute.job?.client?.first_name} {selectedDispute.job?.client?.last_name}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Cleaner</p><p className="font-medium text-sm">{selectedDispute.job?.cleaner?.first_name} {selectedDispute.job?.cleaner?.last_name}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Job Type</p><p className="font-medium text-sm capitalize">{selectedDispute.job?.cleaning_type?.replace('_', ' ')}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Escrow</p><p className="font-medium text-sm text-warning">{selectedDispute.job?.escrow_credits_reserved || 0} cr</p></div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Client's Description</Label>
                <div className="p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">{selectedDispute.client_notes || 'No description provided'}</div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" />Resolution</h4>
                <div className="space-y-2">
                  <Label>Resolution Type</Label>
                  <Select value={resolutionType} onValueChange={setResolutionType}>
                    <SelectTrigger><SelectValue placeholder="Select resolution..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_refund">Full Refund to Client</SelectItem>
                      <SelectItem value="partial_refund">Partial Refund</SelectItem>
                      <SelectItem value="no_refund">No Refund — Cleaner Paid</SelectItem>
                      <SelectItem value="goodwill_credit">Goodwill Credit</SelectItem>
                      <SelectItem value="dismissed">Dismissed (No Action)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(resolutionType === 'partial_refund' || resolutionType === 'goodwill_credit') && (
                  <div className="space-y-2">
                    <Label>Refund Amount (credits)</Label>
                    <Input type="number" placeholder="Enter amount..." value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea placeholder="Internal notes..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Resolution Notes (visible to client)</Label>
                  <Textarea placeholder="Explanation for client..." value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} rows={2} />
                </div>
                <Button
                  className="w-full"
                  disabled={!resolutionType || resolveDispute.isPending || selectedDispute.status === 'resolved'}
                  onClick={() => resolveDispute.mutate({ disputeId: selectedDispute.id, type: resolutionType, notes: resolutionNotes, refund: parseFloat(refundAmount) || 0 })}
                >
                  {resolveDispute.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  {selectedDispute.status === 'resolved' ? 'Already Resolved' : 'Resolve Dispute'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDisputes;
