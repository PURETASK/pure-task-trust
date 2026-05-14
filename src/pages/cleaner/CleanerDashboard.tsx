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
import { TIPS, TIER_COLORS, FEATURE_SECTIONS } from "@/lib/cleaner-dashboard-constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { CleanerTier } from "@/lib/tier-config";
import { Pill, SectionLabel } from "@/components/wf";
import {
  Briefcase, Clock, DollarSign, MessageSquare,
  Lightbulb, Shield, Award, Zap,
} from "lucide-react";




export default function CleanerDashboard() {
  const { user } = useAuth();
  const { profile, isLoading: isLoadingProfile } = useCleanerProfile();
  const { stats, isLoading: isLoadingStats } = useCleanerStats();
  const { jobs } = useCleanerJobs();
  const { data: scheduleSuggestions } = useSmartScheduling();

  const displayName = profile?.first_name || user?.name?.split(" ")[0] || "Cleaner";
  const tier = (profile?.tier || "bronze") as CleanerTier;
  const tipIdx = (new Date().getDate() + (profile?.reliability_score || 0) % 4) % TIPS.length;
  const tip = TIPS[tipIdx];

  return (
    <main className="flex-1 bg-app-canvas min-h-screen">
      <Helmet><title>Cleaner Dashboard | PureTask</title></Helmet>
      <div className="relative bg-app-surface border-b border-hairline-soft">
        <div className="relative container px-4 sm:px-6 py-5 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-[10px] bg-app-canvas border border-hairline flex items-center justify-center font-semibold text-base sm:text-lg text-ink flex-shrink-0">
                  {displayName.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.08em] uppercase text-ink-faint">Welcome back</p>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-ink">
                    Hey, {displayName}!
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Pill variant="gold" className="capitalize"><Award className="h-3 w-3" />{tier} Tier</Pill>
                {profile?.reliability_score && (
                  <Pill variant="success"><Shield className="h-3 w-3" />{profile.reliability_score}% Reliable</Pill>
                )}
              </div>
            </motion.div>

            <div className="flex gap-2 sm:gap-3">
              <Button asChild className="rounded-xl h-9 sm:h-10 text-xs sm:text-sm flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                <Link to="/cleaner/jobs"><Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />My Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CleanerLayout>
        <div className="space-y-5 sm:space-y-8">
          {/* Dynamic Hero — changes based on job state */}
          <DynamicHeroCard jobs={jobs} />

          {/* Stats Grid */}
          <section>
            <SectionLabel>This Week</SectionLabel>
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
            <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
              <span className="text-2xl sm:text-3xl flex-shrink-0">{tip.icon}</span>
              <div>
                <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-ink-faint mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> Tip of the Day
                </p>
                <p className="text-xs sm:text-sm text-ink leading-relaxed">{tip.text}</p>
              </div>
            </div>
          </motion.div>

          {/* Gamification */}
          <section>
            <SectionLabel>Goals & Rewards</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <GoalsCard />
              <StreakCard />
              <BoostCard />
            </div>
          </section>

          {/* Smart Scheduling Suggestions */}
          {scheduleSuggestions && scheduleSuggestions.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <SectionLabel>Schedule Suggestions</SectionLabel>
              <div className="space-y-2">
                {scheduleSuggestions.slice(0, 3).map(s => (
                  <div key={s.dayOfWeek} className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf p-3 sm:p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-app-canvas border border-hairline flex items-center justify-center flex-shrink-0 text-state-warning-fg">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink">{s.dayName} · {s.startTime}–{s.endTime}</p>
                      <p className="text-xs text-ink-muted">{s.reason}</p>
                    </div>
                    <Pill variant="warning">{s.demandScore}% demand</Pill>
                  </div>
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
              <SectionLabel>{section.title}</SectionLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                {section.items.map((item) => (
                  <Link key={item.label} to={item.href} className="group">
                    <div className="rounded-[10px] bg-app-surface border border-hairline-soft shadow-wf hover:shadow-wf-hover transition-shadow p-3 sm:p-4 h-full">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-md bg-app-canvas border border-hairline flex items-center justify-center mb-2 sm:mb-3 text-ink-muted">
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <p className="font-semibold text-xs sm:text-sm leading-tight text-ink">{item.label}</p>
                      <p className="text-[10px] sm:text-xs text-ink-muted mt-0.5 sm:mt-1 leading-snug">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </CleanerLayout>

      {/* Onboarding Tooltips — only on a cleaner's first ever login (server-backed). */}
      <OnboardingTooltips
        steps={CLEANER_ONBOARDING_STEPS}
        storageKey="cleaner-onboarding-seen"
        loading={isLoadingProfile}
        seen={!!(profile as any)?.dashboard_tour_seen_at}
        markSeenRpc="mark_my_cleaner_tour_seen"
      />
    </main>
  );
}
