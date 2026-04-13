import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, CheckCircle2, Repeat2, History, Search, Star, Shield, MapPin, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useClientJobs } from "@/hooks/useJob";
import { motion } from "framer-motion";

type TabValue = "upcoming" | "in_progress" | "completed" | "recurring" | "history";

const statusMap: Record<string, { label: string; class: string }> = {
  created: { label: "Pending", class: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", class: "bg-muted text-muted-foreground" },
  confirmed: { label: "Confirmed", class: "bg-primary/10 text-primary border-primary/20" },
  in_progress: { label: "In Progress", class: "bg-success/10 text-success border-success/20" },
  completed: { label: "Completed", class: "bg-success/10 text-success border-success/20" },
  cancelled: { label: "Cancelled", class: "bg-destructive/10 text-destructive border-destructive/20" },
  disputed: { label: "Disputed", class: "bg-warning/10 text-warning border-warning/20" },
};

export default function MyCleanings() {
  const [tab, setTab] = useState<TabValue>("upcoming");
  const { data: jobs, isLoading } = useClientJobs();

  const upcoming = jobs?.filter(j => ["created", "pending", "confirmed"].includes(j.status)) ?? [];
  const inProgress = jobs?.filter(j => j.status === "in_progress") ?? [];
  const completed = jobs?.filter(j => j.status === "completed") ?? [];
  const history = jobs ?? [];

  return (
    <main className="flex-1 bg-background min-h-screen">
      <Helmet>
        <title>My Cleanings | PureTask</title>
        <meta name="description" content="Manage your upcoming, active, and past cleanings." />
      </Helmet>

      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Cleanings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all your bookings in one place.</p>
        </motion.div>

        <Tabs value={tab} onValueChange={v => setTab(v as TabValue)}>
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
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}</div>
          ) : (
            <>
              <TabsContent value="upcoming">
                <JobList jobs={upcoming} emptyMessage="No upcoming cleanings" emptyDescription="Book a cleaning and it will show up here." emptyAction="/book" emptyActionLabel="Book a Cleaning" showActions />
              </TabsContent>
              <TabsContent value="in_progress">
                <JobList jobs={inProgress} emptyMessage="No cleanings in progress" emptyDescription="Active cleanings will appear here." showLiveTimer />
              </TabsContent>
              <TabsContent value="completed">
                <JobList jobs={completed} emptyMessage="No completed cleanings yet" emptyDescription="Once a cleaner finishes, you'll review and approve here." showApprovalStatus />
              </TabsContent>
              <TabsContent value="recurring">
                <EmptyState icon={Repeat2} message="No recurring plans yet" description="Set up a recurring cleaning to save time and ensure consistency." action="/book" actionLabel="Book Recurring" />
              </TabsContent>
              <TabsContent value="history">
                <JobList jobs={history} emptyMessage="No cleaning history" emptyDescription="Your completed bookings and their receipts will live here." />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </main>
  );
}

function JobList({ jobs, emptyMessage, emptyDescription, emptyAction, emptyActionLabel, showActions, showLiveTimer, showApprovalStatus }: {
  jobs: any[];
  emptyMessage: string;
  emptyDescription?: string;
  emptyAction?: string;
  emptyActionLabel?: string;
  showActions?: boolean;
  showLiveTimer?: boolean;
  showApprovalStatus?: boolean;
}) {
  if (!jobs.length) {
    return <EmptyState icon={Search} message={emptyMessage} description={emptyDescription} action={emptyAction} actionLabel={emptyActionLabel} />;
  }

  return (
    <div className="space-y-3">
      {jobs.map((job, i) => {
        const cleanerName = job.cleaner ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() || "Cleaner" : "Finding cleaner…";
        const serviceType = (job.cleaning_type || "standard").replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        const status = statusMap[job.status] ?? { label: job.status, class: "bg-muted text-muted-foreground" };
        const needsApproval = job.status === 'completed' && job.final_charge_credits == null;

        return (
          <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Link to={`/my-cleanings/${job.id}`}>
              <Card className="hover:shadow-card hover:border-primary/20 transition-all cursor-pointer">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                      {cleanerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{cleanerName}</p>
                        <Badge variant="outline" className={`text-[10px] h-5 px-2 font-medium border ${status.class}`}>{status.label}</Badge>
                        {needsApproval && <Badge className="bg-warning text-warning-foreground text-[10px] h-5 px-2">Review</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> {serviceType}</span>
                        {job.scheduled_start_at && <span>{format(new Date(job.scheduled_start_at), "EEE, MMM d · h:mm a")}</span>}
                        {job.estimated_hours && <span><Clock className="h-3 w-3 inline mr-0.5" />{job.estimated_hours}h</span>}
                      </div>
                      {job.escrow_credits_reserved != null && job.escrow_credits_reserved > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">${job.escrow_credits_reserved} credits held</p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

function EmptyState({ icon: Icon, message, description, action, actionLabel }: {
  icon: any; message: string; description?: string; action?: string; actionLabel?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-10 flex flex-col items-center gap-3 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
          <Icon className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <div>
          <p className="font-semibold">{message}</p>
          {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
        </div>
        {action && actionLabel && (
          <Button size="sm" className="mt-2" asChild>
            <Link to={action}>{actionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
