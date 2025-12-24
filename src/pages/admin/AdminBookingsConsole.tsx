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
  Loader2, Search, RefreshCw, UserX, XCircle, CreditCard, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Job {
  id: string;
  status: string;
  cleaning_type: string;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  estimated_hours: number | null;
  credit_charge_credits: number | null;
  notes: string | null;
  cleaner_id: string;
  client_id: string;
  created_at: string | null;
  cleaner?: {
    first_name: string | null;
    last_name: string | null;
  };
  client?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export default function AdminBookingsConsole() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [actionData, setActionData] = useState<Record<string, string>>({});

  // Fetch all jobs
  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          cleaner:cleaner_profiles!jobs_cleaner_id_fkey(first_name, last_name),
          client:client_profiles!jobs_client_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Job[];
    }
  });

  // Admin action mutation
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
      toast.success(result.message || 'Action completed successfully');
      setActionModal(null);
      setActionData({});
      setSelectedJob(null);
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const filteredJobs = jobs?.filter(job => 
    job.id.includes(searchTerm) ||
    job.cleaner?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.client?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.status.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-success/10 text-success border-success/30',
      approved: 'bg-success/10 text-success border-success/30',
      in_progress: 'bg-primary/10 text-primary border-primary/30',
      scheduled: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
      pending: 'bg-warning/10 text-warning border-warning/30',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
      disputed: 'bg-orange-500/10 text-orange-600 border-orange-500/30'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const handleAction = (action: string) => {
    if (!selectedJob) return;
    adminAction.mutate({ 
      action, 
      jobId: selectedJob.id, 
      data: actionData 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Bookings Console</h1>
              <p className="text-muted-foreground">Manage all platform bookings</p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
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
        </motion.div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.02 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm text-muted-foreground">
                          #{job.id.slice(0, 8)}
                        </span>
                        <Badge variant="outline" className={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary">
                          {job.cleaning_type.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {job.scheduled_start_at 
                            ? format(new Date(job.scheduled_start_at), 'MMM dd, yyyy HH:mm')
                            : 'Not scheduled'}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {job.estimated_hours || 0} hours
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          Client: {job.client?.first_name || 'Unknown'} {job.client?.last_name || ''}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          Cleaner: {job.cleaner?.first_name || 'Unassigned'} {job.cleaner?.last_name || ''}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          {job.credit_charge_credits || 0} credits
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedJob(job)}
                      variant="outline"
                    >
                      Manage <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredJobs.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No bookings found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Actions Dialog */}
        <Dialog open={!!selectedJob && !actionModal} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Booking #{selectedJob?.id.slice(0, 8)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setActionModal('reschedule')}
                  variant="outline"
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Reschedule
                </Button>
                <Button
                  onClick={() => setActionModal('reassign')}
                  variant="outline"
                  className="justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Reassign Cleaner
                </Button>
                <Button
                  onClick={() => setActionModal('cancel')}
                  variant="outline"
                  className="justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Booking
                </Button>
                <Button
                  onClick={() => setActionModal('refund')}
                  variant="outline"
                  className="justify-start"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Issue Refund
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reschedule Modal */}
        <Dialog open={actionModal === 'reschedule'} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reschedule Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>New Date</Label>
                <Input
                  type="date"
                  value={actionData.new_date || ''}
                  onChange={(e) => setActionData({ ...actionData, new_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>New Time</Label>
                <Input
                  type="time"
                  value={actionData.new_time || ''}
                  onChange={(e) => setActionData({ ...actionData, new_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  placeholder="Reason for rescheduling..."
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAction('reschedule')}
                  disabled={adminAction.isPending || !actionData.new_date || !actionData.new_time}
                  className="flex-1"
                >
                  {adminAction.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirm Reschedule
                </Button>
                <Button variant="outline" onClick={() => { setActionModal(null); setActionData({}); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reassign Modal */}
        <Dialog open={actionModal === 'reassign'} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reassign Cleaner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>New Cleaner ID</Label>
                <Input
                  placeholder="Enter cleaner ID..."
                  value={actionData.new_cleaner_id || ''}
                  onChange={(e) => setActionData({ ...actionData, new_cleaner_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  placeholder="Reason for reassignment..."
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAction('reassign')}
                  disabled={adminAction.isPending || !actionData.new_cleaner_id}
                  className="flex-1"
                >
                  {adminAction.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirm Reassign
                </Button>
                <Button variant="outline" onClick={() => { setActionModal(null); setActionData({}); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel Modal */}
        <Dialog open={actionModal === 'cancel'} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Warning</p>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone. The booking will be cancelled and credits may be refunded.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cancellation Reason</Label>
                <Textarea
                  placeholder="Reason for cancellation..."
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAction('cancel')}
                  disabled={adminAction.isPending || !actionData.reason}
                  variant="destructive"
                  className="flex-1"
                >
                  {adminAction.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirm Cancel
                </Button>
                <Button variant="outline" onClick={() => { setActionModal(null); setActionData({}); }}>
                  Back
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Refund Modal */}
        <Dialog open={actionModal === 'refund'} onOpenChange={() => { setActionModal(null); setActionData({}); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Refund</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Refund Amount (credits)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={actionData.refund_amount || ''}
                  onChange={(e) => setActionData({ ...actionData, refund_amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  placeholder="Reason for refund..."
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAction('refund')}
                  disabled={adminAction.isPending || !actionData.refund_amount || !actionData.reason}
                  className="flex-1"
                >
                  {adminAction.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirm Refund
                </Button>
                <Button variant="outline" onClick={() => { setActionModal(null); setActionData({}); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
