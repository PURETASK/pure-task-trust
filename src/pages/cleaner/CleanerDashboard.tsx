import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { StatCard } from "@/components/cleaner/StatCard";
import { ReliabilityScore } from "@/components/cleaner/ReliabilityScore";
import { QuickAction, FeatureCard } from "@/components/cleaner/QuickActions";
import { GoalsCard } from "@/components/gamification/GoalsCard";
import { StreakCard } from "@/components/gamification/StreakCard";
import { BoostCard } from "@/components/gamification/BoostCard";
import { TierBadge } from "@/components/gamification/TierBadge";
import { InviteFriendsCTA } from "@/components/referral";
import { useAuth } from "@/contexts/AuthContext";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useCleanerStats } from "@/hooks/useCleanerEarnings";
import { Skeleton } from "@/components/ui/skeleton";
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
  CalendarClock
} from "lucide-react";

export default function CleanerDashboard() {
  const { user } = useAuth();
  const { profile, isLoading: isLoadingProfile } = useCleanerProfile();
  const { stats, isLoading: isLoadingStats } = useCleanerStats();

  const displayName = profile?.first_name || user?.name || "Cleaner";
  const tier = profile?.tier || 'bronze';

  return (
    <CleanerLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Welcome back, {displayName}! 
              <span className="text-3xl">👋</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your cleaning business overview
            </p>
          </div>
        </div>

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
              iconColor="text-white"
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
