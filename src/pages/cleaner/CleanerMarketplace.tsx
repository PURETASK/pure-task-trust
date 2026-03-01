import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useMarketplaceJobs } from "@/hooks/useMarketplaceJobs";

export default function CleanerMarketplace() {
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
  const { jobs, isLoading, acceptJob } = useMarketplaceJobs(filter);

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
                        Client {job.client?.first_name ? `${job.client.first_name.charAt(0)}.` : '(Private)'}
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
                        onClick={() => acceptJob.mutate(job.id)}
                        disabled={acceptJob.isPending}
                      >
                        {acceptJob.isPending ? (
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
