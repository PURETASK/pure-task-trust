import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Calendar, User, Clock, DollarSign, AlertCircle, CheckCircle, 
  Loader2, Search, RefreshCw, XCircle, CreditCard, ArrowRight, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { calcJobMoney } from '@/hooks/useJobMoney';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';

interface Job {
  id: string;
  status: string;
  cleaning_type: string;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  final_charge_credits: number | null;
  rush_fee_credits: number | null;
  tip_credits: number | null;
  credit_charge_credits: number | null;
  escrow_credits_reserved: number | null;
  notes: string | null;
  cleaner_id: string;
  client_id: string;
  created_at: string | null;
  cleaner?: { first_name: string | null; last_name: string | null; tier?: string | null };
  client?: { first_name: string | null; last_name: string | null };
}

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

export default function AdminBookingsConsole() {
  const queryClient = useQueryClient();
  const { platformFeePct: feePct, creditToUsdRate } = usePlatformConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [actionData, setActionData] = useState<Record<string, string>>({});

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`*, cleaner:cleaner_profiles!jobs_cleaner_id_fkey(first_name, last_name, tier), client:client_profiles!jobs_client_id_fkey(first_name, last_name)`)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Job[];
    }
  });

  const adminAction = useMutation({
    mutationFn: async ({ action, jobId, data }: { action: string; jobId: string; data: Record<string, string> }) => {
      const { data: result, error } = await supabase.functions.invoke('admin-workflows', {
        body: { action, job_id: jobId, ...data }
      });
      if (error) throw error;
      if (!result.success) throw new Error(result.error || 'Action failed');
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || 'Action completed');
      setActionModal(null);
      setActionData({});
      setSelectedJob(null);
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const allJobs = jobs || [];
  
  const statusCounts: Record<StatusFilter, number> = {
    all: allJobs.length,
    pending: allJobs.filter(j => j.status === 'pending' || j.status === 'created').length,
    confirmed: allJobs.filter(j => j.status === 'confirmed').length,
    in_progress: allJobs.filter(j => j.status === 'in_progress').length,
    completed: allJobs.filter(j => j.status === 'completed').length,
    cancelled: allJobs.filter(j => j.status === 'cancelled').length,
  };

  const filteredJobs = allJobs.filter(job => {
    const matchSearch = !searchTerm ||
      job.id.includes(searchTerm) ||
      job.cleaner?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      job.status === statusFilter ||
      (statusFilter === 'pending' && job.status === 'created');
    return matchSearch && matchStatus;
  });

  // ── CSV Export ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const feeMap = { bronze: feePct('bronze'), silver: feePct('silver'), gold: feePct('gold'), platinum: feePct('platinum') };
    const headers = ['ID', 'Status', 'Type', 'Client', 'Cleaner', 'Scheduled', 'Hours', 'Escrow', 'Charged', 'PlatformFee', 'CleanerNet'];
    const rows = filteredJobs.map(j => {
      const m = calcJobMoney({ ...j, cleaner_tier: j.cleaner?.tier }, { platformFeePct: feeMap, creditToUsdRate });
      return [
        j.id,
        j.status,
        j.cleaning_type,
        `${j.client?.first_name || ''} ${j.client?.last_name || ''}`.trim(),
        `${j.cleaner?.first_name || ''} ${j.cleaner?.last_name || ''}`.trim() || 'Unassigned',
        j.scheduled_start_at ? format(new Date(j.scheduled_start_at), 'yyyy-MM-dd HH:mm') : '',
        j.estimated_hours || '',
        m.escrowHeld || '',
        m.isSettled ? m.totalClientCharge : '',
        m.platformFee || '',
        m.cleanerNet || '',
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredJobs.length} bookings`);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-success/10 text-success border-success/30',
      approved: 'bg-success/10 text-success border-success/30',
      in_progress: 'bg-primary/10 text-primary border-primary/30',
      confirmed: 'bg-primary/10 text-primary border-primary/30',
      pending: 'bg-warning/10 text-warning border-warning/30',
      created: 'bg-warning/10 text-warning border-warning/30',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
      disputed: 'bg-warning/10 text-warning border-warning/30'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const handleAction = (action: string) => {
    if (!selectedJob) return;
    adminAction.mutate({ action, jobId: selectedJob.id, data: actionData });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-poppins font-bold text-gradient-aero">Bookings Console</h1>
              <p className="text-muted-foreground">{filteredJobs.length} of {allJobs.length} bookings</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick-stats bar */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`p-3 rounded-xl border text-center transition-all ${
                statusFilter === s
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <p className="text-xl font-bold">{statusCounts[s]}</p>
              <p className="text-xs capitalize">{s === 'all' ? 'All' : s.replace('_', ' ')}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, client, cleaner, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredJobs.map((job, index) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.015 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-muted-foreground">#{job.id.slice(0, 8)}</span>
                        <Badge variant="outline" className={getStatusColor(job.status)}>{job.status.replace('_', ' ')}</Badge>
                        <Badge variant="secondary">{job.cleaning_type.replace('_', ' ')}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d, HH:mm') : 'TBD'}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {job.estimated_hours || 0}h
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          {job.client?.first_name || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          {job.cleaner?.first_name || '—'} {job.cleaner?.last_name || ''}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <DollarSign className="h-3.5 w-3.5" />
                          {(() => {
                            const m = calcJobMoney(
                              { ...job, cleaner_tier: job.cleaner?.tier },
                              { platformFeePct: { bronze: feePct('bronze'), silver: feePct('silver'), gold: feePct('gold'), platinum: feePct('platinum') }, creditToUsdRate },
                            );
                            return `${m.isSettled ? m.totalClientCharge : m.escrowHeld} cr${m.isSettled ? '' : ' held'}`;
                          })()}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => setSelectedJob(job)} variant="outline" size="sm">
                      Manage <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredJobs.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No bookings found</CardContent></Card>
          )}
        </div>

        {/* Manage Dialog */}
        <Dialog open={!!selectedJob && !actionModal} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Manage Booking #{selectedJob?.id.slice(0, 8)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button onClick={() => setActionModal('reschedule')} variant="outline" className="justify-start">
                <Calendar className="h-4 w-4 mr-2" />Reschedule
              </Button>
              <Button onClick={() => setActionModal('reassign')} variant="outline" className="justify-start">
                <User className="h-4 w-4 mr-2" />Reassign Cleaner
              </Button>
              <Button onClick={() => setActionModal('cancel')} variant="outline" className="justify-start text-destructive border-destructive/30">
                <XCircle className="h-4 w-4 mr-2" />Cancel Booking
              </Button>
              <Button onClick={() => setActionModal('refund')} variant="outline" className="justify-start">
                <CreditCard className="h-4 w-4 mr-2" />Issue Refund
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reschedule */}
        <Dialog open={actionModal === 'reschedule'} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reschedule Booking</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>New Date</Label><Input type="date" value={actionData.new_date || ''} onChange={(e) => setActionData({ ...actionData, new_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>New Time</Label><Input type="time" value={actionData.new_time || ''} onChange={(e) => setActionData({ ...actionData, new_time: e.target.value })} /></div>
              <div className="space-y-2"><Label>Reason</Label><Textarea placeholder="Reason..." value={actionData.reason || ''} onChange={(e) => setActionData({ ...actionData, reason: e.target.value })} /></div>
              <div className="flex gap-3">
                <Button onClick={() => handleAction('reschedule')} disabled={adminAction.isPending || !actionData.new_date} className="flex-1">
                  {adminAction.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Confirm Reschedule
                </Button>
                <Button variant="outline" onClick={() => { setActionModal(null); setActionData({}); }}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reassign */}
        <Dialog open={actionModal === 'reassign'} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reassign Cleaner</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>New Cleaner ID</Label><Input placeholder="Enter cleaner ID..." value={actionData.new_cleaner_id || ''} onChange={(e) => setActionData({ ...actionData, new_cleaner_id: e.target.value })} /></div>
              <div className="space-y-2"><Label>Reason</Label><Textarea placeholder="Reason..." value={actionData.reason || ''} onChange={(e) => setActionData({ ...actionData, reason: e.target.value })} /></div>
              <div className="flex gap-3">
                <Button onClick={() => handleAction('reassign')} disabled={adminAction.isPending || !actionData.new_cleaner_id} className="flex-1">
                  {adminAction.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Confirm Reassign
                </Button>
                <Button variant="outline" onClick={() => { setActionModal(null); setActionData({}); }}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel */}
        <Dialog open={actionModal === 'cancel'} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Cancel Booking</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <p className="text-sm text-muted-foreground">This action cannot be undone. Credits may be refunded.</p>
                </div>
              </div>
              <div className="space-y-2"><Label>Cancellation Reason</Label><Textarea placeholder="Reason..." value={actionData.reason || ''} onChange={(e) => setActionData({ ...actionData, reason: e.target.value })} /></div>
              <div className="flex gap-3">
                <Button onClick={() => handleAction('cancel')} disabled={adminAction.isPending || !actionData.reason} variant="destructive" className="flex-1">
                  {adminAction.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Confirm Cancel
                </Button>
                <Button variant="outline" onClick={() => { setActionModal(null); setActionData({}); }}>Back</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Refund */}
        <Dialog open={actionModal === 'refund'} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Issue Refund</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Refund Amount (credits)</Label><Input type="number" placeholder="Enter amount..." value={actionData.refund_amount || ''} onChange={(e) => setActionData({ ...actionData, refund_amount: e.target.value })} /></div>
              <div className="space-y-2"><Label>Reason</Label><Textarea placeholder="Reason..." value={actionData.reason || ''} onChange={(e) => setActionData({ ...actionData, reason: e.target.value })} /></div>
              <div className="flex gap-3">
                <Button onClick={() => handleAction('refund')} disabled={adminAction.isPending || !actionData.refund_amount} className="flex-1">
                  {adminAction.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Issue Refund
                </Button>
                <Button variant="outline" onClick={() => { setActionModal(null); setActionData({}); }}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
