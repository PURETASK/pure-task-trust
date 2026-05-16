import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, CheckCircle2, History, Sparkles, ArrowRight, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useClientJobs } from "@/hooks/useJob";
import { motion } from "framer-motion";
import { MessageJobButton } from "@/components/messaging/MessageJobButton";
import { useJobParticipants } from "@/hooks/useJobParticipants";
import { useStatusPresentation } from "@/hooks/useStatusPresentation";
import { useEscrowCountdown } from "@/hooks/useEscrowCountdown";
import { useJobMoney } from "@/hooks/useJobMoney";
import { JobCard, Pill, EmptyState as WfEmptyState, SectionLabel } from "@/components/wf";
import { RebookFromDeclinedModal } from "@/components/booking/RebookFromDeclinedModal";

type TabValue = "upcoming" | "in_progress" | "completed" | "history";

const f = (delay = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.3 } });

export default function MyCleanings() {
  const [tab, setTab] = useState<TabValue>("upcoming");
  const { data: jobs, isLoading } = useClientJobs();

  const upcoming = jobs?.filter(j => ["created", "pending", "confirmed"].includes(j.status)) ?? [];
  const inProgress = jobs?.filter(j => j.status === "in_progress") ?? [];
  const completed = jobs?.filter(j => j.status === "completed") ?? [];
  const history = jobs ?? [];
  const declined = (jobs ?? []).filter(j =>
    j.status === "cancelled" && (j as any).metadata?.declined_by_cleaner === true
  );

  return (
    <main className="flex-1 bg-app-canvas min-h-screen">
      <Helmet>
        <title>My Cleanings | PureTask</title>
        <meta name="description" content="Manage your upcoming, active, and past cleanings." />
      </Helmet>

      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-5xl">
        <motion.div {...f(0)} className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-ink-faint mb-1">
              Your bookings
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">My Cleanings</h1>
            <p className="text-sm text-ink-muted mt-1">Manage all your bookings in one place.</p>
          </div>
          <Button asChild className="rounded-xl gap-1.5 hidden sm:flex h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            <Link to="/book"><Plus className="h-4 w-4" /> Book New</Link>
          </Button>
        </motion.div>

        {/* Declined-by-cleaner banners — credits already released */}
        {declined.length > 0 && (
          <div className="space-y-2.5 mb-6">
            {declined.map(job => (
              <DeclinedRebookBanner key={job.id} job={job} />
            ))}
          </div>
        )}

        <Tabs value={tab} onValueChange={v => setTab(v as TabValue)}>
          <TabsList className="w-full justify-start overflow-x-auto gap-1 bg-app-surface p-1 rounded-[10px] mb-6 border border-hairline-soft shadow-wf">
            <TabsTrigger value="upcoming" className="gap-1.5 text-xs sm:text-sm rounded-md data-[state=active]:bg-app-canvas data-[state=active]:text-ink">
              <CalendarDays className="h-3.5 w-3.5" /> Upcoming
              {upcoming.length > 0 && <Pill variant="info" className="ml-0.5">{upcoming.length}</Pill>}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-1.5 text-xs sm:text-sm rounded-md data-[state=active]:bg-app-canvas data-[state=active]:text-ink">
              <Clock className="h-3.5 w-3.5" /> In Progress
              {inProgress.length > 0 && <Pill variant="success" className="ml-0.5">{inProgress.length}</Pill>}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5 text-xs sm:text-sm rounded-md data-[state=active]:bg-app-canvas data-[state=active]:text-ink">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs sm:text-sm rounded-md data-[state=active]:bg-app-canvas data-[state=active]:text-ink">
              <History className="h-3.5 w-3.5" /> History
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-2.5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[10px]" />)}</div>
          ) : (
            <>
              <TabsContent value="upcoming">
                <JobList jobs={upcoming} emptyIcon={CalendarDays} emptyMessage="No upcoming cleanings" emptyDescription="Book a cleaning and it will show up here." emptyAction="/book" emptyActionLabel="Book a Cleaning" />
              </TabsContent>
              <TabsContent value="in_progress">
                <JobList jobs={inProgress} emptyIcon={Clock} emptyMessage="No cleanings in progress" emptyDescription="Active cleanings will appear here once your cleaner checks in." />
              </TabsContent>
              <TabsContent value="completed">
                <JobList jobs={completed} emptyIcon={CheckCircle2} emptyMessage="No completed cleanings yet" emptyDescription="Once a cleaner finishes, you'll review and approve here." />
              </TabsContent>
              <TabsContent value="history">
                <JobList jobs={history} emptyIcon={History} emptyMessage="No cleaning history" emptyDescription="Your completed bookings and receipts will live here." />
              </TabsContent>
            </>
          )}
        </Tabs>

        <div className="sm:hidden mt-6">
          <Button asChild className="w-full rounded-xl gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
            <Link to="/book"><Plus className="h-4 w-4" /> Book a Cleaning</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

/* ── DECLINED-BY-CLEANER REBOOK BANNER ─────────────────────────── */
function DeclinedRebookBanner({ job }: { job: any }) {
  const [open, setOpen] = useState(false);
  const cleanerName = job.cleaner?.first_name || "Your cleaner";
  const reason = job.metadata?.decline_reason;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-warning/50 bg-warning/[0.07] p-4 sm:p-5 flex items-start gap-3 sm:gap-4"
    >
      <div className="h-11 w-11 rounded-xl bg-warning/20 border border-warning/40 flex items-center justify-center shrink-0">
        <AlertCircle className="h-5 w-5 text-warning" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm sm:text-base">
          {cleanerName} declined your {(job.cleaning_type || "").replace(/_/g, " ")} booking
        </p>
        <p className="text-xs text-ink-muted mt-0.5">
          Your credits have been released back to your wallet. Pick a replacement to get scheduled.
        </p>
        {reason && (
          <p className="text-xs italic text-ink-muted mt-1.5">
            Reason: "{reason}"
          </p>
        )}
      </div>
      <Button
        size="sm"
        className="rounded-xl bg-warning hover:bg-warning/90 text-warning-foreground gap-1.5 shrink-0"
        onClick={() => setOpen(true)}
      >
        <RefreshCw className="h-3.5 w-3.5" /> Pick replacement
      </Button>
      <RebookFromDeclinedModal
        open={open}
        onOpenChange={setOpen}
        jobId={job.id}
        cleaningType={job.cleaning_type}
        hours={job.estimated_hours}
        excludeCleanerId={job.cleaner_id}
      />
    </motion.div>
  );
}

/* ── JOB LIST ──────────────────────────────────────────────────── */
function JobList({ jobs, emptyIcon: EmptyIcon, emptyMessage, emptyDescription, emptyAction, emptyActionLabel }: {
  jobs: any[];
  emptyIcon: any;
  emptyMessage: string;
  emptyDescription?: string;
  emptyAction?: string;
  emptyActionLabel?: string;
}) {
  if (!jobs.length) {
    return (
      <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf">
        <WfEmptyState
          icon={<EmptyIcon />}
          title={emptyMessage}
          description={emptyDescription}
          action={emptyAction && emptyActionLabel ? (
            <Button asChild size="sm" className="rounded-xl gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to={emptyAction}><Plus className="h-3.5 w-3.5" />{emptyActionLabel}</Link>
            </Button>
          ) : undefined}
        />
      </div>
    );
  }

  return (
    <>
      <SectionLabel>{jobs.length} {jobs.length === 1 ? "booking" : "bookings"}</SectionLabel>
      <div className="space-y-2.5">
        {jobs.map((job, i) => (
          <JobRow key={job.id} job={job} index={i} />
        ))}
      </div>
    </>
  );
}

/* ── SINGLE JOB ROW (uses Wave 1 + Wave 2 primitives) ──────────── */
function JobRow({ job, index }: { job: any; index: number }) {
  const participants = useJobParticipants(job);
  const status = useStatusPresentation(job.status);
  const escrow = useEscrowCountdown(job);
  const money = useJobMoney(job);
  const cleanerName = participants.cleaner.fullName;
  const serviceType = (job.cleaning_type || "standard").replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const needsApproval = status.isReviewable && escrow.isReviewable && !escrow.isExpired;
  const statusVariant: "info" | "success" | "warning" | "danger" | "neutral" =
    status.label?.toLowerCase().includes("complete") ? "success"
    : status.label?.toLowerCase().includes("progress") ? "info"
    : status.label?.toLowerCase().includes("cancel") || status.label?.toLowerCase().includes("dispute") ? "danger"
    : status.label?.toLowerCase().includes("pending") || status.label?.toLowerCase().includes("review") ? "warning"
    : "neutral";

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <JobCard className="group">
        <div className="flex items-center gap-3">
          <Link to={`/my-cleanings/${job.id}`} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-11 w-11 rounded-[10px] bg-app-canvas border border-hairline flex items-center justify-center font-semibold text-ink text-sm flex-shrink-0">
              {participants.cleaner.initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <p className="font-semibold text-ink text-sm truncate">{cleanerName}</p>
                <Pill variant={statusVariant}>{status.label}</Pill>
                {needsApproval && (
                  <span title={escrow.label}>
                    <Pill variant="warning">Review · {escrow.hoursRemaining}h</Pill>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-[11px] text-ink-muted flex-wrap">
                <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> {serviceType}</span>
                {job.scheduled_start_at && <span>{format(new Date(job.scheduled_start_at), "EEE, MMM d · h:mm a")}</span>}
                {job.estimated_hours && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{job.estimated_hours}h</span>}
              </div>
              {money.escrowHeld > 0 && (
                <p className="text-[11px] text-ink-faint mt-1 tabular-nums">
                  {money.isSettled
                    ? `${money.totalClientCharge} credits charged`
                    : `${money.escrowHeld} credits held`}
                </p>
              )}
            </div>
          </Link>
          <div className="flex items-center gap-1 flex-shrink-0">
            {job.cleaner_id && (
              <MessageJobButton
                jobId={job.id}
                otherPartyId={job.cleaner_id}
                iconOnly
                variant="ghost"
                className="rounded-md h-8 w-8 p-0 hover:bg-app-canvas text-ink-muted"
                aria-label="Message cleaner"
              />
            )}
            <ArrowRight className="h-4 w-4 text-ink-faint group-hover:text-ink transition-colors" />
          </div>
        </div>
      </JobCard>
    </motion.div>
  );
}
