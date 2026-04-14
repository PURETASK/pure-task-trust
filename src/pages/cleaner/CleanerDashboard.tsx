import { Helmet } from "react-helmet-async";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { StatCard } from "@/components/cleaner/StatCard";
import { ReliabilityScoreWidget } from "@/components/cleaner/ReliabilityScoreWidget";
import { GoalsCard } from "@/components/gamification/GoalsCard";
import { StreakCard } from "@/components/gamification/StreakCard";
import { BoostCard } from "@/components/gamification/BoostCard";
import { TierBadge } from "@/components/gamification/TierBadge";
import { InviteFriendsCTA } from "@/components/referral";
import { TierProgressMap } from "@/components/cleaner/TierProgressMap";
import { ProfileCompletion } from "@/components/cleaner/ProfileCompletion";
import { DynamicHeroCard } from "@/components/cleaner/DynamicHeroCard";
import { OnboardingTooltips, CLEANER_ONBOARDING_STEPS } from "@/components/onboarding/OnboardingTooltips";
import { useAuth } from "@/contexts/AuthContext";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useCleanerStats } from "@/hooks/useCleanerEarnings";
import { useCleanerJobs } from "@/hooks/useCleanerProfile";
import { useSmartScheduling } from "@/hooks/useSmartScheduling";
import { useSmartScheduling } from "@/hooks/useSmartScheduling";
import { TIPS, TIER_COLORS, FEATURE_SECTIONS } from "@/lib/cleaner-dashboard-constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format, isToday } from "date-fns";
import type { CleanerTier } from "@/lib/tier-config";
import cleanerHeroImg from "@/assets/cleaner-hero.jpg";
import {
  Briefcase, Clock, DollarSign, MessageSquare, Search,
  TrendingUp, ArrowRight, Lightbulb, Timer, Shield, Award, Zap,
} from "lucide-react";

function TodayJobBanner({ jobs }: { jobs: ReturnType<typeof useCleanerJobs>["jobs"] }) {
  const todayJobs = jobs
    .filter(j => j.scheduled_start_at && isToday(new Date(j.scheduled_start_at)) && ["confirmed", "in_progress"].includes(j.status))
    .sort((a, b) => new Date(a.scheduled_start_at!).getTime() - new Date(b.scheduled_start_at!).getTime());
  const nextJob = todayJobs[0];
  const countdown = useCountdown(nextJob?.scheduled_start_at ? new Date(nextJob.scheduled_start_at) : null);
  if (!nextJob) return null;
  const isInProgress = nextJob.status === "in_progress";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className={`border-2 ${isInProgress ? "border-primary/40 bg-primary/5" : "border-success/40 bg-success/5"}`}>
        <CardContent className="p-4 sm:p-5 flex items-center gap-4">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isInProgress ? "bg-primary/15" : "bg-success/15"}`}>
            <Timer className={`h-7 w-7 ${isInProgress ? "text-primary animate-pulse" : "text-success"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
              {isInProgress ? "🟢 Job In Progress" : "📅 Today's Next Job"}
            </p>
            <p className="font-bold text-lg capitalize">
              {nextJob.cleaning_type?.replace("_", " ") || "Standard"} Clean
            </p>
            <p className="text-sm text-muted-foreground">
              {isInProgress ? "You're on the clock — keep going!" : `Starts in ${countdown} · ${format(new Date(nextJob.scheduled_start_at!), "h:mm a")}`}
            </p>
          </div>
          <Button size="sm" asChild className="flex-shrink-0 rounded-xl">
            <Link to={`/cleaner/jobs/${nextJob.id}`}>
              {isInProgress ? "Continue" : "View"} <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CleanerDashboard() {
  const { user } = useAuth();
  const { profile, isLoading: isLoadingProfile } = useCleanerProfile();
  const { stats, isLoading: isLoadingStats } = useCleanerStats();
  const { jobs } = useCleanerJobs();
  const { data: scheduleSuggestions } = useSmartScheduling();

  const displayName = profile?.first_name || user?.name?.split(" ")[0] || "Cleaner";
  const tier = (profile?.tier || "bronze") as CleanerTier;
  const tierStyle = TIER_COLORS[tier] || TIER_COLORS.bronze;
  const tipIdx = (new Date().getDate() + (profile?.reliability_score || 0) % 4) % TIPS.length;
  const tip = TIPS[tipIdx];

  return (
    <main className="flex-1 bg-background min-h-screen">
      <Helmet><title>Cleaner Dashboard | PureTask</title></Helmet>
      <div className={`relative overflow-hidden bg-gradient-to-br ${tierStyle.gradient} border-b border-border/50`}>
        <div className="absolute inset-0 opacity-[0.03]">
          <img src={cleanerHeroImg} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
        </div>
        <div className="relative container px-4 sm:px-6 py-5 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl ${tierStyle.bg} flex items-center justify-center font-black text-lg sm:text-xl ${tierStyle.text} flex-shrink-0`}>
                  {displayName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Welcome back 👋</p>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    Hey, <span className={tierStyle.text}>{displayName}!</span>
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${tierStyle.bg} ${tierStyle.text} ${tierStyle.border} capitalize border font-semibold text-xs`}>
                  <Award className="h-3 w-3 mr-1" />{tier} Tier
                </Badge>
                {profile?.reliability_score && (
                  <Badge variant="outline" className="border-border/60 text-xs">
                    <Shield className="h-3 w-3 mr-1 text-success" />{profile.reliability_score}% Reliable
                  </Badge>
                )}
              </div>
            </motion.div>

            <div className="flex gap-2 sm:gap-3">
              <Button asChild className="rounded-xl h-9 sm:h-10 text-xs sm:text-sm flex-1 sm:flex-none">
                <Link to="/cleaner/jobs"><Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />My Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CleanerLayout>
        <div className="space-y-5 sm:space-y-8">

          {/* Today's job */}
          <TodayJobBanner jobs={jobs} />

          {/* Stats Grid */}
          <section>
            <h2 className="text-[10px] sm:text-xs font-bold mb-3 sm:mb-4 text-muted-foreground uppercase tracking-wide">This Week</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
              {isLoadingStats ? (
                [1,2,3,4].map(i => <Skeleton key={i} className="h-20 sm:h-24 rounded-2xl" />)
              ) : (
                <>
                  <motion.div whileHover={{ y: -2 }}>
                    <StatCard icon={Briefcase} value={stats.jobsThisWeek} label="Jobs This Week" iconColor="text-primary" iconBgColor="bg-primary/10" />
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }}>
                    <StatCard icon={Clock} value={`${stats.hoursThisWeek}h`} label="Hours Worked" iconColor="text-[hsl(var(--pt-purple))]" iconBgColor="bg-[hsl(var(--pt-purple)/0.1)]" />
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }}>
                    <StatCard icon={DollarSign} value={`$${stats.earnedThisWeek}`} label="Earned" iconColor="text-success" iconBgColor="bg-success/10" />
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }}>
                    <StatCard icon={MessageSquare} value={stats.unreadMessages} label="Messages" iconColor="text-warning" iconBgColor="bg-warning/10" />
                  </motion.div>
                </>
              )}
            </div>
          </section>

          {/* Reliability + Tier */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="md:col-span-2">
                {isLoadingProfile ? <Skeleton className="h-32 sm:h-36 rounded-2xl" /> : (
                  <ReliabilityScoreWidget />
                )}
              </div>
              <TierBadge />
            </div>
          </section>

          {/* Profile completion */}
          {profile && (
            <ProfileCompletion profile={profile} hasServiceAreas={false} hasAvailability={false} />
          )}

          {/* Tier Progress */}
          {profile && (
            <TierProgressMap
              currentTier={tier}
              reliabilityScore={profile.reliability_score || 0}
              jobsCompleted={profile.jobs_completed || 0}
            />
          )}

          {/* Tip of the day */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="bg-gradient-to-r from-primary/5 to-[hsl(var(--pt-aqua)/0.05)] border-primary/20">
              <CardContent className="p-3.5 sm:p-5 flex items-start gap-3 sm:gap-4">
                <span className="text-2xl sm:text-3xl flex-shrink-0">{tip.icon}</span>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary mb-1 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Tip of the Day
                  </p>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">{tip.text}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gamification */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">🎯 Goals & Rewards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <GoalsCard />
              <StreakCard />
              <BoostCard />
            </div>
          </section>

          {/* Smart Scheduling Suggestions */}
          {scheduleSuggestions && scheduleSuggestions.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning" />Schedule Suggestions
              </h2>
              <div className="space-y-2">
                {scheduleSuggestions.slice(0, 3).map(s => (
                  <Card key={s.dayOfWeek} className="border-warning/20 bg-warning/5">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{s.dayName} · {s.startTime}–{s.endTime}</p>
                        <p className="text-xs text-muted-foreground">{s.reason}</p>
                      </div>
                      <Badge variant="outline" className="text-xs border-warning/30 text-warning">{s.demandScore}% demand</Badge>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" size="sm" asChild className="w-full rounded-xl mt-2">
                  <Link to="/cleaner/availability">Manage Availability</Link>
                </Button>
              </div>
            </motion.section>
          )}

          {/* Referral */}
          <InviteFriendsCTA linkTo="/cleaner/referral" />

          {/* All Features by Category */}
          {FEATURE_SECTIONS.map((section, si) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: si * 0.05 }}
            >
              <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-4">{section.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                {section.items.map((item) => (
                  <motion.div key={item.label} whileHover={{ y: -3, scale: 1.01 }} transition={{ type: "spring", stiffness: 400 }}>
                    <Link to={item.href}>
                      <Card className={`border ${section.color} hover:shadow-elevated transition-all duration-200 cursor-pointer h-full`}>
                        <CardContent className="p-3 sm:p-4">
                          <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl ${section.iconBg} flex items-center justify-center mb-2 sm:mb-3`}>
                            <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${section.iconColor}`} />
                          </div>
                          <p className="font-semibold text-xs sm:text-sm leading-tight">{item.label}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-snug">{item.desc}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </CleanerLayout>

      {/* Onboarding Tooltips */}
      <OnboardingTooltips steps={CLEANER_ONBOARDING_STEPS} storageKey="cleaner-onboarding-seen" />
    </main>
  );
}
