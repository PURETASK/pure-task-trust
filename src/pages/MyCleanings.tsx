import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, CheckCircle2, Repeat2, History, Star, Sparkles, ArrowRight, Pause, Play, X, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useClientJobs } from "@/hooks/useJob";
import { useRecurringBookings, RecurringBooking } from "@/hooks/useRecurringBookings";
import { motion } from "framer-motion";

type TabValue = "upcoming" | "in_progress" | "completed" | "recurring" | "history";

const PALETTES = ["blue", "green", "amber", "purple"] as const;

const statusMap: Record<string, { label: string; pill: string }> = {
  created: { label: "Pending", pill: "palette-pill-amber" },
  pending: { label: "Pending", pill: "palette-pill-amber" },
  confirmed: { label: "Confirmed", pill: "palette-pill-blue" },
  in_progress: { label: "In Progress", pill: "palette-pill-green" },
  completed: { label: "Completed", pill: "palette-pill-green" },
  cancelled: { label: "Cancelled", pill: "bg-destructive/10 text-destructive border-2 border-destructive/30" },
  disputed: { label: "Disputed", pill: "palette-pill-amber" },
};

const f = (delay = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.3 } });

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
        <motion.div {...f(0)} className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="palette-icon palette-icon-blue h-10 w-10 sm:h-12 sm:w-12">
              <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">My Cleanings</h1>
              <p className="text-sm text-muted-foreground">Manage all your bookings in one place.</p>
            </div>
          </div>
          <Button asChild className="rounded-xl gap-1.5 hidden sm:flex">
            <Link to="/book"><Plus className="h-4 w-4" /> Book New</Link>
          </Button>
        </motion.div>

        <Tabs value={tab} onValueChange={v => setTab(v as TabValue)}>
          <TabsList className="w-full justify-start overflow-x-auto gap-1 bg-muted/50 p-1.5 rounded-3xl mb-6 border-2 border-[hsl(var(--pt-blue-deep))]">
            <TabsTrigger value="upcoming" className="gap-1.5 text-xs sm:text-sm rounded-2xl">
              <CalendarDays className="h-3.5 w-3.5" /> Upcoming
              {upcoming.length > 0 && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{upcoming.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-1.5 text-xs sm:text-sm rounded-2xl">
              <Clock className="h-3.5 w-3.5" /> In Progress
              {inProgress.length > 0 && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{inProgress.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5 text-xs sm:text-sm rounded-2xl">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs sm:text-sm rounded-2xl">
              <History className="h-3.5 w-3.5" /> History
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-3xl" />)}</div>
          ) : (
            <>
              <TabsContent value="upcoming">
                <JobList jobs={upcoming} emptyIcon={CalendarDays} emptyMessage="No upcoming cleanings" emptyDescription="Book a cleaning and it will show up here." emptyAction="/book" emptyActionLabel="Book a Cleaning" emptyPalette="blue" />
              </TabsContent>
              <TabsContent value="in_progress">
                <JobList jobs={inProgress} emptyIcon={Clock} emptyMessage="No cleanings in progress" emptyDescription="Active cleanings will appear here once your cleaner checks in." emptyPalette="green" />
              </TabsContent>
              <TabsContent value="completed">
                <JobList jobs={completed} emptyIcon={CheckCircle2} emptyMessage="No completed cleanings yet" emptyDescription="Once a cleaner finishes, you'll review and approve here." emptyPalette="amber" />
              </TabsContent>
              <TabsContent value="history">
                <JobList jobs={history} emptyIcon={History} emptyMessage="No cleaning history" emptyDescription="Your completed bookings and receipts will live here." emptyPalette="purple" />
              </TabsContent>
            </>
          )}
        </Tabs>

        <div className="sm:hidden mt-6">
          <Button asChild className="w-full rounded-xl gap-1.5" size="lg">
            <Link to="/book"><Plus className="h-4 w-4" /> Book a Cleaning</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

/* ── JOB LIST ──────────────────────────────────────────────────── */
function JobList({ jobs, emptyIcon: EmptyIcon, emptyMessage, emptyDescription, emptyAction, emptyActionLabel, emptyPalette = "blue" }: {
  jobs: any[];
  emptyIcon: any;
  emptyMessage: string;
  emptyDescription?: string;
  emptyAction?: string;
  emptyActionLabel?: string;
  emptyPalette?: typeof PALETTES[number];
}) {
  if (!jobs.length) {
    return <EmptyState icon={EmptyIcon} message={emptyMessage} description={emptyDescription} action={emptyAction} actionLabel={emptyActionLabel} palette={emptyPalette} />;
  }

  return (
    <div className="space-y-3">
      {jobs.map((job, i) => {
        const cleanerName = job.cleaner ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() || "Cleaner" : "Finding cleaner…";
        const serviceType = (job.cleaning_type || "standard").replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        const status = statusMap[job.status] ?? { label: job.status, pill: "palette-pill-blue" };
        const needsApproval = job.status === 'completed' && job.final_charge_credits == null;
        const palette = PALETTES[i % 4];

        return (
          <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Link to={`/my-cleanings/${job.id}`}>
              <div className={`palette-card palette-card-${palette} flex items-center gap-4 p-4 sm:p-5 hover:shadow-elevated transition-all cursor-pointer group`}>
                <div className={`palette-icon palette-icon-${palette} h-12 w-12 font-bold text-sm`}>
                  {cleanerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold truncate">{cleanerName}</p>
                    <span className={`palette-pill ${status.pill} text-[10px] h-5 px-2`}>{status.label}</span>
                    {needsApproval && <span className="palette-pill palette-pill-amber text-[10px] h-5 px-2">Review</span>}
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
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── RECURRING PLANS ───────────────────────────────────────────── */
function RecurringPlansList({ plans, isLoading }: { plans: RecurringBooking[]; isLoading: boolean }) {
  if (isLoading) {
    return <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}</div>;
  }

  if (!plans.length) {
    return (
      <EmptyState
        icon={Repeat2}
        message="No recurring plans yet"
        description="Set up a recurring cleaning to save time and never miss a session."
        action="/book"
        actionLabel="Book Recurring Cleaning"
        palette="purple"
      />
    );
  }

  const freqLabel: Record<string, string> = {
    weekly: "Every week", biweekly: "Every 2 weeks", monthly: "Every month", every_4_weeks: "Every 4 weeks",
  };

  const dayLabel = (day: number | null) => {
    if (day == null) return "";
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day] || "";
  };

  const statusStyles: Record<string, { label: string; pill: string }> = {
    active: { label: "Active", pill: "palette-pill-green" },
    paused: { label: "Paused", pill: "palette-pill-amber" },
    cancelled: { label: "Cancelled", pill: "bg-destructive/10 text-destructive border-2 border-destructive/30" },
  };

  return (
    <div className="space-y-3">
      {plans.map((plan, i) => {
        const cleanerName = plan.cleaner
          ? `${plan.cleaner.first_name || ""} ${plan.cleaner.last_name || ""}`.trim() || "Cleaner"
          : "Auto-matched";
        const st = statusStyles[plan.status] || statusStyles.active;
        const type = (plan.cleaning_type || "standard").replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        const palette = PALETTES[i % 4];

        return (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <div className={`palette-card palette-card-${palette} p-4 sm:p-5 hover:shadow-elevated transition-all`}>
              <div className="flex items-start gap-4">
                <div className={`palette-icon palette-icon-${palette} h-12 w-12`}>
                  <Repeat2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold">{type}</p>
                    <span className={`palette-pill ${st.pill} text-[10px] h-5 px-2`}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{freqLabel[plan.frequency] || plan.frequency}</span>
                    {plan.day_of_week != null && <span>{dayLabel(plan.day_of_week)}s</span>}
                    {plan.preferred_time && <span>at {plan.preferred_time}</span>}
                    <span>· {cleanerName}</span>
                  </div>
                  {plan.next_job_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Next: {format(new Date(plan.next_job_date), "EEE, MMM d")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.address}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-lg">${plan.credit_amount}</p>
                  <p className="text-[10px] text-muted-foreground">per session</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t-2 border-border/40">
                {plan.status === 'active' && (
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl">
                    <Pause className="h-3 w-3" /> Pause
                  </Button>
                )}
                {plan.status === 'paused' && (
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl palette-label-green">
                    <Play className="h-3 w-3" /> Resume
                  </Button>
                )}
                {plan.status !== 'cancelled' && (
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs rounded-xl text-destructive hover:text-destructive">
                    <X className="h-3 w-3" /> Cancel Plan
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── EMPTY STATE ───────────────────────────────────────────────── */
function EmptyState({ icon: Icon, message, description, action, actionLabel, palette = "blue" }: {
  icon: any; message: string; description?: string; action?: string; actionLabel?: string; palette?: typeof PALETTES[number];
}) {
  return (
    <div className={`py-16 text-center palette-card palette-card-${palette} palette-card-dashed`}>
      <div className={`palette-icon palette-icon-${palette} h-16 w-16 mx-auto mb-4`}>
        <Icon className="h-8 w-8" />
      </div>
      <p className="font-bold text-lg">{message}</p>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>}
      {action && actionLabel && (
        <Button size="sm" className="mt-4 rounded-xl gap-1.5" asChild>
          <Link to={action}><Plus className="h-3.5 w-3.5" />{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
