import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, Eye, Calendar, DollarSign, MapPin, User, 
  Download, Filter, Loader2, RefreshCw, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

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
  actual_start_at: string | null;
  actual_end_at: string | null;
  cleaner?: {
    first_name: string | null;
    last_name: string | null;
  };
  client?: {
    first_name: string | null;
    last_name: string | null;
  };
  property?: {
    address_line1: string | null;
    city: string | null;
  } | null;
}

export default function AdminClientJobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Fetch all jobs
  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['admin-client-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          cleaner:cleaner_profiles!jobs_cleaner_id_fkey(first_name, last_name),
          client:client_profiles!jobs_client_id_fkey(first_name, last_name),
          property:properties(address_line1, city)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Job[];
    }
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!jobs) return { total: 0, completed: 0, active: 0, cancelled: 0, totalRevenue: 0, avgPrice: 0 };
    
    const completed = jobs.filter(j => j.status === 'completed' || j.status === 'approved');
    const active = jobs.filter(j => ['scheduled', 'in_progress', 'pending'].includes(j.status));
    const cancelled = jobs.filter(j => j.status === 'cancelled');
    const totalRevenue = completed.reduce((sum, j) => sum + ((j.credit_charge_credits || 0) * 0.15), 0);
    const avgPrice = jobs.length > 0 
      ? jobs.reduce((sum, j) => sum + (j.credit_charge_credits || 0), 0) / jobs.length 
      : 0;

    return {
      total: jobs.length,
      completed: completed.length,
      active: active.length,
      cancelled: cancelled.length,
      totalRevenue: Math.round(totalRevenue),
      avgPrice: Math.round(avgPrice)
    };
  }, [jobs]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    
    let filtered = [...jobs];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.id.toLowerCase().includes(search) ||
        job.client?.first_name?.toLowerCase().includes(search) ||
        job.cleaner?.first_name?.toLowerCase().includes(search) ||
        job.property?.address_line1?.toLowerCase().includes(search) ||
        job.status.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(j => j.status === statusFilter);
    }

    return filtered;
  }, [jobs, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-warning/10 text-warning border-warning/30',
      'scheduled': 'bg-primary/10 text-primary border-primary/30',
      'in_progress': 'bg-primary/10 text-primary border-primary/30',
      'completed': 'bg-success/10 text-success border-success/30',
      'approved': 'bg-success/10 text-success border-success/30',
      'cancelled': 'bg-destructive/10 text-destructive border-destructive/30',
      'disputed': 'bg-warning/10 text-warning border-warning/30'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Client', 'Cleaner', 'Type', 'Hours', 'Credits', 'Status'];
    const rows = filteredJobs.map(j => [
      j.id.slice(0, 8),
      j.scheduled_start_at ? format(new Date(j.scheduled_start_at), 'yyyy-MM-dd HH:mm') : 'N/A',
      `${j.client?.first_name || ''} ${j.client?.last_name || ''}`.trim() || 'Unknown',
      `${j.cleaner?.first_name || ''} ${j.cleaner?.last_name || ''}`.trim() || 'Unassigned',
      j.cleaning_type,
      j.estimated_hours || 0,
      j.credit_charge_credits || 0,
      j.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-jobs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading client jobs...</p>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-poppins font-bold text-gradient-aero flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                Client Jobs
              </h1>
              <p className="text-muted-foreground">
                Comprehensive view of all client bookings and requests
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-5 w-5 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-5 w-5 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.cancelled}</p>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-5 w-5 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.totalRevenue}</p>
              <p className="text-xs text-muted-foreground">Platform Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.avgPrice}</p>
              <p className="text-xs text-muted-foreground">Avg Credits</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, client, cleaner, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Jobs ({filteredJobs.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-muted-foreground">#{job.id.slice(0, 8)}</p>
                        <p className="text-sm font-medium">
                          {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{job.client?.first_name || 'Unknown'} {job.client?.last_name || ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{job.cleaner?.first_name || 'Unassigned'} {job.cleaner?.last_name || ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary">{job.cleaning_type.replace('_', ' ')}</Badge>
                        <span>{job.estimated_hours || 0}h</span>
                        <span className="font-medium">{job.credit_charge_credits || 0} cr</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedJob(job)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredJobs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No jobs found</p>
                  </div>
                )}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Cleaner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow key={job.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">
                          #{job.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          {job.scheduled_start_at 
                            ? format(new Date(job.scheduled_start_at), 'MMM dd, yyyy')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {job.client?.first_name || 'Unknown'} {job.client?.last_name || ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {job.cleaner?.first_name || 'Unassigned'} {job.cleaner?.last_name || ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {job.cleaning_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{job.estimated_hours || 0}h</TableCell>
                        <TableCell>
                          <span className="font-medium">{job.credit_charge_credits || 0}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(job.status)}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredJobs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No jobs found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Job Details Modal */}
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Job Details #{selectedJob?.id.slice(0, 8)}</DialogTitle>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="outline" className={getStatusColor(selectedJob.status)}>
                      {selectedJob.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cleaning Type</p>
                    <p className="font-medium">{selectedJob.cleaning_type.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">
                      {selectedJob.client?.first_name || 'Unknown'} {selectedJob.client?.last_name || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cleaner</p>
                    <p className="font-medium">
                      {selectedJob.cleaner?.first_name || 'Unassigned'} {selectedJob.cleaner?.last_name || ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled Start</p>
                    <p className="font-medium">
                      {selectedJob.scheduled_start_at 
                        ? format(new Date(selectedJob.scheduled_start_at), 'PPP p')
                        : 'Not scheduled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Duration</p>
                    <p className="font-medium">{selectedJob.estimated_hours || 0} hours</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Credits Charged</p>
                    <p className="font-medium text-lg">{selectedJob.credit_charge_credits || 0} credits</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {selectedJob.created_at 
                        ? format(new Date(selectedJob.created_at), 'PPP')
                        : 'Unknown'}
                    </p>
                  </div>
                </div>

                {selectedJob.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="mt-1 p-3 rounded-lg bg-muted">{selectedJob.notes}</p>
                  </div>
                )}

                {selectedJob.property && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </p>
                    <p className="font-medium">
                      {selectedJob.property.address_line1}, {selectedJob.property.city}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
