import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Calendar, Clock, Star, Heart, Repeat, Trash2, Check,
  Sparkles, MessageCircle, RotateCcw, HelpCircle, Zap, MapPin,
  TrendingUp, CreditCard, Home, Search, Gift, Settings, Users,
  ChevronRight, AlertCircle, Bell, ArrowRight, Camera, Shield,
  Wallet, BookOpen
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useClientJobs } from "@/hooks/useJob";
import { useFavorites, useFavoriteActions } from "@/hooks/useFavorites";
import { useRecurringBookings } from "@/hooks/useRecurringBookings";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { format, isToday, isTomorrow } from "date-fns";
import { InviteFriendsCTA } from "@/components/referral";
import { LoyaltyTracker } from "@/components/loyalty/LoyaltyTracker";
import { Skeleton } from "@/components/ui/skeleton";
import clientHeroImg from "@/assets/client-hero.jpg";

const QUICK_ACTIONS = [
  { icon: Plus, label: "Book a Clean", href: "/book", color: "bg-primary text-primary-foreground", desc: "Schedule your next visit", priority: true },
  { icon: Search, label: "Find Cleaners", href: "/discover", color: "bg-[hsl(var(--pt-aqua)/0.15)] text-[hsl(var(--pt-aqua))]", desc: "Browse local pros" },
  { icon: CreditCard, label: "My Wallet", href: "/wallet", color: "bg-success/10 text-success", desc: "Credits & transactions" },
  { icon: Home, label: "My Properties", href: "/properties", color: "bg-warning/10 text-warning", desc: "Manage addresses" },
  { icon: MessageCircle, label: "Messages", href: "/messages", color: "bg-primary/10 text-primary", desc: "Chat with cleaners" },
  { icon: Heart, label: "Favourites", href: "/favorites", color: "bg-destructive/10 text-destructive", desc: "Saved cleaners" },
  { icon: Repeat, label: "Recurring Plans", href: "/recurring", color: "bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))]", desc: "Subscriptions" },
  { icon: Gift, label: "Refer Friends", href: "/referral", color: "bg-warning/10 text-warning", desc: "Earn free credits" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed": return <Badge className="bg-success/10 text-success border-success/30 border text-xs">Confirmed</Badge>;
    case "pending":
    case "created": return <Badge className="bg-warning/10 text-warning border-warning/30 border text-xs">Pending</Badge>;
    case "in_progress": return <Badge className="bg-primary/10 text-primary border-primary/30 border animate-pulse text-xs">Live</Badge>;
    case "completed": return <Badge className="bg-success/10 text-success border-success/30 border text-xs">Done</Badge>;
    case "cancelled": return <Badge variant="outline" className="text-xs text-muted-foreground">Cancelled</Badge>;
    default: return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function getDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return <span className="text-primary font-semibold">Today</span>;
  if (isTomorrow(d)) return <span className="text-warning font-semibold">Tomorrow</span>;
  return <span>{format(d, "EEE, MMM d")}</span>;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "approval" | "past" | "favorites" | "recurring">("upcoming");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: jobs, isLoading } = useClientJobs();
  const { data: favorites, isLoading: loadingFavorites } = useFavorites();
  const { data: recurring } = useRecurringBookings();
  const { removeFavorite } = useFavoriteActions();
  const { account } = useWallet();

  const upcomingJobs = jobs?.filter(j => ["created", "pending", "confirmed", "in_progress"].includes(j.status)) ?? [];
  const pendingApprovalJobs = jobs?.filter(j => j.status === "completed" && j.final_charge_credits == null) ?? [];
  const pastJobs = jobs?.filter(j => (j.status === "completed" && j.final_charge_credits != null) || j.status === "cancelled") ?? [];
  const todayJobs = upcomingJobs.filter(j => j.scheduled_start_at && isToday(new Date(j.scheduled_start_at)));

  const firstName = user?.name?.split(" ")[0] || "there";
  const balance = account?.current_balance ?? 0;

  const pastWithCleaner = jobs?.filter(j => j.status === "completed" && j.cleaner_id && j.cleaner) ?? [];
  const seen = new Set<string>();
  const recentCleaners = pastWithCleaner.filter(j => {
    if (!j.cleaner_id || seen.has(j.cleaner_id)) return false;
    seen.add(j.cleaner_id);
    return true;
  }).slice(0, 4);

  return (
    <main className="flex-1 bg-background min-h-screen">
      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-[hsl(var(--pt-aqua)/0.05)] border-b border-border/50">
        <div className="absolute inset-0 opacity-[0.04]">
          <img src={clientHeroImg} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="relative container px-4 sm:px-6 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-0.5 sm:mb-1">Welcome back 👋</p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Hello, <span className="text-primary">{firstName}!</span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">Your home is in good hands.</p>
              </motion.div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground">Wallet Balance</p>
                    <p className="font-bold text-primary text-sm">{balance.toLocaleString()} credits</p>
                  </div>
                </CardContent>
              </Card>
              <Button asChild size="lg" className="rounded-2xl h-11 sm:h-12 px-5 sm:px-6 shadow-card">
                <Link to="/book">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" /> Book a Clean
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-8">

        {/* ── TODAY'S LIVE BANNER ───────────────────────────────────────── */}
        <AnimatePresence>
          {todayJobs.map(job => (
            <motion.div key={job.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Link to={`/booking/${job.id}`}>
                <Card className={`border-2 ${job.status === "in_progress" ? "border-primary/40 bg-primary/5" : "border-success/40 bg-success/5"} hover:shadow-elevated transition-all`}>
                  <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${job.status === "in_progress" ? "bg-primary/15" : "bg-success/15"}`}>
                      <Zap className={`h-5 w-5 sm:h-6 sm:w-6 ${job.status === "in_progress" ? "text-primary" : "text-success"} animate-pulse`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base">{job.status === "in_progress" ? "🧹 Cleaning in progress right now!" : "✅ Cleaning confirmed for today"}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground capitalize truncate">
                        {job.cleaning_type?.replace("_", " ")} Clean · {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "h:mm a") : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs sm:text-sm font-medium text-primary flex-shrink-0">
                      Track <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── PENDING APPROVAL ALERT ────────────────────────────────────── */}
        {pendingApprovalJobs.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-warning/40 bg-warning/5">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base">{pendingApprovalJobs.length} job{pendingApprovalJobs.length > 1 ? "s" : ""} awaiting approval</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Review photos and release payment.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveTab("approval")} className="border-warning/40 text-warning hover:bg-warning/10 rounded-xl flex-shrink-0 h-8 text-xs px-3">
                  Review
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── LOYALTY TRACKER ──────────────────────────────────────────── */}
        <LoyaltyTracker />

        {/* ── QUICK ACTIONS ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {QUICK_ACTIONS.map((a, i) => (
              <motion.div key={a.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -2 }}>
                <Link to={a.href}>
                  <Card className={`border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-200 cursor-pointer h-full ${a.priority ? "border-primary/30 bg-primary/3" : ""}`}>
                    <CardContent className="p-3 sm:p-4">
                      <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl ${a.color} flex items-center justify-center mb-2.5 sm:mb-3`}>
                        <a.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <p className="font-semibold text-xs sm:text-sm leading-tight">{a.label}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">{a.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── BOOK AGAIN: RECENT CLEANERS ───────────────────────────────── */}
        {recentCleaners.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Book Again</h2>
              <Link to="/discover" className="text-xs sm:text-sm text-primary hover:underline">Find new →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
              {recentCleaners.map((job, i) => {
                const name = `${job.cleaner?.first_name || ""} ${job.cleaner?.last_name || ""}`.trim() || "Cleaner";
                return (
                  <motion.div key={job.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex-shrink-0 snap-start">
                    <Link to={`/book?cleaner=${job.cleaner_id}&type=${job.cleaning_type}`}>
                      <Card className="w-36 sm:w-44 hover:shadow-elevated hover:border-primary/40 transition-all">
                        <CardContent className="p-3 sm:p-4">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-base sm:text-lg mb-2.5 sm:mb-3">
                            {name.charAt(0)}
                          </div>
                          <p className="font-semibold text-xs sm:text-sm truncate">{name}</p>
                          {job.cleaner?.avg_rating && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-warning text-warning" />
                              {job.cleaner.avg_rating.toFixed(1)}
                            </div>
                          )}
                          <p className="text-[10px] sm:text-xs text-muted-foreground capitalize mt-1 truncate">{(job.cleaning_type || "").replace("_", " ")}</p>
                          <Button size="sm" className="w-full mt-2.5 sm:mt-3 h-6 sm:h-7 text-[10px] sm:text-xs rounded-xl">
                            <RotateCcw className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Rebook
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── REFERRAL CTA ──────────────────────────────────────────────── */}
        <InviteFriendsCTA />

        {/* ── BOOKINGS TABS ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Your Bookings</h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-4 sm:mb-6 no-scrollbar">
            {[
              { key: "upcoming", label: "Upcoming", count: upcomingJobs.length, icon: Calendar },
              { key: "approval", label: "Approve", count: pendingApprovalJobs.length, icon: Check, alert: pendingApprovalJobs.length > 0 },
              { key: "past", label: "Past", count: pastJobs.length, icon: Clock },
              { key: "favorites", label: "Saved", count: favorites?.length || 0, icon: Heart },
              { key: "recurring", label: "Plans", count: recurring?.length || 0, icon: Repeat },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <tab.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[9px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key ? "bg-primary-foreground/20 text-primary-foreground" : tab.alert ? "bg-destructive text-destructive-foreground" : "bg-background text-foreground"
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
                            <Card className="hover:shadow-elevated hover:border-primary/30 transition-all">
                              <CardContent className="p-3 sm:p-4 lg:p-5">
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-base sm:text-lg flex-shrink-0">
                                    {cleanerName.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                                      <p className="font-semibold text-sm sm:text-base truncate">{cleanerName}</p>
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
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No upcoming bookings</h3>
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
                            <Card className="border-warning/40 hover:shadow-elevated transition-all">
                              <CardContent className="p-3 sm:p-5">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-warning/10 flex items-center justify-center font-bold text-warning text-base flex-shrink-0">
                                      {cleanerName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-sm sm:text-base">{cleanerName}</p>
                                      <p className="text-xs sm:text-sm text-muted-foreground capitalize">{(job.cleaning_type || "").replace("_", " ")} · Awaiting your approval</p>
                                    </div>
                                  </div>
                                  <Button size="sm" className="flex-shrink-0 rounded-xl h-8 text-xs">Review</Button>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-sm">No jobs awaiting approval.</div>
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
                            <Card className="hover:bg-muted/30 transition-all">
                              <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-muted flex items-center justify-center font-semibold text-muted-foreground text-sm flex-shrink-0">
                                  {cleanerName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{cleanerName}</p>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {(job.cleaning_type || "").replace("_", " ")} · {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "MMM d, yyyy") : ""}
                                  </p>
                                </div>
                                {getStatusBadge(job.status)}
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground text-sm">No completed bookings yet.</div>
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
                          <Card className="hover:shadow-card transition-all">
                            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                              <div className="h-10 w-10 rounded-2xl bg-destructive/10 flex items-center justify-center font-bold text-destructive text-base flex-shrink-0">
                                {name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{name}</p>
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
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Heart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No favourite cleaners yet.</p>
                    <Button size="sm" asChild variant="outline" className="mt-3 rounded-xl">
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
                        <Card className="hover:shadow-card transition-all">
                          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-[hsl(var(--pt-purple)/0.1)] flex items-center justify-center flex-shrink-0">
                              <Repeat className="h-5 w-5 text-[hsl(var(--pt-purple))]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm capitalize">{plan.cleaning_type?.replace("_", " ") || "Recurring Clean"}</p>
                              <p className="text-xs text-muted-foreground capitalize">{plan.frequency || "weekly"} · {plan.preferred_time || "Flexible"}</p>
                            </div>
                            <Badge variant="outline" className={`text-xs ${plan.is_active ? "text-success border-success/30" : "text-muted-foreground"}`}>
                              {plan.is_active ? "Active" : "Paused"}
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Repeat className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">No recurring plans yet.</p>
                    <Button size="sm" asChild variant="outline" className="rounded-xl">
                      <Link to="/recurring-plans">Set Up Plan</Link>
                    </Button>
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
