import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, DollarSign, Calendar, Filter, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AvailableJob {
  id: string;
  cleaning_type: string;
  scheduled_start_at: string | null;
  estimated_hours: number | null;
  escrow_credits_reserved: number | null;
  address: string | null;
  client: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export default function CleanerMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['available-jobs', filter],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          id,
          cleaning_type,
          scheduled_start_at,
          estimated_hours,
          escrow_credits_reserved,
          address,
          client:client_profiles!jobs_client_id_fkey(first_name, last_name)
        `)
        .is('cleaner_id', null)
        .in('status', ['created', 'pending'])
        .order('scheduled_start_at', { ascending: true });

      if (filter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query = query
          .gte('scheduled_start_at', today.toISOString())
          .lt('scheduled_start_at', tomorrow.toISOString());
      } else if (filter === 'week') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        query = query
          .gte('scheduled_start_at', today.toISOString())
          .lt('scheduled_start_at', nextWeek.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as AvailableJob[];
    },
  });

  const acceptJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      // Get cleaner profile
      const { data: cleanerProfile, error: profileError } = await supabase
        .from('cleaner_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw new Error('Cleaner profile not found');

      const { error } = await supabase
        .from('jobs')
        .update({ 
          cleaner_id: cleanerProfile.id,
          status: 'confirmed'
        })
        .eq('id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Job accepted!",
        description: "This job has been added to your schedule.",
      });
      queryClient.invalidateQueries({ queryKey: ['available-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['cleaner-jobs'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to accept job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCleaningTypeLabel = (type: string) => {
    switch (type) {
      case 'deep': return 'Deep Clean';
      case 'move_out': return 'Move-out Clean';
      default: return 'Standard Clean';
    }
  };

  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Marketplace</h1>
            <p className="text-muted-foreground mt-1">Find and accept new cleaning jobs</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'today' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('today')}
            >
              Today
            </Button>
            <Button 
              variant={filter === 'week' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('week')}
            >
              This Week
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No available jobs right now</p>
              <p className="text-sm text-muted-foreground mt-1">Check back later for new opportunities!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-elevated transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{getCleaningTypeLabel(job.cleaning_type)}</h3>
                        <Badge variant="secondary">New</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {job.client?.first_name} {job.client?.last_name}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {job.scheduled_start_at 
                            ? format(new Date(job.scheduled_start_at), 'MMM d, yyyy')
                            : 'Flexible'
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.scheduled_start_at 
                            ? format(new Date(job.scheduled_start_at), 'h:mm a')
                            : 'TBD'
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.estimated_hours || 2}h estimated
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-success">{job.escrow_credits_reserved || 0}</p>
                        <p className="text-xs text-muted-foreground">credits</p>
                      </div>
                      <Button 
                        onClick={() => acceptJobMutation.mutate(job.id)}
                        disabled={acceptJobMutation.isPending}
                      >
                        {acceptJobMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          'Accept Job'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CleanerLayout>
  );
}
