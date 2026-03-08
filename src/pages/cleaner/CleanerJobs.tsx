import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Calendar, MessageCircle, Play, Eye, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useCleanerJobs } from "@/hooks/useCleanerProfile";
import { Link } from "react-router-dom";

export default function CleanerJobs() {
  const { jobs, isLoading } = useCleanerJobs();

  const activeJobs = jobs.filter(j => ['confirmed', 'in_progress', 'on_way', 'arrived'].includes(j.status));
  const pendingJobs = jobs.filter(j => ['pending', 'created'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'created':
        return <Badge variant="warning">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'on_way':
        return <Badge className="bg-blue-500">On the Way</Badge>;
      case 'arrived':
        return <Badge className="bg-indigo-500">Arrived</Badge>;
      case 'in_progress':
        return <Badge className="bg-violet-500">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // All job actions now go through the detail page for proper GPS verification
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

  const JobCard = ({ job }: { job: typeof jobs[0] }) => (
    <Card className="hover:shadow-elevated transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{getCleaningTypeLabel(job.cleaning_type)}</h3>
              {getStatusBadge(job.status)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {job.client?.first_name} {job.client?.last_name}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {job.scheduled_start_at 
                  ? format(new Date(job.scheduled_start_at), 'MMM d')
                  : 'TBD'
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
                {job.estimated_hours || 2}h
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/cleaner/jobs/${job.id}`}>View Details</Link>
            </Button>
            {getNextAction(job)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Jobs</h1>
          <p className="text-muted-foreground mt-1">Manage your accepted bookings</p>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeJobs.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingJobs.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
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
              <div className="space-y-4">
                {activeJobs.map((job) => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {isLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : pendingJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No pending jobs
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingJobs.map((job) => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {isLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : completedJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No completed jobs yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedJobs.map((job) => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CleanerLayout>
  );
}
