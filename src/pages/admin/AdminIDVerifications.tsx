import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, XCircle, Clock, Eye, Search, FileText, User, Calendar, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

type VerificationStatus = 'pending' | 'verified' | 'failed';

interface IDVerification {
  id: string;
  cleaner_id: string;
  document_type: string;
  document_url?: string | null;
  status: string;
  verified_at: string | null;
  expires_at: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
  cleaner_profiles: { id: string; first_name: string | null; last_name: string | null; user_id: string; profile_photo_url: string | null; } | null;
}

export default function AdminIDVerifications() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<IDVerification | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const { data: verifications, isLoading, refetch } = useQuery({
    queryKey: ['admin-id-verifications', statusFilter],
    queryFn: async () => {
      let query = supabase.from('id_verifications').select(`*, cleaner_profiles(id, first_name, last_name, user_id, profile_photo_url)`).order('created_at', { ascending: false });
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data as IDVerification[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: VerificationStatus; notes?: string }) => {
      const updateData: Record<string, any> = { status };
      if (status === 'verified') {
        updateData.verified_at = new Date().toISOString();
        updateData.expires_at = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString();
      }
      const { error } = await supabase.from('id_verifications').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-id-verifications'] });
      toast.success(`Verification ${variables.status === 'verified' ? 'approved' : 'rejected'}`);
      setIsReviewDialogOpen(false);
      setSelectedVerification(null);
      setReviewNotes('');
    },
    onError: () => toast.error('Failed to update verification status'),
  });

  const getDocumentUrl = async (documentPath: string) => {
    const { data, error } = await supabase.storage.from('identity-documents').createSignedUrl(documentPath, 300);
    if (error) { toast.error('Failed to load document'); return null; }
    return data.signedUrl;
  };

  const handleViewDocument = async (verification: IDVerification) => {
    if (!verification.document_url) { toast.error('No document available'); return; }
    const url = await getDocumentUrl(verification.document_url);
    if (url) { setDocumentUrl(url); setSelectedVerification(verification); setIsReviewDialogOpen(true); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'failed': return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredVerifications = verifications?.filter((v) => {
    if (!searchQuery) return true;
    const cleanerName = `${v.cleaner_profiles?.first_name || ''} ${v.cleaner_profiles?.last_name || ''}`.toLowerCase();
    return cleanerName.includes(searchQuery.toLowerCase()) || v.document_type.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pendingCount = verifications?.filter(v => v.status === 'pending').length || 0;
  const verifiedCount = verifications?.filter(v => v.status === 'verified').length || 0;
  const failedCount = verifications?.filter(v => v.status === 'failed').length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">ID Verifications</h1>
                  {pendingCount > 0 && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />{pendingCount} pending
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Review and approve cleaner identity documents</p>
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
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pending Review', count: pendingCount, color: 'border-warning/30 bg-warning/5', textColor: 'text-warning', Icon: Clock },
            { label: 'Verified', count: verifiedCount, color: 'border-success/30 bg-success/5', textColor: 'text-success', Icon: CheckCircle2 },
            { label: 'Rejected', count: failedCount, color: 'border-destructive/30 bg-destructive/5', textColor: 'text-destructive', Icon: XCircle },
          ].map(({ label, count, color, textColor, Icon }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`border ${color}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${textColor}`} />
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
                <Input placeholder="Search by name or document type..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="failed">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5" /> Verification Requests ({filteredVerifications?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : !filteredVerifications || filteredVerifications.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">No verifications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cleaner</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVerifications.map((v) => (
                      <TableRow key={v.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {v.cleaner_profiles?.profile_photo_url ? (
                              <img src={v.cleaner_profiles.profile_photo_url} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">{v.cleaner_profiles?.first_name || 'Unknown'} {v.cleaner_profiles?.last_name || ''}</p>
                              <p className="text-xs text-muted-foreground font-mono">{v.cleaner_id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="capitalize text-xs">{v.document_type.replace(/_/g, ' ')}</Badge></TableCell>
                        <TableCell>{getStatusBadge(v.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(v.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{v.expires_at ? format(new Date(v.expires_at), 'MMM d, yyyy') : '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewDocument(v)} disabled={!v.document_url} className="text-xs gap-1">
                            <Eye className="h-3.5 w-3.5" /> Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Review ID Document</DialogTitle>
            <DialogDescription>Review the submitted document and approve or reject.</DialogDescription>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                {selectedVerification.cleaner_profiles?.profile_photo_url ? (
                  <img src={selectedVerification.cleaner_profiles.profile_photo_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{selectedVerification.cleaner_profiles?.first_name} {selectedVerification.cleaner_profiles?.last_name}</p>
                  <p className="text-sm text-muted-foreground">Document: {selectedVerification.document_type.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">Submitted: {format(new Date(selectedVerification.created_at), 'MMMM d, yyyy')}</p>
                </div>
              </div>
              {documentUrl && (
                <div className="border rounded-xl overflow-hidden">
                  <img src={documentUrl} alt="ID Document" className="w-full max-h-[400px] object-contain bg-black/5" />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes (optional)</label>
                <Textarea placeholder="Add notes..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedVerification && updateStatusMutation.mutate({ id: selectedVerification.id, status: 'failed', notes: reviewNotes })} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              Reject
            </Button>
            <Button onClick={() => selectedVerification && updateStatusMutation.mutate({ id: selectedVerification.id, status: 'verified', notes: reviewNotes })} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
