import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, CheckCircle2, Repeat2, History, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useClientJobs } from "@/hooks/useJob";
import { Skeleton } from "@/components/ui/skeleton";

type TabValue = "upcoming" | "in_progress" | "completed" | "recurring" | "history";

export default function MyCleanings() {
  const [tab, setTab] = useState<TabValue>("upcoming");
  const { data: jobs, isLoading } = useClientJobs();

  const upcoming = jobs?.filter((j) => ["created", "pending", "confirmed"].includes(j.status)) ?? [];
  const inProgress = jobs?.filter((j) => j.status === "in_progress") ?? [];
  const completed = jobs?.filter((j) => j.status === "completed") ?? [];
  const history = jobs ?? [];

  return (
    <main className="flex-1 bg-background min-h-screen">
      <Helmet>
        <title>My Cleanings | PureTask</title>
        <meta name="description" content="Manage your upcoming, active, and past cleanings." />
      </Helmet>

      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Cleanings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all your bookings in one place.</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList className="w-full justify-start overflow-x-auto gap-1 bg-muted/50 p-1 rounded-xl mb-6">
            <TabsTrigger value="upcoming" className="gap-1.5 text-xs sm:text-sm rounded-lg">
              <CalendarDays className="h-3.5 w-3.5" /> Upcoming
              {upcoming.length > 0 && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{upcoming.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-1.5 text-xs sm:text-sm rounded-lg">
              <Clock className="h-3.5 w-3.5" /> In Progress
              {inProgress.length > 0 && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{inProgress.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5 text-xs sm:text-sm rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </TabsTrigger>
            <TabsTrigger value="recurring" className="gap-1.5 text-xs sm:text-sm rounded-lg">
              <Repeat2 className="h-3.5 w-3.5" /> Recurring
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs sm:text-sm rounded-lg">
              <History className="h-3.5 w-3.5" /> History
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="upcoming">
                <JobList jobs={upcoming} emptyMessage="No upcoming cleanings" emptyAction="/book" emptyActionLabel="Book a Cleaning" />
              </TabsContent>
              <TabsContent value="in_progress">
                <JobList jobs={inProgress} emptyMessage="No cleanings in progress" />
              </TabsContent>
              <TabsContent value="completed">
                <JobList jobs={completed} emptyMessage="No completed cleanings yet" />
              </TabsContent>
              <TabsContent value="recurring">
                <EmptyState icon={Repeat2} message="No recurring plans yet" description="Set up a recurring cleaning to save time." action="/book" actionLabel="Book Recurring" />
              </TabsContent>
              <TabsContent value="history">
                <JobList jobs={history} emptyMessage="No cleaning history" />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </main>
  );
}

function JobList({ jobs, emptyMessage, emptyAction, emptyActionLabel }: {
  jobs: any[];
  emptyMessage: string;
  emptyAction?: string;
  emptyActionLabel?: string;
}) {
  if (!jobs.length) {
    return <EmptyState icon={Search} message={emptyMessage} action={emptyAction} actionLabel={emptyActionLabel} />;
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const cleanerName = job.cleaner
          ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() || "Cleaner"
          : "Finding cleaner…";
        const serviceType = (job.cleaning_type || "standard").replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

        const statusMap: Record<string, { label: string; class: string }> = {
          created: { label: "Pending", class: "bg-muted text-muted-foreground" },
          pending: { label: "Pending", class: "bg-muted text-muted-foreground" },
          confirmed: { label: "Confirmed", class: "bg-primary/10 text-primary border-primary/20" },
          in_progress: { label: "In Progress", class: "bg-success/10 text-success border-success/20" },
          completed: { label: "Completed", class: "bg-success/10 text-success border-success/20" },
          cancelled: { label: "Cancelled", class: "bg-destructive/10 text-destructive border-destructive/20" },
        };
        const status = statusMap[job.status] ?? { label: job.status, class: "bg-muted text-muted-foreground" };

        return (
          <Link key={job.id} to={`/my-cleanings/${job.id}`}>
            <Card className="hover:shadow-card hover:border-primary/20 transition-all cursor-pointer">
              <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                  {cleanerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">{cleanerName}</p>
                    <Badge variant="outline" className={`text-[10px] h-5 px-2 font-medium border ${status.class}`}>
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="capitalize">{serviceType}</span>
                    {job.scheduled_start_at && (
                      <>
                        <span>•</span>
                        <span>{format(new Date(job.scheduled_start_at), "EEE, MMM d · h:mm a")}</span>
                      </>
                    )}
                    {job.escrow_credits_reserved != null && job.escrow_credits_reserved > 0 && (
                      <>
                        <span>•</span>
                        <span>{job.escrow_credits_reserved} cr held</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function EmptyState({ icon: Icon, message, description, action, actionLabel }: {
  icon: any;
  message: string;
  description?: string;
  action?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{message}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        {action && actionLabel && (
          <Button size="sm" variant="outline" asChild className="mt-1">
            <Link to={action}>{actionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
