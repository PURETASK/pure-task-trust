import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, CheckCircle2, History, Sparkles, ArrowRight, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useClientJobs } from "@/hooks/useJob";
import { motion } from "framer-motion";
import { MessageJobButton } from "@/components/messaging/MessageJobButton";
import { useJobParticipants } from "@/hooks/useJobParticipants";
import { useStatusPresentation } from "@/hooks/useStatusPresentation";
import { useEscrowCountdown } from "@/hooks/useEscrowCountdown";
import { useJobMoney } from "@/hooks/useJobMoney";

type TabValue = "upcoming" | "in_progress" | "completed" | "history";

const PALETTES = ["blue", "green", "amber", "purple"] as const;

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
              <h1 className="text-2xl sm:text-3xl font-poppins font-bold">My Cleanings</h1>
              <p className="text-sm text-muted-foreground">Manage all your bookings in one place.</p>
            </div>
          </div>
          <Button asChild className="rounded-xl gap-1.5 hidden sm:flex bg-gradient-aero shadow-aero hover:shadow-aero-lg border-0 font-semibold">
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
        const palette = PALETTES[i % 4];
        return <JobRow key={job.id} job={job} index={i} palette={palette} />;
      })}
    </div>
  );
}

/* ── SINGLE JOB ROW (uses Wave 1 + Wave 2 primitives) ──────────── */
function JobRow({ job, index, palette }: { job: any; index: number; palette: typeof PALETTES[number] }) {
  const participants = useJobParticipants(job);
  const status = useStatusPresentation(job.status);
  const escrow = useEscrowCountdown(job);
  const money = useJobMoney(job);
  const cleanerName = participants.cleaner.fullName;
  const serviceType = (job.cleaning_type || "standard").replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  // "Needs Review" is now driven by the escrow window, not a heuristic on
  // final_charge_credits — auto-approved jobs were incorrectly flagged.
  const needsApproval = status.isReviewable && escrow.isReviewable && !escrow.isExpired;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <div className={`palette-card palette-card-${palette} flex items-center gap-4 p-4 sm:p-5 hover:shadow-elevated transition-all group`}>
        <Link to={`/my-cleanings/${job.id}`} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
          <div className={`palette-icon palette-icon-${palette} h-12 w-12 font-bold text-sm`}>
            {participants.cleaner.initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold truncate">{cleanerName}</p>
              <span className={`palette-pill ${status.palettePillClass} text-[10px] h-5 px-2`}>{status.label}</span>
              {needsApproval && (
                <span className="palette-pill palette-pill-amber text-[10px] h-5 px-2" title={escrow.label}>
                  Review · {escrow.hoursRemaining}h
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> {serviceType}</span>
              {job.scheduled_start_at && <span>{format(new Date(job.scheduled_start_at), "EEE, MMM d · h:mm a")}</span>}
              {job.estimated_hours && <span><Clock className="h-3 w-3 inline mr-0.5" />{job.estimated_hours}h</span>}
            </div>
            {money.escrowHeld > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {money.isSettled
                  ? `${money.totalClientCharge} credits charged`
                  : `${money.escrowHeld} credits held`}
              </p>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {job.cleaner_id && (
            <MessageJobButton
              jobId={job.id}
              otherPartyId={job.cleaner_id}
              iconOnly
              variant="ghost"
              className="rounded-xl h-9 w-9 p-0 hover:bg-primary/10"
              aria-label="Message cleaner"
            />
          )}
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </motion.div>
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
