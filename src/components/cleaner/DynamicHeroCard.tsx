import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useCountdown } from "@/hooks/useCountdown";
import {
  ArrowRight, Navigation, Camera, Clock, CheckCircle,
  Play, Timer, Banknote, MapPin, Sparkles, Bell, Briefcase
} from "lucide-react";
import type { CleanerJobWithClient } from "@/hooks/useCleanerProfile";

type HeroState =
  | "new_offer"
  | "upcoming"
  | "drive_now"
  | "gps_checkin"
  | "before_photos"
  | "in_progress"
  | "after_photos"
  | "awaiting_approval"
  | "payout_sent"
  | "idle";

interface DynamicHeroCardProps {
  jobs: CleanerJobWithClient[];
  hasNewOffers?: boolean;
  recentPayoutAmount?: number;
}

function getHeroState(jobs: CleanerJobWithClient[], hasNewOffers?: boolean, recentPayoutAmount?: number): {
  state: HeroState;
  job?: CleanerJobWithClient;
  payoutAmount?: number;
} {
  // Priority order: active in-progress job → upcoming today → new offers → awaiting approval → payout → idle

  // Check for in-progress job
  const inProgress = jobs.find(j => j.status === "in_progress");
  if (inProgress) {
    // Determine sub-state based on photos/checkin
    return { state: "in_progress", job: inProgress };
  }

  // Check for "on_way" status
  const onWay = jobs.find(j => j.status === "on_my_way" || j.status === "on_way");
  if (onWay) return { state: "drive_now", job: onWay };

  // Check for new offers (requested status)
  const offers = jobs.filter(j => j.status === "requested");
  if (offers.length > 0 || hasNewOffers) return { state: "new_offer", job: offers[0] };

  // Check for awaiting approval (completed but not approved)
  const awaitingApproval = jobs.find(j => j.status === "completed" || j.status === "awaiting_approval");
  if (awaitingApproval) return { state: "awaiting_approval", job: awaitingApproval };

  // Check for upcoming confirmed job
  const upcoming = jobs
    .filter(j => j.status === "confirmed" && j.scheduled_start_at)
    .sort((a, b) => new Date(a.scheduled_start_at!).getTime() - new Date(b.scheduled_start_at!).getTime());
  if (upcoming.length > 0) return { state: "upcoming", job: upcoming[0] };

  // Check for recent payout
  if (recentPayoutAmount && recentPayoutAmount > 0) return { state: "payout_sent", payoutAmount: recentPayoutAmount };

  return { state: "idle" };
}

const HERO_CONFIG: Record<HeroState, {
  emoji: string;
  title: string;
  subtitle: string;
  borderColor: string;
  bgGradient: string;
  iconBg: string;
  icon: React.ElementType;
  ctaLabel: string;
  ctaVariant: "default" | "destructive" | "outline";
}> = {
  new_offer: {
    emoji: "🔔",
    title: "New Job Offer",
    subtitle: "Review and accept to secure this booking",
    borderColor: "border-warning/60",
    bgGradient: "from-warning/15 to-warning/5",
    iconBg: "bg-warning/15",
    icon: Bell,
    ctaLabel: "Review Offer",
    ctaVariant: "default",
  },
  upcoming: {
    emoji: "📅",
    title: "Next Job",
    subtitle: "Your upcoming cleaning",
    borderColor: "border-success/60",
    bgGradient: "from-success/15 to-success/5",
    iconBg: "bg-success/15",
    icon: Briefcase,
    ctaLabel: "View Details",
    ctaVariant: "default",
  },
  drive_now: {
    emoji: "🚗",
    title: "Drive Now",
    subtitle: "Head to your next job",
    borderColor: "border-primary/60",
    bgGradient: "from-primary/15 to-primary/5",
    iconBg: "bg-primary/15",
    icon: Navigation,
    ctaLabel: "Get Directions",
    ctaVariant: "default",
  },
  gps_checkin: {
    emoji: "📍",
    title: "GPS Check-In Needed",
    subtitle: "You've arrived — clock in to start",
    borderColor: "border-primary/60",
    bgGradient: "from-primary/15 to-primary/5",
    iconBg: "bg-primary/15",
    icon: MapPin,
    ctaLabel: "Clock In",
    ctaVariant: "default",
  },
  before_photos: {
    emoji: "📷",
    title: "Before Photos Needed",
    subtitle: "Take photos before you start cleaning",
    borderColor: "border-warning/60",
    bgGradient: "from-warning/15 to-warning/5",
    iconBg: "bg-warning/15",
    icon: Camera,
    ctaLabel: "Upload Photos",
    ctaVariant: "default",
  },
  in_progress: {
    emoji: "🔥",
    title: "Job In Progress",
    subtitle: "You're on the clock — keep going!",
    borderColor: "border-warning/60 ring-2 ring-warning/20",
    bgGradient: "from-warning/15 to-warning/5",
    iconBg: "bg-warning/15",
    icon: Timer,
    ctaLabel: "Continue Job",
    ctaVariant: "default",
  },
  after_photos: {
    emoji: "✨",
    title: "After Photos Needed",
    subtitle: "Take photos to complete the job",
    borderColor: "border-[hsl(var(--pt-purple))]/60",
    bgGradient: "from-[hsl(var(--pt-purple))]/15 to-[hsl(var(--pt-purple))]/5",
    iconBg: "bg-[hsl(var(--pt-purple))]/15",
    icon: Camera,
    ctaLabel: "Upload After Photos",
    ctaVariant: "default",
  },
  awaiting_approval: {
    emoji: "⏳",
    title: "Awaiting Client Approval",
    subtitle: "Your work is submitted — payment releases upon approval",
    borderColor: "border-primary/60",
    bgGradient: "from-primary/15 to-primary/5",
    iconBg: "bg-primary/15",
    icon: CheckCircle,
    ctaLabel: "View Job",
    ctaVariant: "outline",
  },
  payout_sent: {
    emoji: "💰",
    title: "Payout Sent!",
    subtitle: "Check your bank account",
    borderColor: "border-success/60",
    bgGradient: "from-success/15 to-success/5",
    iconBg: "bg-success/15",
    icon: Banknote,
    ctaLabel: "View Earnings",
    ctaVariant: "default",
  },
  idle: {
    emoji: "✅",
    title: "You're All Caught Up",
    subtitle: "No pending actions — update your availability to get more bookings",
    borderColor: "border-border",
    bgGradient: "from-muted/50 to-muted/20",
    iconBg: "bg-muted",
    icon: Sparkles,
    ctaLabel: "Update Availability",
    ctaVariant: "outline",
  },
};

export function DynamicHeroCard({ jobs, hasNewOffers, recentPayoutAmount }: DynamicHeroCardProps) {
  const { state, job, payoutAmount } = getHeroState(jobs, hasNewOffers, recentPayoutAmount);
  const config = HERO_CONFIG[state];
  const Icon = config.icon;

  const countdown = useCountdown(
    job?.scheduled_start_at && state === "upcoming" ? new Date(job.scheduled_start_at) : null
  );

  const getCtaPath = () => {
    if (state === "idle") return "/cleaner/availability";
    if (state === "payout_sent") return "/cleaner/earnings";
    if (job) return `/cleaner/jobs/${job.id}`;
    return "/cleaner/jobs";
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className={`border-2 ${config.borderColor} overflow-hidden`}>
        <div className={`h-1.5 w-full bg-gradient-to-r ${config.bgGradient}`} />
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className={`h-14 w-14 rounded-2xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
              <span className="text-2xl">{config.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                {config.title}
              </p>
              {job ? (
                <>
                  <p className="font-bold text-lg capitalize">
                    {(job.cleaning_type || "standard").replace(/_/g, " ")} Clean
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {job.scheduled_start_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(job.scheduled_start_at), "EEE, MMM d · h:mm a")}
                      </span>
                    )}
                    {state === "upcoming" && countdown && (
                      <Badge variant="outline" className="text-xs">
                        Starts in {countdown}
                      </Badge>
                    )}
                    {job.client?.first_name && (
                      <span>· {job.client.first_name} {(job.client?.last_name || "").charAt(0)}.</span>
                    )}
                  </div>
                </>
              ) : state === "payout_sent" && payoutAmount ? (
                <p className="font-bold text-lg text-success">${payoutAmount.toFixed(2)} sent to your account</p>
              ) : (
                <p className="text-sm text-muted-foreground">{config.subtitle}</p>
              )}
            </div>
            <Button size="sm" asChild className="flex-shrink-0 rounded-xl">
              <Link to={getCtaPath()}>
                {config.ctaLabel} <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
