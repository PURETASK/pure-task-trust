import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format, differenceInMinutes } from "date-fns";
import {
  Calendar, Clock, Sparkles, Navigation, Timer,
  Camera, CreditCard, AlertTriangle, ChevronRight,
  Brush, Home, Truck, MessageCircle, MapPin
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

function statusPill(label: string, variant: "default" | "warning" | "success" | "destructive") {
  const styles = {
    default: "bg-primary/10 text-primary border-primary/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    success: "bg-success/10 text-success border-success/30",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <Badge className={`${styles[variant]} border text-xs font-semibold px-3`}>
      {label}
    </Badge>
  );
}

function addressLine(job: JobWithDetails) {
  return job.address || null;
}

/* ── EMPTY ─────────────────────────────────────────────────────── */
function EmptyState() {
  const services = [
    { label: "Standard Clean", icon: Brush, href: "/book?type=standard", desc: "Regular maintenance" },
    { label: "Deep Clean", icon: Home, href: "/book?type=deep", desc: "Thorough & detailed" },
    { label: "Move-Out Clean", icon: Truck, href: "/book?type=move_out", desc: "End of tenancy" },
  ];

  return (
    <Card className="overflow-hidden border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent">
      <CardContent className="p-6 sm:p-10 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="h-8 w-8 text-primary/60" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">No cleaning booked yet</h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          Book a trusted cleaner in minutes.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
          {services.map((s) => (
            <Link key={s.label} to={s.href}>
              <div className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-card hover:border-primary/30 transition-all text-center group">
                <div className="h-10 w-10 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center mx-auto mb-2 transition-colors">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">{s.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── FUTURE (>24h) ─────────────────────────────────────────────── */
function FutureState({ job }: { job: JobWithDetails }) {
  const address = addressLine(job);

  return (
    <Card className="hover:shadow-elevated transition-all border-primary/20 hover:border-primary/40 overflow-hidden">
      <div className="h-1 w-full gradient-brand" />
      <CardContent className="p-5 sm:p-7">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground font-medium">Next Cleaning</p>
          {statusPill("Confirmed", "default")}
        </div>
        <p className="text-sm text-muted-foreground mb-5">Your next cleaning is booked and ready.</p>

        <JobDetails job={job} address={address} />

        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-border/50">
          <Button size="sm" variant="default" className="text-xs h-9 rounded-xl" asChild>
            <Link to={`/my-cleanings/${job.id}`}>View Details</Link>
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-9 rounded-xl gap-1.5" asChild>
            <Link to={`/messages`}>
              <MessageCircle className="h-3 w-3" />
              Message Cleaner
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-9 rounded-xl" asChild>
            <Link to={`/my-cleanings/${job.id}`}>Reschedule</Link>
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-9 rounded-xl text-muted-foreground" asChild>
            <Link to={`/my-cleanings/${job.id}`}>Cancel</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── URGENT (<24h) ──────────────────────────────────────────────── */
function UrgentState({ job }: { job: JobWithDetails }) {
  const startDate = job.scheduled_start_at ? new Date(job.scheduled_start_at) : null;
  const timeLabel = startDate ? format(startDate, "h:mm a") : "";
  const isToday = startDate?.toDateString() === new Date().toDateString();
  const dayLabel = isToday ? "today" : "tomorrow";
  const address = addressLine(job);

  return (
    <Card className="hover:shadow-elevated transition-all border-warning/30 overflow-hidden">
      <div className="h-1 w-full bg-warning" />
      <CardContent className="p-5 sm:p-7">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground font-medium">Next Cleaning</p>
          {statusPill("Confirmed", "warning")}
        </div>

        <div className="rounded-xl bg-warning/10 border border-warning/20 px-4 py-3 mb-5 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
            <Clock className="h-4 w-4 text-warning" />
          </div>
          <p className="text-sm font-semibold">
            {isToday
              ? `Cleaner arrives today at ${timeLabel}`
              : `Cleaner arrives ${dayLabel} at ${timeLabel}`}
          </p>
        </div>

        <JobDetails job={job} address={address} />

        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-border/50">
          <Button size="sm" variant="default" className="text-xs h-9 rounded-xl" asChild>
            <Link to={`/my-cleanings/${job.id}`}>View Details</Link>
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-9 rounded-xl gap-1.5" asChild>
            <Link to="/messages">
              <MessageCircle className="h-3 w-3" />
              Message Cleaner
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-9 rounded-xl" asChild>
            <Link to={`/my-cleanings/${job.id}`}>Reschedule</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── NEEDS TOP-UP ──────────────────────────────────────────────── */
function NeedsTopUpState({ job }: { job: JobWithDetails }) {
  const address = addressLine(job);

  return (
    <Card className="border-destructive/30 overflow-hidden">
      <div className="h-1 w-full bg-destructive" />
      <CardContent className="p-5 sm:p-7">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground font-medium">Next Cleaning</p>
          {statusPill("Needs Top-Up", "destructive")}
        </div>

        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 mb-5 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-destructive">Insufficient balance</p>
            <p className="text-xs text-muted-foreground">Top up to keep your booking confirmed.</p>
          </div>
        </div>

        <JobDetails job={job} address={address} />

        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-border/50">
          <Button asChild className="text-xs h-9 rounded-xl gap-1.5">
            <Link to="/wallet">
              <CreditCard className="h-3.5 w-3.5" />
              Top Up Now
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-9 rounded-xl" asChild>
            <Link to={`/my-cleanings/${job.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── ON THE WAY ────────────────────────────────────────────────── */
function OnTheWayState({ job }: { job: JobWithDetails }) {
  return (
    <Card className="border-primary/30 overflow-hidden bg-gradient-to-br from-primary/[0.03] to-transparent">
      <div className="h-1 w-full gradient-brand" />
      <CardContent className="p-5 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground font-medium">Active Cleaning</p>
          {statusPill("On The Way", "default")}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="relative"
          >
            <div className="h-14 w-14 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
              <Navigation className="h-7 w-7 text-primary" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-success border-2 border-card flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>
          </motion.div>
          <div>
            <p className="font-bold text-lg">{cleanerName(job)} is on the way</p>
            <p className="text-sm text-muted-foreground">
              Arriving soon • {serviceLabel(job.cleaning_type)}
            </p>
          </div>
        </div>

        {job.scheduled_start_at && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 pl-[74px]">
            <Clock className="h-3 w-3" />
            Scheduled for {format(new Date(job.scheduled_start_at), "h:mm a")}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
          <Button size="sm" variant="default" className="text-xs h-9 rounded-xl gap-1.5" asChild>
            <Link to={`/my-cleanings/${job.id}`}>
              <Navigation className="h-3 w-3" />
              Track Arrival
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-9 rounded-xl gap-1.5" asChild>
            <Link to="/messages">
              <MessageCircle className="h-3 w-3" />
              Message Cleaner
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── IN PROGRESS ───────────────────────────────────────────────── */
function InProgressState({ job }: { job: JobWithDetails }) {
  const startTime = job.check_in_at || job.scheduled_start_at;
  const elapsed = startTime ? differenceInMinutes(new Date(), new Date(startTime)) : 0;
  const hours = Math.floor(elapsed / 60);
  const mins = elapsed % 60;

  return (
    <Card className="border-success/30 overflow-hidden bg-gradient-to-br from-success/[0.03] to-transparent">
      <div className="h-1 w-full bg-success" />
      <CardContent className="p-5 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground font-medium">Active Cleaning</p>
          {statusPill("In Progress", "success")}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="h-14 w-14 rounded-full bg-success/15 border-2 border-success/30 flex items-center justify-center"
            >
              <Timer className="h-7 w-7 text-success" />
            </motion.div>
            <div>
              <p className="font-bold text-lg">Your cleaner is currently on-site</p>
              <p className="text-sm text-muted-foreground">
                {cleanerName(job)} • {serviceLabel(job.cleaning_type)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge className="bg-success/10 text-success border border-success/30 font-mono text-base px-3 py-1">
              {hours > 0 ? `${hours}h ` : ""}{mins}m
            </Badge>
          </div>
        </div>

        {job.escrow_credits_reserved != null && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 pl-[74px]">
            <CreditCard className="h-3 w-3" />
            <span>${job.escrow_credits_reserved} held for this job</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
          <Button size="sm" variant="default" className="text-xs h-9 rounded-xl gap-1.5 bg-success hover:bg-success/90" asChild>
            <Link to={`/my-cleanings/${job.id}`}>
              <Timer className="h-3 w-3" />
              View Live Job
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-9 rounded-xl gap-1.5" asChild>
            <Link to="/messages">
              <MessageCircle className="h-3 w-3" />
              Message Cleaner
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── AWAITING APPROVAL ─────────────────────────────────────────── */
function AwaitingApprovalState({ job }: { job: JobWithDetails }) {
  return (
    <Card className="border-warning/40 ring-2 ring-warning/15 overflow-hidden">
      <div className="h-1.5 w-full bg-warning" />
      <CardContent className="p-5 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground font-medium">Action Required</p>
          {statusPill("Awaiting Approval", "warning")}
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-warning/15 flex items-center justify-center">
            <Camera className="h-6 w-6 text-warning" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Cleaning Complete — Approval Needed</h2>
            <p className="text-sm text-muted-foreground">
              Your cleaning is complete. Review photos before payment is released.
            </p>
          </div>
        </div>

        {/* Cleaner summary */}
        <div className="flex items-center gap-3 my-5 p-4 rounded-xl bg-muted/50 border border-border/50">
          <div className="h-11 w-11 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center font-bold text-warning text-sm">
            {cleanerName(job).charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{cleanerName(job)}</p>
            <p className="text-xs text-muted-foreground capitalize">{serviceLabel(job.cleaning_type)}</p>
          </div>
          {job.escrow_credits_reserved != null && (
            <div className="text-right">
              <p className="text-lg font-bold">${job.escrow_credits_reserved}</p>
              <p className="text-[10px] text-muted-foreground">credits held</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="flex-1 min-w-[200px]">
            <Link to={`/my-cleanings/${job.id}`}>
              <Camera className="h-4 w-4 mr-2" />
              Review & Approve
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to={`/my-cleanings/${job.id}`}>Report an Issue</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── SHARED: Job Details Row ───────────────────────────────────── */
function JobDetails({ job, address }: { job: JobWithDetails; address: string | null }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
        {cleanerName(job).charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-base">{cleanerName(job)}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mt-1">
          <Badge variant="outline" className="text-[10px] h-5 px-2 font-medium capitalize">
            {serviceLabel(job.cleaning_type)}
          </Badge>
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
        </div>
        {address && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        )}
        {job.escrow_credits_reserved != null && job.escrow_credits_reserved > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <CreditCard className="h-3 w-3" />
            <span>${job.escrow_credits_reserved} credits held</span>
          </div>
        )}
      </div>
    </div>
  );
}
