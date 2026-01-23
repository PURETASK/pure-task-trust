import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Shield, CheckCircle2, XCircle, Clock, Eye, Search,
  FileText, User, Calendar, AlertTriangle, Loader2, RefreshCw
} from 'lucide-react';
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
  cleaner_profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    user_id: string;
    profile_photo_url: string | null;
  } | null;
}

export default function AdminIDVerifications() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<IDVerification | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  // Fetch ID verifications with cleaner info
  const { data: verifications, isLoading, refetch } = useQuery({
    queryKey: ['admin-id-verifications', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('id_verifications')
        .select(`
          *,
          cleaner_profiles (
            id,
            first_name,
            last_name,
            user_id,
            profile_photo_url
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IDVerification[];
    },
  });

  // Update verification status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: VerificationStatus; notes?: string }) => {
      const updateData: Record<string, any> = { status };
      
      if (status === 'verified') {
        updateData.verified_at = new Date().toISOString();
        // Set expiry to 5 years from now for ID documents
        updateData.expires_at = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { error } = await supabase
        .from('id_verifications')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-id-verifications'] });
      toast.success(`Verification ${variables.status === 'verified' ? 'approved' : 'rejected'} successfully`);
      setIsReviewDialogOpen(false);
      setSelectedVerification(null);
      setReviewNotes('');
    },
    onError: (error) => {
      toast.error('Failed to update verification status');
      console.error(error);
    },
  });

  // Get signed URL for document viewing
  const getDocumentUrl = async (documentPath: string) => {
    const { data, error } = await supabase.storage
      .from('identity-documents')
      .createSignedUrl(documentPath, 300); // 5 minute expiry

    if (error) {
      toast.error('Failed to load document');
      return null;
    }
    return data.signedUrl;
  };

  const handleViewDocument = async (verification: IDVerification) => {
    if (!verification.document_url) {
      toast.error('No document available');
      return;
    }

    const url = await getDocumentUrl(verification.document_url);
    if (url) {
      setDocumentUrl(url);
      setSelectedVerification(verification);
      setIsReviewDialogOpen(true);
    }
  };

  const handleApprove = () => {
    if (!selectedVerification) return;
    updateStatusMutation.mutate({ 
      id: selectedVerification.id, 
      status: 'verified',
      notes: reviewNotes 
    });
  };

  const handleReject = () => {
    if (!selectedVerification) return;
    updateStatusMutation.mutate({ 
      id: selectedVerification.id, 
      status: 'failed',
      notes: reviewNotes 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-primary/10 text-primary border-primary/20"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredVerifications = verifications?.filter((v) => {
    if (!searchQuery) return true;
    const cleanerName = `${v.cleaner_profiles?.first_name || ''} ${v.cleaner_profiles?.last_name || ''}`.toLowerCase();
    return cleanerName.includes(searchQuery.toLowerCase()) || 
           v.document_type.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pendingCount = verifications?.filter(v => v.status === 'pending').length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[600px] w-full" />
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
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              ID Verifications
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and approve cleaner identity documents
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            {pendingCount > 0 && (
              <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {pendingCount} pending review
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or document type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
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
        </motion.div>

        {/* Verifications Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Verification Requests
              </CardTitle>
              <CardDescription>
                {filteredVerifications?.length || 0} verification(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!filteredVerifications || filteredVerifications.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
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
                      {filteredVerifications.map((verification) => (
                        <TableRow key={verification.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {verification.cleaner_profiles?.profile_photo_url ? (
                                <img
                                  src={verification.cleaner_profiles.profile_photo_url}
                                  alt="Profile"
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">
                                  {verification.cleaner_profiles?.first_name || 'Unknown'}{' '}
                                  {verification.cleaner_profiles?.last_name || ''}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  ID: {verification.cleaner_id.slice(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {verification.document_type.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(verification.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(verification.created_at), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {verification.expires_at ? (
                              <span className="text-sm">
                                {format(new Date(verification.expires_at), 'MMM d, yyyy')}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(verification)}
                              disabled={!verification.document_url}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
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
        </motion.div>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Review ID Document
              </DialogTitle>
              <DialogDescription>
                Review the submitted document and approve or reject the verification.
              </DialogDescription>
            </DialogHeader>

            {selectedVerification && (
              <div className="space-y-6">
                {/* Cleaner Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  {selectedVerification.cleaner_profiles?.profile_photo_url ? (
                    <img
                      src={selectedVerification.cleaner_profiles.profile_photo_url}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold">
                      {selectedVerification.cleaner_profiles?.first_name || 'Unknown'}{' '}
                      {selectedVerification.cleaner_profiles?.last_name || ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Document: {selectedVerification.document_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {format(new Date(selectedVerification.created_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Document Preview */}
                {documentUrl && (
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={documentUrl}
                      alt="ID Document"
                      className="w-full max-h-[400px] object-contain bg-black/5"
                    />
                  </div>
                )}

                {/* Review Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Review Notes (optional)</label>
                  <Textarea
                    placeholder="Add any notes about this verification..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsReviewDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
