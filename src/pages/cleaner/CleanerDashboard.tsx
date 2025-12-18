import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { StatCard } from "@/components/cleaner/StatCard";
import { ReliabilityScore } from "@/components/cleaner/ReliabilityScore";
import { QuickAction, FeatureCard } from "@/components/cleaner/QuickActions";
import { useAuth } from "@/contexts/AuthContext";
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
  Package
} from "lucide-react";

export default function CleanerDashboard() {
  const { user } = useAuth();

  const stats = {
    jobsThisWeek: 0,
    hoursThisWeek: 0,
    earnedThisWeek: "$0",
    unreadMessages: 0,
  };

  return (
    <CleanerLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Welcome back, {user?.name || "Cleaner"}! 
              <span className="text-3xl">👋</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your cleaning business overview
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            iconColor="text-violet-500"
            iconBgColor="bg-violet-500/10"
          />
          <StatCard
            icon={DollarSign}
            value={stats.earnedThisWeek}
            label="Earned This Week"
            iconColor="text-success"
            iconBgColor="bg-success/10"
          />
          <StatCard
            icon={MessageSquare}
            value={stats.unreadMessages}
            label="Unread Messages"
            iconColor="text-amber-500"
            iconBgColor="bg-amber-100"
          />
        </div>

        {/* Reliability Score */}
        <ReliabilityScore score={0} tier="bronze" />

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
              iconColor="text-violet-500"
              iconBgColor="bg-violet-500/10"
            />
            <FeatureCard
              icon={Calendar}
              title="Job Calendar"
              description="View all jobs on a calendar"
              href="/cleaner/schedule"
              iconColor="text-blue-500"
              iconBgColor="bg-blue-500/10"
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
              iconColor="text-rose-500"
              iconBgColor="bg-rose-500/10"
            />
            <FeatureCard
              icon={BookOpen}
              title="Resources & Education"
              description="Tips, discounts, and training"
              href="/cleaner/resources"
              iconColor="text-pink-500"
              iconBgColor="bg-pink-500/10"
            />
            <FeatureCard
              icon={MessageSquare}
              title="Messages"
              description="Chat with clients"
              href="/cleaner/messages"
              iconColor="text-indigo-500"
              iconBgColor="bg-indigo-500/10"
            />
            <FeatureCard
              icon={Settings}
              title="Profile Settings"
              description="Update rates, availability, services"
              href="/cleaner/profile"
              iconColor="text-slate-500"
              iconBgColor="bg-slate-500/10"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Reliability Score"
              description="Learn how your score is calculated"
              href="/cleaner/reliability"
              iconColor="text-emerald-500"
              iconBgColor="bg-emerald-500/10"
            />
            <FeatureCard
              icon={Package}
              title="Materials List"
              description="Recommended cleaning supplies"
              href="/cleaner/materials"
              iconColor="text-cyan-500"
              iconBgColor="bg-cyan-500/10"
            />
          </div>
        </section>
      </div>
    </CleanerLayout>
  );
}
