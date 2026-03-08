import { useState, useEffect } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { StatCard } from "@/components/cleaner/StatCard";
import { ReliabilityScore } from "@/components/cleaner/ReliabilityScore";
import { QuickAction, FeatureCard } from "@/components/cleaner/QuickActions";
import { GoalsCard } from "@/components/gamification/GoalsCard";
import { StreakCard } from "@/components/gamification/StreakCard";
import { BoostCard } from "@/components/gamification/BoostCard";
import { TierBadge } from "@/components/gamification/TierBadge";
import { InviteFriendsCTA } from "@/components/referral";
import { TierProgressMap } from "@/components/cleaner/TierProgressMap";
import { ProfileCompletion } from "@/components/cleaner/ProfileCompletion";
import { useAuth } from "@/contexts/AuthContext";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useCleanerStats } from "@/hooks/useCleanerEarnings";
import { useCleanerJobs } from "@/hooks/useCleanerProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format, differenceInMinutes, isToday } from "date-fns";
import type { CleanerTier } from "@/lib/tier-config";
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  MessageSquare,
  Search,
  Calendar,
  BarChart3,
  BookOpen,
  Settings,
  TrendingUp,
  Package,
  Gift,
  Users,
  CalendarClock,
  Timer,
  ArrowRight,
  Lightbulb
} from "lucide-react";

// ── Tip of the day ──────────────────────────────────────────────────────────
const TIPS = [
  { icon: "📸", text: "Always upload before & after photos — cleaners with photo proof get 23% more repeat bookings." },
  { icon: "⏰", text: "Respond to job offers within 15 minutes to boost your acceptance rate and reliability score." },
  { icon: "⭐", text: "5-star reviews unlock Gold tier. A friendly check-in message to clients after the job goes a long way." },
  { icon: "💰", text: "Set your rate closer to your tier ceiling — clients associate higher rates with higher quality." },
  { icon: "📅", text: "Keep your availability calendar up to date so the system can auto-assign you the best matches." },
  { icon: "🤝", text: "Refer a cleaner friend and earn credits. Every referral counts toward your monthly goals." },
  { icon: "🔄", text: "Returning clients are worth 3× a new booking. Leave a note thanking clients after every job." },
  { icon: "🚀", text: "Use the Boost feature on slow weeks — it surfaces your profile first in the marketplace." },
];

// ── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const diffMin = differenceInMinutes(targetDate, new Date());
      if (diffMin < 0) { setTimeLeft("Now"); return; }
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

// ── Today's Job Banner ───────────────────────────────────────────────────────
function TodayJobBanner({ jobs }: { jobs: ReturnType<typeof useCleanerJobs>["jobs"] }) {
  const todayJobs = jobs
    .filter(j => j.scheduled_start_at && isToday(new Date(j.scheduled_start_at)) && ['confirmed', 'in_progress'].includes(j.status))
    .sort((a, b) => new Date(a.scheduled_start_at!).getTime() - new Date(b.scheduled_start_at!).getTime());

  const nextJob = todayJobs[0];
  const countdown = useCountdown(nextJob?.scheduled_start_at ? new Date(nextJob.scheduled_start_at) : null);

  if (!nextJob) return null;

  const isInProgress = nextJob.status === "in_progress";
  const label = nextJob.cleaning_type === "deep" ? "Deep Clean" : nextJob.cleaning_type === "move_out" ? "Move-out Clean" : "Standard Clean";

  return (
    <Card className={`border-2 ${isInProgress ? "border-primary/40 bg-primary/5" : "border-success/40 bg-success/5"}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isInProgress ? "bg-primary/10" : "bg-success/10"}`}>
          <Timer className={`h-6 w-6 ${isInProgress ? "text-primary" : "text-success"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {isInProgress ? "Job In Progress" : "Today's Next Job"}
          </p>
          <p className="font-semibold truncate">{label}</p>
          <p className="text-sm text-muted-foreground">
            {isInProgress ? "You're on the clock" : `Starts in ${countdown} · ${format(new Date(nextJob.scheduled_start_at!), "h:mm a")}`}
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to={`/cleaner/jobs/${nextJob.id}`}>
            {isInProgress ? "Continue" : "View Job"}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Tip Card ─────────────────────────────────────────────────────────────────
function TipCard({ tier, score }: { tier: string; score: number }) {
  const idx = (new Date().getDate() + (score % 4)) % TIPS.length;
  const tip = TIPS[idx];
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{tip.icon}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" /> Tip of the Day
          </p>
          <p className="text-sm text-foreground">{tip.text}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function CleanerDashboard() {
  const { user } = useAuth();
  const { profile, isLoading: isLoadingProfile } = useCleanerProfile();
  const { stats, isLoading: isLoadingStats } = useCleanerStats();
  const { jobs } = useCleanerJobs();

  const displayName = profile?.first_name || user?.name || "Cleaner";
  const tier = profile?.tier || 'bronze';

  return (
    <CleanerLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Welcome back, {displayName}!
            <span className="text-3xl">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your cleaning business overview
          </p>
        </div>

        {/* Today's Job Banner */}
        <TodayJobBanner jobs={jobs} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoadingStats ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                icon={Briefcase}
                value={stats.jobsThisWeek}
                label="Jobs This Week"
                iconColor="text-primary"
                iconBgColor="bg-primary/10"
              />
              <StatCard
                icon={Clock}
                value={stats.hoursThisWeek}
                label="Hours This Week"
                iconColor="text-secondary-foreground"
                iconBgColor="bg-secondary"
              />
              <StatCard
                icon={DollarSign}
                value={`$${stats.earnedThisWeek}`}
                label="Earned This Week"
                iconColor="text-success"
                iconBgColor="bg-success/10"
              />
              <StatCard
                icon={MessageSquare}
                value={stats.unreadMessages}
                label="Unread Messages"
                iconColor="text-foreground"
                iconBgColor="bg-muted"
              />
            </>
          )}
        </div>

        {/* Reliability Score & Tier Badge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            {isLoadingProfile ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : (
              <ReliabilityScore 
                score={profile?.reliability_score || 0} 
                tier={tier} 
              />
            )}
          </div>
          <TierBadge />
        </div>

        {/* Tip of the Day */}
        <TipCard tier={tier} score={profile?.reliability_score || 0} />

        {/* Gamification Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Goals & Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GoalsCard />
            <StreakCard />
            <BoostCard />
          </div>
        </section>

        {/* Referral CTA */}
        <InviteFriendsCTA linkTo="/cleaner/referral" />

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction
              icon={Search}
              label="Find Jobs"
              href="/cleaner/marketplace"
              iconColor="text-primary-foreground"
              iconBgColor="bg-primary"
            />
            <QuickAction
              icon={Briefcase}
              label="My Active Jobs"
              href="/cleaner/jobs"
            />
            <QuickAction
              icon={Calendar}
              label="Job Calendar"
              href="/cleaner/schedule"
            />
            <QuickAction
              icon={DollarSign}
              label="Earnings"
              href="/cleaner/earnings"
            />
          </div>
        </section>

        {/* All Cleaner Features */}
        <section>
          <h2 className="text-xl font-semibold mb-4">All Cleaner Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              icon={Search}
              title="Job Marketplace"
              description="Find new cleaning opportunities"
              href="/cleaner/marketplace"
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
            />
            <FeatureCard
              icon={Briefcase}
              title="My Active Jobs"
              description="Manage accepted bookings"
              href="/cleaner/jobs"
              iconColor="text-secondary-foreground"
              iconBgColor="bg-secondary"
            />
            <FeatureCard
              icon={Calendar}
              title="Job Calendar"
              description="View all jobs on a calendar"
              href="/cleaner/schedule"
              iconColor="text-accent-foreground"
              iconBgColor="bg-accent"
            />
            <FeatureCard
              icon={DollarSign}
              title="Earnings & Payouts"
              description="Track income and request payouts"
              href="/cleaner/earnings"
              iconColor="text-success"
              iconBgColor="bg-success/10"
            />
            <FeatureCard
              icon={BarChart3}
              title="Analytics"
              description="Performance metrics and insights"
              href="/cleaner/analytics"
              iconColor="text-destructive"
              iconBgColor="bg-destructive/10"
            />
            <FeatureCard
              icon={BookOpen}
              title="Resources & Education"
              description="Tips, discounts, and training"
              href="/cleaner/resources"
              iconColor="text-primary"
              iconBgColor="bg-primary/5"
            />
            <FeatureCard
              icon={MessageSquare}
              title="Messages"
              description="Chat with clients"
              href="/cleaner/messages"
              iconColor="text-foreground"
              iconBgColor="bg-muted"
            />
            <FeatureCard
              icon={Settings}
              title="Profile Settings"
              description="Update rates, availability, services"
              href="/cleaner/profile"
              iconColor="text-muted-foreground"
              iconBgColor="bg-muted"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Reliability Score"
              description="Learn how your score is calculated"
              href="/cleaner/reliability"
              iconColor="text-success"
              iconBgColor="bg-success/10"
            />
            <FeatureCard
              icon={CalendarClock}
              title="Availability Settings"
              description="Set your working hours & time off"
              href="/cleaner/availability"
              iconColor="text-warning"
              iconBgColor="bg-warning/10"
            />
            <FeatureCard
              icon={Package}
              title="Materials List"
              description="Recommended cleaning supplies"
              href="/cleaner/resources"
              iconColor="text-accent-foreground"
              iconBgColor="bg-accent/50"
            />
            <FeatureCard
              icon={Gift}
              title="Referral Program"
              description="Earn credits by referring cleaners"
              href="/cleaner/referral"
              iconColor="text-warning"
              iconBgColor="bg-warning/10"
            />
            <FeatureCard
              icon={Users}
              title="My Team"
              description="Manage your cleaning team"
              href="/cleaner/team"
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
            />
          </div>
        </section>
      </div>
    </CleanerLayout>
  );
}
