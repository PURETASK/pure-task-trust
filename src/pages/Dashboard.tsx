import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Calendar, Clock, Star, Heart, Repeat, Trash2, Check,
  Sparkles, MessageCircle, RotateCcw, Zap,
  TrendingUp, CreditCard, Home, Search, Gift,
  ChevronRight, AlertCircle, ArrowRight,
  Wallet, BookOpen, Briefcase, Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { InviteFriendsCTA } from "@/components/referral";
import { LoyaltyTracker } from "@/components/loyalty/LoyaltyTracker";
import { Skeleton } from "@/components/ui/skeleton";
import clientHeroImg from "@/assets/client-hero.jpg";
import { useClientDashboard } from "@/hooks/useClientDashboard";

const QUICK_ACTIONS = [
  { icon: Plus, label: "Book a Clean", href: "/book", desc: "Schedule your next visit", color: "border-primary/50 bg-primary/10", iconColor: "text-primary", priority: true },
  { icon: Search, label: "Find Cleaners", href: "/discover", desc: "Browse local pros", color: "border-[hsl(var(--pt-aqua))]/40 bg-[hsl(var(--pt-aqua))]/10", iconColor: "text-[hsl(var(--pt-aqua))]" },
  { icon: CreditCard, label: "My Wallet", href: "/wallet", desc: "Credits & transactions", color: "border-success/40 bg-success/10", iconColor: "text-success" },
  { icon: Home, label: "My Properties", href: "/properties", desc: "Manage addresses", color: "border-warning/40 bg-warning/10", iconColor: "text-warning" },
  { icon: MessageCircle, label: "Messages", href: "/messages", desc: "Chat with cleaners", color: "border-primary/40 bg-primary/10", iconColor: "text-primary" },
  { icon: Heart, label: "Favourites", href: "/favorites", desc: "Saved cleaners", color: "border-destructive/40 bg-destructive/10", iconColor: "text-destructive" },
  { icon: Repeat, label: "Recurring Plans", href: "/recurring-plans", desc: "Subscriptions", color: "border-[hsl(var(--pt-purple))]/40 bg-[hsl(var(--pt-purple))]/10", iconColor: "text-[hsl(var(--pt-purple))]" },
  { icon: Gift, label: "Refer Friends", href: "/referral", desc: "Earn free credits", color: "border-warning/40 bg-warning/10", iconColor: "text-warning" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed": return <Badge className="bg-success/15 text-success border-2 border-success/40 text-xs font-bold">Confirmed</Badge>;
    case "pending":
    case "created": return <Badge className="bg-warning/15 text-warning border-2 border-warning/40 text-xs font-bold">Pending</Badge>;
    case "in_progress": return <Badge className="bg-primary/15 text-primary border-2 border-primary/40 animate-pulse text-xs font-bold">Live</Badge>;
    case "completed": return <Badge className="bg-success/15 text-success border-2 border-success/40 text-xs font-bold">Done</Badge>;
    case "cancelled": return <Badge className="border-2 border-border text-xs text-muted-foreground">Cancelled</Badge>;
    default: return <Badge className="border-2 border-border text-xs">{status}</Badge>;
  }
}

function getDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
  const day = new Date(d); day.setHours(0,0,0,0);
  if (day.getTime() === today.getTime()) return <span className="text-primary font-bold">Today</span>;
  if (day.getTime() === tomorrow.getTime()) return <span className="text-warning font-bold">Tomorrow</span>;
  return <span>{format(d, "EEE, MMM d")}</span>;
}

const f = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "approval" | "past" | "favorites" | "recurring">("upcoming");

  const {
    favorites,
    recurring,
    upcomingJobs,
    pendingApprovalJobs,
    pastJobs,
    todayJobs,
    recentCleaners,
    firstName,
    balance,
    isLoading,
    loadingFavorites,
    removeFavorite,
  } = useClientDashboard();

  return (
    <main className="flex-1 bg-background min-h-screen">
      <Helmet><title>Client Dashboard | PureTask</title></Helmet>

      {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/12 via-background to-[hsl(var(--pt-aqua)/0.06)] border-b-2 border-border/50">
        <div className="absolute inset-0 opacity-20">
          <img src={clientHeroImg} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        {/* Glow orbs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "hsl(var(--primary)/0.12)" }} />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: "hsl(var(--pt-aqua)/0.10)" }} />

        <div className="relative container px-4 sm:px-6 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div {...f(0)}>
              <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center font-black text-lg sm:text-xl text-primary flex-shrink-0">
                  {firstName?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Welcome back 👋</p>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">
                    Hello, <span className="text-primary">{firstName}!</span>
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-primary/10 text-primary border-2 border-primary/30 font-bold text-xs">
                  <Shield className="h-3 w-3 mr-1" />Client Account
                </Badge>
              </div>
            </motion.div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Wallet pill */}
              <div className="flex items-center gap-2.5 rounded-2xl border-2 border-success/50 bg-success/10 px-4 py-2.5">
                <Wallet className="h-4 w-4 text-success" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">Balance</p>
                  <p className="font-black text-success text-sm leading-none">{balance.toLocaleString()} cr</p>
                </div>
              </div>
              <Button asChild size="lg" className="rounded-2xl h-11 sm:h-12 px-5 sm:px-6">
                <Link to="/book">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" /> Book a Clean
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-3 sm:px-4 lg:px-6 py-3 sm:py-6 max-w-5xl space-y-5 sm:space-y-8">

        {/* ── TODAY'S LIVE BANNER ───────────────────────────────────────── */}
        <AnimatePresence>
          {todayJobs.map(job => (
            <motion.div key={job.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Link to={`/booking/${job.id}`}>
                <div className={`rounded-3xl border-2 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-elevated transition-all ${
                  job.status === "in_progress"
                    ? "border-primary/50 bg-primary/5"
                    : "border-success/50 bg-success/5"
                }`}>
                  <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 ${
                    job.status === "in_progress"
                      ? "bg-primary/15 border-primary/40"
                      : "bg-success/15 border-success/40"
                  }`}>
                    <Zap className={`h-6 w-6 sm:h-7 sm:w-7 ${job.status === "in_progress" ? "text-primary" : "text-success"} animate-pulse`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm sm:text-base">{job.status === "in_progress" ? "🧹 Cleaning in progress!" : "✅ Cleaning confirmed today"}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground capitalize truncate">
                      {job.cleaning_type?.replace("_", " ")} Clean · {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "h:mm a") : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs sm:text-sm font-bold text-primary flex-shrink-0">
                    Track <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── PENDING APPROVAL ALERT ────────────────────────────────────── */}
        {pendingApprovalJobs.length > 0 && (
          <motion.div {...f(0.05)}>
            <div className="rounded-3xl border-2 border-warning/50 bg-warning/5 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-warning/15 border-2 border-warning/40 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm sm:text-base">{pendingApprovalJobs.length} job{pendingApprovalJobs.length > 1 ? "s" : ""} awaiting approval</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Review photos and release payment.</p>
              </div>
              <Button size="sm" onClick={() => setActiveTab("approval")} className="rounded-xl flex-shrink-0 h-9 text-xs px-4 border-2 border-warning/40 bg-warning/10 text-warning hover:bg-warning/20" variant="outline">
                Review
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── LOYALTY TRACKER ──────────────────────────────────────────── */}
        <LoyaltyTracker />

        {/* ── STATS ROW ────────────────────────────────────────────────── */}
        <motion.section {...f(0.08)}>
          <h2 className="text-[10px] sm:text-xs font-black mb-3 sm:mb-4 text-muted-foreground uppercase tracking-widest">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {[
              { icon: Calendar, value: upcomingJobs.length, label: "Upcoming", color: "border-primary/50 bg-primary/10", iconColor: "text-primary" },
              { icon: Check, value: pendingApprovalJobs.length, label: "To Approve", color: "border-warning/50 bg-warning/10", iconColor: "text-warning" },
              { icon: Heart, value: favorites?.length || 0, label: "Favorites", color: "border-destructive/50 bg-destructive/10", iconColor: "text-destructive" },
              { icon: Repeat, value: recurring?.length || 0, label: "Plans", color: "border-[hsl(var(--pt-purple))]/50 bg-[hsl(var(--pt-purple))]/10", iconColor: "text-[hsl(var(--pt-purple))]" },
            ].map((s, i) => (
              <motion.div key={s.label} whileHover={{ y: -2 }}>
                <div className={`rounded-2xl border-2 ${s.color} p-3 sm:p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className={`h-4 w-4 ${s.iconColor}`} />
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wide">{s.label}</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── QUICK ACTIONS ─────────────────────────────────────────────── */}
        <motion.section {...f(0.12)}>
          <h2 className="text-base sm:text-xl font-black mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {QUICK_ACTIONS.map((a, i) => (
              <motion.div key={a.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.04 }} whileHover={{ y: -3, scale: 1.01 }}>
                <Link to={a.href}>
                  <div className={`rounded-2xl border-2 ${a.color} p-3 sm:p-4 hover:shadow-elevated transition-all duration-200 cursor-pointer h-full`}>
                    <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-2 ${a.color} flex items-center justify-center mb-2.5 sm:mb-3`}>
                      <a.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${a.iconColor}`} />
                    </div>
                    <p className="font-bold text-xs sm:text-sm leading-tight">{a.label}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">{a.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── BOOK AGAIN: RECENT CLEANERS ───────────────────────────────── */}
        {recentCleaners.length > 0 && (
          <motion.section {...f(0.16)}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-xl font-black">Book Again</h2>
              <Link to="/discover" className="text-xs sm:text-sm text-primary font-bold hover:underline">Find new →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory">
              {recentCleaners.map((job, i) => {
                const name = `${job.cleaner?.first_name || ""} ${job.cleaner?.last_name || ""}`.trim() || "Cleaner";
                return (
                  <motion.div key={job.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex-shrink-0 snap-start">
                    <Link to={`/book?cleaner=${job.cleaner_id}&type=${job.cleaning_type}`}>
                      <div className="w-36 sm:w-44 rounded-2xl border-2 border-primary/30 bg-primary/5 p-3 sm:p-4 hover:shadow-elevated hover:border-primary/50 transition-all">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center font-black text-primary text-base sm:text-lg mb-2.5 sm:mb-3">
                          {name.charAt(0)}
                        </div>
                        <p className="font-bold text-xs sm:text-sm truncate">{name}</p>
                        {job.cleaner?.avg_rating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-warning text-warning" />
                            {job.cleaner.avg_rating.toFixed(1)}
                          </div>
                        )}
                        <p className="text-[10px] sm:text-xs text-muted-foreground capitalize mt-1 truncate">{(job.cleaning_type || "").replace("_", " ")}</p>
                        <Button size="sm" className="w-full mt-2.5 sm:mt-3 h-7 sm:h-8 text-[10px] sm:text-xs rounded-xl">
                          <RotateCcw className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Rebook
                        </Button>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── REFERRAL CTA ──────────────────────────────────────────────── */}
        <InviteFriendsCTA />

        {/* ── BOOKINGS TABS ─────────────────────────────────────────────── */}
        <motion.section {...f(0.2)}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-xl font-black">Your Bookings</h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 mb-4 sm:mb-6 no-scrollbar">
            {[
              { key: "upcoming", label: "Upcoming", count: upcomingJobs.length, icon: Calendar, color: "border-primary/50 bg-primary/10 text-primary" },
              { key: "approval", label: "Approve", count: pendingApprovalJobs.length, icon: Check, alert: pendingApprovalJobs.length > 0, color: "border-warning/50 bg-warning/10 text-warning" },
              { key: "past", label: "Past", count: pastJobs.length, icon: Clock, color: "border-muted-foreground/30 bg-muted text-muted-foreground" },
              { key: "favorites", label: "Saved", count: favorites?.length || 0, icon: Heart, color: "border-destructive/40 bg-destructive/10 text-destructive" },
              { key: "recurring", label: "Plans", count: recurring?.length || 0, icon: Repeat, color: "border-[hsl(var(--pt-purple))]/40 bg-[hsl(var(--pt-purple))]/10 text-[hsl(var(--pt-purple))]" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 border-2 ${
                  activeTab === tab.key
                    ? tab.color
                    : "border-border/40 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[9px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full font-black ${
                    activeTab === tab.key ? "bg-foreground/10" : tab.alert ? "bg-destructive text-destructive-foreground" : "bg-background text-foreground"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

              {/* UPCOMING */}
              {activeTab === "upcoming" && (
                isLoading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 sm:h-28 rounded-2xl" />)}</div>
                : upcomingJobs.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingJobs.map((job, i) => {
                      const cleanerName = job.cleaner ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() : "Finding cleaner…";
                      return (
                        <motion.div key={job.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <Link to={`/booking/${job.id}`}>
                            <div className="rounded-2xl border-2 border-primary/20 hover:border-primary/40 hover:shadow-elevated transition-all p-3 sm:p-4 lg:p-5 bg-card">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-black text-primary text-base sm:text-lg flex-shrink-0">
                                  {cleanerName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                                    <p className="font-bold text-sm sm:text-base truncate">{cleanerName}</p>
                                    {getStatusBadge(job.status)}
                                  </div>
                                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
                                    {job.scheduled_start_at && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        {getDateLabel(job.scheduled_start_at)}
                                      </span>
                                    )}
                                    {job.scheduled_start_at && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        {format(new Date(job.scheduled_start_at), "h:mm a")}
                                      </span>
                                    )}
                                    <span className="capitalize">{(job.cleaning_type || "").replace("_", " ")}</span>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16 rounded-3xl border-2 border-dashed border-border">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary/40" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black mb-2">No upcoming bookings</h3>
                    <p className="text-sm text-muted-foreground mb-5 sm:mb-6">Book a verified cleaner for your home today.</p>
                    <Button asChild className="rounded-2xl h-10 sm:h-11 px-5 sm:px-6">
                      <Link to="/book"><Plus className="h-4 w-4 mr-2" />Book Now</Link>
                    </Button>
                  </div>
                )
              )}

              {/* APPROVAL */}
              {activeTab === "approval" && (
                pendingApprovalJobs.length > 0 ? (
                  <div className="space-y-3">
                    {pendingApprovalJobs.map((job, i) => {
                      const cleanerName = job.cleaner ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() : "Cleaner";
                      return (
                        <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <Link to={`/booking/${job.id}`}>
                            <div className="rounded-2xl border-2 border-warning/40 hover:shadow-elevated transition-all p-3 sm:p-5 bg-card">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-2xl bg-warning/10 border-2 border-warning/30 flex items-center justify-center font-black text-warning text-base flex-shrink-0">
                                    {cleanerName.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-sm sm:text-base">{cleanerName}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground capitalize">{(job.cleaning_type || "").replace("_", " ")} · Awaiting your approval</p>
                                  </div>
                                </div>
                                <Button size="sm" className="flex-shrink-0 rounded-xl h-8 text-xs">Review</Button>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-sm rounded-2xl border-2 border-dashed border-border">No jobs awaiting approval.</div>
                )
              )}

              {/* PAST */}
              {activeTab === "past" && (
                isLoading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
                : pastJobs.length > 0 ? (
                  <div className="space-y-2.5 sm:space-y-3">
                    {pastJobs.slice(0, 10).map((job, i) => {
                      const cleanerName = job.cleaner ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() : "Cleaner";
                      return (
                        <motion.div key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                          <Link to={`/booking/${job.id}`}>
                            <div className="rounded-2xl border-2 border-border/40 hover:border-border transition-all p-3 sm:p-4 bg-card flex items-center gap-3">
                              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-muted border-2 border-border/40 flex items-center justify-center font-bold text-muted-foreground text-sm flex-shrink-0">
                                {cleanerName.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{cleanerName}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {(job.cleaning_type || "").replace("_", " ")} · {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "MMM d, yyyy") : ""}
                                </p>
                              </div>
                              {getStatusBadge(job.status)}
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground text-sm rounded-2xl border-2 border-dashed border-border">No completed bookings yet.</div>
                )
              )}

              {/* FAVORITES */}
              {activeTab === "favorites" && (
                loadingFavorites ? <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
                : (favorites?.length || 0) > 0 ? (
                  <div className="space-y-3">
                    {favorites!.map((fav: any, i: number) => {
                      const name = fav.cleaner ? `${fav.cleaner.first_name || ""} ${fav.cleaner.last_name || ""}`.trim() || "Cleaner" : "Cleaner";
                      return (
                        <motion.div key={fav.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <div className="rounded-2xl border-2 border-destructive/20 hover:border-destructive/40 transition-all p-3 sm:p-4 bg-card flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center font-black text-destructive text-base flex-shrink-0">
                              {name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{name}</p>
                              {fav.cleaner?.avg_rating && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                                  {fav.cleaner.avg_rating.toFixed(1)} rating
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" asChild className="rounded-xl h-8 text-xs">
                                <Link to={`/book?cleaner=${fav.cleaner_id}`}>Book</Link>
                              </Button>
                              <Button size="sm" variant="ghost" onClick={(e) => { e.preventDefault(); removeFavorite(fav.cleaner_id); }} className="rounded-xl h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-2xl border-2 border-dashed border-border">
                    <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No favourite cleaners yet.</p>
                    <Button size="sm" asChild variant="outline" className="mt-3 rounded-xl border-2">
                      <Link to="/discover">Browse Cleaners</Link>
                    </Button>
                  </div>
                )
              )}

              {/* RECURRING */}
              {activeTab === "recurring" && (
                (recurring?.length || 0) > 0 ? (
                  <div className="space-y-3">
                    {recurring!.map((plan: any, i: number) => (
                      <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="rounded-2xl border-2 border-[hsl(var(--pt-purple))]/30 hover:border-[hsl(var(--pt-purple))]/50 transition-all p-3 sm:p-4 bg-card flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-[hsl(var(--pt-purple))]/10 border-2 border-[hsl(var(--pt-purple))]/30 flex items-center justify-center flex-shrink-0">
                            <Repeat className="h-5 w-5 text-[hsl(var(--pt-purple))]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm capitalize">{plan.cleaning_type?.replace("_", " ") || "Recurring Clean"}</p>
                            <p className="text-xs text-muted-foreground capitalize">{plan.frequency || "weekly"} · {plan.preferred_time || "Flexible"}</p>
                          </div>
                          <Badge className={`text-xs border-2 ${plan.is_active ? "text-success border-success/40 bg-success/10" : "text-muted-foreground border-border"}`}>
                            {plan.is_active ? "Active" : "Paused"}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-2xl border-2 border-dashed border-border">
                    <Repeat className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">No recurring plans yet.</p>
                    <Button size="sm" asChild variant="outline" className="rounded-xl border-2">
                      <Link to="/recurring-plans">Set Up Plan</Link>
                    </Button>
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </motion.section>
      </div>
    </main>
  );
}
