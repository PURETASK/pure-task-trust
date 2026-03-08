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
import { 
  MessageSquare, Clock, CheckCircle, XCircle, AlertCircle,
  Search, Eye, DollarSign, User, Calendar, RefreshCw, Loader2,
  Shield, ArrowRight, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
        .select(`
          *,
          job:jobs(
            cleaning_type,
            scheduled_start_at,
            escrow_credits_reserved,
            cleaner:cleaner_profiles(first_name, last_name),
            client:client_profiles(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as AdminDispute[];
    },
  });

  const resolveDispute = useMutation({
    mutationFn: async ({ disputeId, type, notes, refund }: {
      disputeId: string;
      type: string;
      notes: string;
      refund: number;
    }) => {
      const { error } = await supabase
        .from('disputes')
        .update({
          status: 'resolved' as const,
          resolution_type: type,
          resolution_notes: notes,
          refund_amount_credits: refund || null,
          resolved_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
        })
        .eq('id', disputeId);
      if (error) throw error;
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
      const { error } = await supabase
        .from('disputes')
        .update({
          status,
          admin_notes: notes || null,
        })
        .eq('id', disputeId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-disputes-full'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const filtered = disputes.filter(d => {
    const matchSearch = !search ||
      d.job_id.includes(search) ||
      d.client_notes?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCount = disputes.filter(d => d.status === 'open').length;
  const investigatingCount = disputes.filter(d => d.status === 'investigating').length;
  const resolvedCount = disputes.filter(d => d.status === 'resolved').length;
  const totalRefunds = disputes
    .filter(d => d.refund_amount_credits)
    .reduce((s, d) => s + (d.refund_amount_credits || 0), 0);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      open: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
      investigating: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
      resolved: 'bg-success/10 text-success border-success/30',
      escalated: 'bg-destructive/10 text-destructive border-destructive/30',
      dismissed: 'bg-muted text-muted-foreground border-border',
    };
    return (
      <Badge variant="outline" className={map[status] || ''}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/trust-safety" className="hover:text-primary">Trust & Safety</Link>
              <span>/</span>
              <span>Disputes</span>
            </div>
            <h1 className="text-3xl font-bold">Disputes Management</h1>
            <p className="text-muted-foreground mt-1">Review, investigate, and resolve customer disputes</p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Open', count: openCount, color: 'border-l-yellow-500', icon: AlertCircle, iconColor: 'text-yellow-600' },
            { label: 'Investigating', count: investigatingCount, color: 'border-l-blue-500', icon: Clock, iconColor: 'text-blue-600' },
            { label: 'Resolved', count: resolvedCount, color: 'border-l-success', icon: CheckCircle, iconColor: 'text-success' },
            { label: 'Total Refunds', count: `${totalRefunds} cr`, color: 'border-l-purple-500', icon: DollarSign, iconColor: 'text-purple-600' },
          ].map(({ label, count, color, icon: Icon, iconColor }) => (
            <Card key={label} className={`border-l-4 ${color}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full bg-muted flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by job ID or description..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
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

        {/* Disputes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Disputes ({filtered.length})
            </CardTitle>
            <CardDescription>Click a dispute to review and take action</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-40" />
                <p className="text-muted-foreground">No disputes found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedDispute(dispute);
                      setAdminNotes(dispute.admin_notes || '');
                      setResolutionType(dispute.resolution_type || '');
                      setResolutionNotes(dispute.resolution_notes || '');
                      setRefundAmount(dispute.refund_amount_credits?.toString() || '');
                    }}
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs text-muted-foreground">#{dispute.job_id.slice(0, 8)}</span>
                        {getStatusBadge(dispute.status)}
                        {dispute.refund_amount_credits && (
                          <Badge variant="outline" className="text-xs">
                            {dispute.refund_amount_credits} cr refund
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{dispute.client_notes}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        {dispute.job?.client && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {dispute.job.client.first_name} {dispute.job.client.last_name}
                          </span>
                        )}
                        {dispute.job?.cleaner && (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {dispute.job.cleaner.first_name} {dispute.job.cleaner.last_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(dispute.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back */}
        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link to="/admin/trust-safety">← Back to Trust & Safety</Link>
          </Button>
        </div>
      </motion.div>

      {/* Dispute Detail Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Dispute #{selectedDispute?.job_id.slice(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Review the details and take action to resolve this dispute
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-5 mt-2">
              {/* Status + Quick Actions */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedDispute.status)}
                <div className="flex gap-2">
                  {selectedDispute.status === 'open' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus.mutate({ disputeId: selectedDispute.id, status: 'investigating', notes: adminNotes })}
                      disabled={updateStatus.isPending}
                    >
                      Start Investigation
                    </Button>
                  )}
                  {selectedDispute.status !== 'dismissed' && selectedDispute.status !== 'resolved' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => updateStatus.mutate({ disputeId: selectedDispute.id, status: 'dismissed' })}
                      disabled={updateStatus.isPending}
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>

              {/* Job Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Client</p>
                  <p className="font-medium text-sm">
                    {selectedDispute.job?.client?.first_name} {selectedDispute.job?.client?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cleaner</p>
                  <p className="font-medium text-sm">
                    {selectedDispute.job?.cleaner?.first_name} {selectedDispute.job?.cleaner?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Job Type</p>
                  <p className="font-medium text-sm capitalize">
                    {selectedDispute.job?.cleaning_type?.replace('_', ' ')} Clean
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Credits in Escrow</p>
                  <p className="font-medium text-sm text-warning">
                    {selectedDispute.job?.escrow_credits_reserved || 0} credits
                  </p>
                </div>
              </div>

              {/* Client Notes */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Client's Description</Label>
                <div className="p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                  {selectedDispute.client_notes || 'No description provided'}
                </div>
              </div>

              <Separator />

              {/* Admin Actions */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resolution
                </h4>

                <div className="space-y-2">
                  <Label>Resolution Type</Label>
                  <Select value={resolutionType} onValueChange={setResolutionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_refund">Full Refund to Client</SelectItem>
                      <SelectItem value="partial_refund">Partial Refund</SelectItem>
                      <SelectItem value="no_refund">No Refund — Cleaner Paid</SelectItem>
                      <SelectItem value="credit_bonus">Credit Bonus to Client</SelectItem>
                      <SelectItem value="cleaner_warning">Cleaner Warning Issued</SelectItem>
                      <SelectItem value="cleaner_suspended">Cleaner Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(resolutionType === 'partial_refund' || resolutionType === 'full_refund' || resolutionType === 'credit_bonus') && (
                  <div className="space-y-2">
                    <Label>Refund/Credit Amount</Label>
                    <Input
                      type="number"
                      placeholder="Credits..."
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Resolution Notes (visible to parties)</Label>
                  <Textarea
                    placeholder="Explain the decision..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Internal Admin Notes (private)</Label>
                  <Textarea
                    placeholder="Internal notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => resolveDispute.mutate({
                      disputeId: selectedDispute.id,
                      type: resolutionType,
                      notes: resolutionNotes,
                      refund: Number(refundAmount) || 0,
                    })}
                    disabled={resolveDispute.isPending || !resolutionType}
                  >
                    {resolveDispute.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Resolve Dispute
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedDispute(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDisputes;
