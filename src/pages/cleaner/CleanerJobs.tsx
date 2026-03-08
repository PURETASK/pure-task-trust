import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Calendar, MessageCircle, Play, Eye, ArrowRight, DollarSign, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { useCleanerJobs } from "@/hooks/useCleanerProfile";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { Link } from "react-router-dom";

type SortKey = "date_asc" | "date_desc" | "earnings_desc";

const TIER_FEE: Record<string, number> = {
  platinum: 0.15,
  gold: 0.16,
  silver: 0.18,
  bronze: 0.20,
};

export default function CleanerJobs() {
  const { jobs, isLoading } = useCleanerJobs();
  const { profile } = useCleanerProfile();
  const [sort, setSort] = useState<SortKey>("date_asc");

  const tier = profile?.tier || "bronze";
  const feeRate = TIER_FEE[tier] ?? 0.20;
  const getNet = (gross: number) => Math.round(gross * (1 - feeRate));

  const activeJobs = jobs.filter(j => ['confirmed', 'in_progress', 'on_way', 'arrived'].includes(j.status));
  const pendingJobs = jobs.filter(j => ['pending', 'created'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');

  const sortJobs = (list: typeof jobs) => {
    return [...list].sort((a, b) => {
      if (sort === "date_asc") return new Date(a.scheduled_start_at || 0).getTime() - new Date(b.scheduled_start_at || 0).getTime();
      if (sort === "date_desc") return new Date(b.scheduled_start_at || 0).getTime() - new Date(a.scheduled_start_at || 0).getTime();
      if (sort === "earnings_desc") return (b.escrow_credits_reserved || 0) - (a.escrow_credits_reserved || 0);
      return 0;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': case 'created': return <Badge variant="warning">Pending</Badge>;
      case 'confirmed': return <Badge variant="default">Confirmed</Badge>;
      case 'on_way': return <Badge className="bg-primary text-primary-foreground">On the Way</Badge>;
      case 'arrived': return <Badge className="bg-accent text-accent-foreground">Arrived</Badge>;
      case 'in_progress': return <Badge className="bg-primary/80 text-primary-foreground">In Progress</Badge>;
      case 'completed': return <Badge variant="success">Completed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getNextAction = (job: { id: string; status: string }) => {
    switch (job.status) {
      case 'confirmed':
        return (
          <Button size="sm" asChild>
            <Link to={`/cleaner/jobs/${job.id}`}>
              <Play className="h-4 w-4 mr-2" />
              Start Job
            </Link>
          </Button>
        );
      case 'in_progress':
        return (
          <Button size="sm" variant="default" asChild>
            <Link to={`/cleaner/jobs/${job.id}`}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue
            </Link>
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="outline" asChild>
            <Link to={`/cleaner/jobs/${job.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </Button>
        );
    }
  };

  const getCleaningTypeLabel = (type: string) => {
    switch (type) {
      case 'deep': return 'Deep Clean';
      case 'move_out': return 'Move-out Clean';
      default: return 'Standard Clean';
    }
  };

  const JobCard = ({ job }: { job: typeof jobs[0] }) => {
    const gross = job.escrow_credits_reserved || 0;
    const net = getNet(gross);
    return (
      <Card className="hover:shadow-elevated transition-all">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 className="font-semibold">{getCleaningTypeLabel(job.cleaning_type)}</h3>
                {getStatusBadge(job.status)}
                {net > 0 && (
                  <span className="text-sm font-semibold text-success flex items-center gap-0.5">
                    <DollarSign className="h-3.5 w-3.5" />{net}
                    <span className="text-xs text-muted-foreground font-normal ml-0.5">you earn</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Client {job.client?.first_name ? `${job.client.first_name.charAt(0)}.` : '(Private)'}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d') : 'TBD'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'h:mm a') : 'TBD'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.estimated_hours || 2}h
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <Link to={`/cleaner/messages?job=${job.id}`}>
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/cleaner/jobs/${job.id}`}>Details</Link>
              </Button>
              {getNextAction(job)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SortControl = () => (
    <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
      <SelectTrigger className="w-44 h-9 text-sm">
        <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="date_asc">Date: Earliest first</SelectItem>
        <SelectItem value="date_desc">Date: Latest first</SelectItem>
        <SelectItem value="earnings_desc">Earnings: Highest first</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">My Jobs</h1>
            <p className="text-muted-foreground mt-1">Manage your accepted bookings</p>
          </div>
          <SortControl />
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({activeJobs.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingJobs.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
            ) : activeJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No active jobs</p>
                  <Button variant="link" asChild>
                    <Link to="/cleaner/marketplace">Browse marketplace →</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">{sortJobs(activeJobs).map((job) => <JobCard key={job.id} job={job} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {isLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : pendingJobs.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No pending jobs</CardContent></Card>
            ) : (
              <div className="space-y-4">{sortJobs(pendingJobs).map((job) => <JobCard key={job.id} job={job} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {isLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : completedJobs.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No completed jobs yet</CardContent></Card>
            ) : (
              <div className="space-y-4">{sortJobs(completedJobs).map((job) => <JobCard key={job.id} job={job} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CleanerLayout>
  );
}
