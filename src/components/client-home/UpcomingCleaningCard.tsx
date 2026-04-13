import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format, differenceInMinutes } from "date-fns";
import {
  Calendar, Clock, MapPin, Sparkles, Navigation, Timer,
  Camera, CreditCard, AlertTriangle, ChevronRight,
  Brush, Home, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { HeroState } from "@/hooks/useClientHome";
import type { JobWithDetails } from "@/hooks/useJob";

interface Props {
  heroState: HeroState;
  heroJob: JobWithDetails | null;
}

export function UpcomingCleaningCard({ heroState, heroJob }: Props) {
  if (heroState === "empty") return <EmptyState />;
  if (heroState === "awaiting_approval") return <AwaitingApprovalState job={heroJob!} />;
  if (heroState === "in_progress") return <InProgressState job={heroJob!} />;
  if (heroState === "on_the_way") return <OnTheWayState job={heroJob!} />;
  if (heroState === "needs_topup") return <NeedsTopUpState job={heroJob!} />;
  if (heroState === "urgent") return <UrgentState job={heroJob!} />;
  return <FutureState job={heroJob!} />;
}

function cleanerName(job: JobWithDetails) {
  if (!job.cleaner) return "Finding cleaner…";
  return `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() || "Your Cleaner";
}

function serviceLabel(type: string | null) {
  return (type || "standard").replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── EMPTY ─────────────────────────────────────────────────────── */
function EmptyState() {
  const services = [
    { label: "Standard Clean", icon: Brush, href: "/book?type=standard" },
    { label: "Deep Clean", icon: Home, href: "/book?type=deep" },
    { label: "Move-Out Clean", icon: Truck, href: "/book?type=move_out" },
  ];

  return (
    <Card className="border-dashed border-2 border-border/60">
      <CardContent className="p-6 sm:p-8 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-7 w-7 text-primary/50" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold mb-1">No upcoming cleanings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You don't have any upcoming cleanings. Ready to book one?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {services.map((s) => (
            <Button key={s.label} variant="outline" asChild className="gap-2">
              <Link to={s.href}>
                <s.icon className="h-4 w-4" />
                {s.label}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── FUTURE (>24h) ─────────────────────────────────────────────── */
function FutureState({ job }: { job: JobWithDetails }) {
  return (
    <Link to={`/booking/${job.id}`}>
      <Card className="hover:shadow-elevated transition-all border-primary/20 hover:border-primary/40">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-1">
            <Badge className="bg-primary/10 text-primary border border-primary/30 text-xs font-semibold">
              Upcoming
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <JobDetails job={job} />
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" className="text-xs" asChild onClick={(e) => e.stopPropagation()}>
              <Link to={`/booking/${job.id}`}>Reschedule</Link>
            </Button>
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" asChild onClick={(e) => e.stopPropagation()}>
              <Link to={`/booking/${job.id}`}>Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/* ── URGENT (<24h) ──────────────────────────────────────────────── */
function UrgentState({ job }: { job: JobWithDetails }) {
  const startDate = job.scheduled_start_at ? new Date(job.scheduled_start_at) : null;
  const timeLabel = startDate ? format(startDate, "h:mm a") : "";
  const dayLabel = startDate
    ? (startDate.toDateString() === new Date().toDateString() ? "today" : "tomorrow")
    : "";

  return (
    <Link to={`/booking/${job.id}`}>
      <Card className="hover:shadow-elevated transition-all border-warning/40">
        <CardContent className="p-5 sm:p-6">
          <div className="rounded-xl bg-warning/10 border border-warning/30 px-4 py-2.5 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning flex-shrink-0" />
            <p className="text-sm font-semibold text-warning">
              Your cleaning is {dayLabel} at {timeLabel}
            </p>
          </div>
          <JobDetails job={job} />
        </CardContent>
      </Card>
    </Link>
  );
}

/* ── NEEDS TOP-UP ──────────────────────────────────────────────── */
function NeedsTopUpState({ job }: { job: JobWithDetails }) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="p-5 sm:p-6">
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-2.5 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-sm font-semibold text-destructive">
            Insufficient balance for your upcoming cleaning
          </p>
        </div>
        <JobDetails job={job} />
        <Button asChild className="mt-4 w-full sm:w-auto">
          <Link to="/wallet">
            <CreditCard className="h-4 w-4 mr-2" />
            Top Up Now
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/* ── ON THE WAY ────────────────────────────────────────────────── */
function OnTheWayState({ job }: { job: JobWithDetails }) {
  return (
    <Link to={`/booking/${job.id}`}>
      <Card className="border-primary/40 bg-primary/[0.03]">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-10 w-10 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center"
            >
              <Navigation className="h-5 w-5 text-primary" />
            </motion.div>
            <div>
              <p className="font-bold text-base">{cleanerName(job)} is on the way</p>
              <p className="text-sm text-muted-foreground">Arriving soon</p>
            </div>
          </div>
          <JobDetails job={job} />
        </CardContent>
      </Card>
    </Link>
  );
}

/* ── IN PROGRESS ───────────────────────────────────────────────── */
function InProgressState({ job }: { job: JobWithDetails }) {
  const startTime = job.check_in_at || job.scheduled_start_at;
  const elapsed = startTime ? differenceInMinutes(new Date(), new Date(startTime)) : 0;
  const hours = Math.floor(elapsed / 60);
  const mins = elapsed % 60;

  return (
    <Link to={`/booking/${job.id}`}>
      <Card className="border-success/40 bg-success/[0.03]">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="h-10 w-10 rounded-full bg-success/15 border-2 border-success/30 flex items-center justify-center"
              >
                <Timer className="h-5 w-5 text-success" />
              </motion.div>
              <div>
                <p className="font-bold text-base">Your cleaner is currently on-site</p>
                <p className="text-sm text-muted-foreground">{cleanerName(job)}</p>
              </div>
            </div>
            <Badge className="bg-success/10 text-success border border-success/30 font-mono text-sm">
              {hours > 0 ? `${hours}h ` : ""}{mins}m
            </Badge>
          </div>
          {job.escrow_credits_reserved != null && (
            <p className="text-xs text-muted-foreground">
              <CreditCard className="h-3 w-3 inline mr-1" />
              {job.escrow_credits_reserved} credits held
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

/* ── AWAITING APPROVAL ─────────────────────────────────────────── */
function AwaitingApprovalState({ job }: { job: JobWithDetails }) {
  return (
    <Card className="border-warning/50 ring-2 ring-warning/20">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-5 w-5 text-warning" />
          <h2 className="font-bold text-base">Cleaning Complete — Review Required</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Your cleaning is complete. Review the details and release payment.
        </p>
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-muted/50 border border-border/50">
          <div className="h-9 w-9 rounded-full bg-warning/10 flex items-center justify-center font-bold text-warning">
            {cleanerName(job).charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{cleanerName(job)}</p>
            <p className="text-xs text-muted-foreground capitalize">{serviceLabel(job.cleaning_type)}</p>
          </div>
          {job.escrow_credits_reserved != null && (
            <p className="text-sm font-bold">{job.escrow_credits_reserved} cr</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link to={`/booking/${job.id}`}>Approve & Release Payment</Link>
          </Button>
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link to={`/booking/${job.id}`}>Dispute</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── SHARED: Job Details Row ───────────────────────────────────── */
function JobDetails({ job }: { job: JobWithDetails }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
        {cleanerName(job).charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm sm:text-base">{cleanerName(job)}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mt-0.5">
          {job.scheduled_start_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(job.scheduled_start_at), "EEE, MMM d")}
            </span>
          )}
          {job.scheduled_start_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(job.scheduled_start_at), "h:mm a")}
            </span>
          )}
          <span className="capitalize">{serviceLabel(job.cleaning_type)}</span>
        </div>
      </div>
    </div>
  );
}
