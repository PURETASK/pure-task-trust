import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Calendar, Clock, Star, Heart, Repeat, Trash2, Check,
  Sparkles, MessageCircle, RotateCcw, HelpCircle, Zap, MapPin,
  TrendingUp, CreditCard, Home, Search, Gift, Settings, Users,
  ChevronRight, AlertCircle, Bell, ArrowRight, Camera
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
import clientHeroImg from "@/assets/client-hero.jpg";

const QUICK_ACTIONS = [
  { icon: Plus, label: "Book a Clean", href: "/book", color: "bg-primary text-primary-foreground", desc: "Schedule your next visit" },
  { icon: Search, label: "Find Cleaners", href: "/discover", color: "bg-[hsl(var(--pt-aqua)/0.15)] text-[hsl(var(--pt-aqua))]", desc: "Browse local pros" },
  { icon: CreditCard, label: "My Wallet", href: "/wallet", color: "bg-success/10 text-success", desc: "Credits & transactions" },
  { icon: Home, label: "My Properties", href: "/properties", color: "bg-warning/10 text-warning", desc: "Manage addresses" },
  { icon: MessageCircle, label: "Messages", href: "/messages", color: "bg-primary/10 text-primary", desc: "Chat with cleaners" },
  { icon: Heart, label: "Favourites", href: "/favorites", color: "bg-destructive/10 text-destructive", desc: "Your saved cleaners" },
  { icon: Repeat, label: "Recurring Plans", href: "/recurring", color: "bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))]", desc: "Subscriptions" },
  { icon: Gift, label: "Refer Friends", href: "/referral", color: "bg-warning/10 text-warning", desc: "Earn free credits" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed": return <Badge className="bg-success/10 text-success border-success/30">Confirmed</Badge>;
    case "pending":
    case "created": return <Badge className="bg-warning/10 text-warning border-warning/30">Pending</Badge>;
    case "in_progress": return <Badge className="bg-primary/10 text-primary border-primary/30 animate-pulse">In Progress</Badge>;
    case "completed": return <Badge className="bg-success/10 text-success border-success/30">Done</Badge>;
    case "cancelled": return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function getDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return <span className="text-primary font-semibold">Today</span>;
  if (isTomorrow(d)) return <span className="text-warning font-semibold">Tomorrow</span>;
  return <span>{format(d, "MMM d")}</span>;
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
        <div className="absolute inset-0 opacity-5">
          <img src={clientHeroImg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative container px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-sm text-muted-foreground font-medium mb-1">Welcome back 👋</p>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  Hello, <span className="text-primary">{firstName}!</span>
                </h1>
                <p className="text-muted-foreground mt-1">Your home is in good hands.</p>
              </motion.div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Wallet balance chip */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="px-4 py-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Wallet</p>
                    <p className="font-bold text-primary text-sm">{balance.toLocaleString()} credits</p>
                  </div>
                </CardContent>
              </Card>

              <Button asChild size="lg" className="rounded-2xl h-12 px-6 shadow-card">
                <Link to="/book">
                  <Plus className="h-5 w-5 mr-2" /> Book a Clean
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 sm:px-6 py-8 space-y-8">

        {/* ── TODAY'S LIVE BANNER ───────────────────────────────────────── */}
        <AnimatePresence>
          {todayJobs.map(job => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              <Link to={`/booking/${job.id}`}>
                <Card className={`border-2 ${job.status === "in_progress" ? "border-primary/40 bg-primary/5" : "border-success/40 bg-success/5"} hover:shadow-elevated transition-all`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${job.status === "in_progress" ? "bg-primary/15" : "bg-success/15"}`}>
                      <Zap className={`h-6 w-6 ${job.status === "in_progress" ? "text-primary" : "text-success"} animate-pulse`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{job.status === "in_progress" ? "🧹 Cleaning in progress right now!" : "✅ Cleaning confirmed for today"}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {job.cleaning_type?.replace("_", " ")} Clean · {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "h:mm a") : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-primary">
                      View <ChevronRight className="h-4 w-4" />
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
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{pendingApprovalJobs.length} job{pendingApprovalJobs.length > 1 ? "s" : ""} awaiting your approval</p>
                  <p className="text-sm text-muted-foreground">Review photos and release payment when satisfied.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveTab("approval")} className="border-warning/40 text-warning hover:bg-warning/10 rounded-xl">
                  Review
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── LOYALTY TRACKER ──────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <LoyaltyTracker />
        </motion.div>

        {/* ── QUICK ACTIONS ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((a, i) => (
              <motion.div key={a.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }}>
                <Link to={a.href}>
                  <Card className="border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-200 cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className={`h-10 w-10 rounded-xl ${a.color} flex items-center justify-center mb-3`}>
                        <a.icon className="h-5 w-5" />
                      </div>
                      <p className="font-semibold text-sm">{a.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Book Again</h2>
              <Link to="/discover" className="text-sm text-primary hover:underline">Find new cleaners</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {recentCleaners.map((job, i) => {
                const name = `${job.cleaner?.first_name || ""} ${job.cleaner?.last_name || ""}`.trim() || "Cleaner";
                return (
                  <motion.div key={job.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex-shrink-0">
                    <Link to={`/book?cleaner=${job.cleaner_id}&type=${job.cleaning_type}`}>
                      <Card className="w-48 hover:shadow-elevated hover:border-primary/40 transition-all">
                        <CardContent className="p-4">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-lg mb-3">
                            {name.charAt(0)}
                          </div>
                          <p className="font-semibold text-sm truncate">{name}</p>
                          {job.cleaner?.avg_rating && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Star className="h-3 w-3 fill-warning text-warning" />
                              {job.cleaner.avg_rating.toFixed(1)}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground capitalize mt-1">{(job.cleaning_type || "").replace("_", " ")}</p>
                          <Button size="sm" className="w-full mt-3 h-8 text-xs rounded-xl">
                            <RotateCcw className="h-3 w-3 mr-1" /> Book Again
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Bookings</h2>
          </div>

          {/* Tab bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {[
              { key: "upcoming", label: "Upcoming", count: upcomingJobs.length, icon: Calendar },
              { key: "approval", label: "Approve", count: pendingApprovalJobs.length, icon: Check, alert: pendingApprovalJobs.length > 0 },
              { key: "past", label: "Past", count: pastJobs.length, icon: Clock },
              { key: "favorites", label: "Favourites", count: favorites?.length || 0, icon: Heart },
              { key: "recurring", label: "Recurring", count: recurring?.length || 0, icon: Repeat },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : tab.alert ? "bg-destructive text-destructive-foreground" : "bg-background text-foreground"
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
                isLoading ? <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
                : upcomingJobs.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingJobs.map((job, i) => {
                      const cleanerName = job.cleaner ? `${job.cleaner.first_name || ""} ${job.cleaner.last_name || ""}`.trim() : "Finding cleaner…";
                      return (
                        <motion.div key={job.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                          <Card className="hover:shadow-elevated hover:border-primary/30 transition-all">
                            <CardContent className="p-4 sm:p-5">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg flex-shrink-0">
                                  {cleanerName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold truncate">{cleanerName}</p>
                                    {getStatusBadge(job.status)}
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                                    {job.scheduled_start_at && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{getDateLabel(job.scheduled_start_at)}, {format(new Date(job.scheduled_start_at), "h:mm a")}</span>}
                                    <span className="font-medium text-foreground">{job.escrow_credits_reserved || 0} cr</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {job.cleaner && (
                                    <Button variant="ghost" size="sm" asChild className="h-8 rounded-xl">
                                      <Link to={`/messages?job=${job.id}`}><MessageCircle className="h-4 w-4" /></Link>
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm" asChild className="h-8 rounded-xl">
                                    <Link to={`/booking/${job.id}`}>View</Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 border-border/40">
                    <CardContent className="py-16 text-center">
                      <Calendar className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="font-bold text-lg mb-2">No upcoming bookings</h3>
                      <p className="text-muted-foreground mb-6">Ready to book your next clean?</p>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <Button asChild className="rounded-xl"><Link to="/book"><Plus className="h-4 w-4 mr-2" />Book a Cleaning</Link></Button>
                        <Button variant="outline" asChild className="rounded-xl"><Link to="/help"><HelpCircle className="h-4 w-4 mr-2" />Get Help</Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}

              {/* APPROVAL */}
              {activeTab === "approval" && (
                pendingApprovalJobs.length > 0 ? (
                  <div className="space-y-3">
                    {pendingApprovalJobs.map((job, i) => (
                      <motion.div key={job.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <Card className="border-success/30 bg-success/5 hover:shadow-elevated transition-all">
                          <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-success/15 flex items-center justify-center flex-shrink-0">
                                <Camera className="h-6 w-6 text-success" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold">Job Complete — Review & Approve</p>
                                <p className="text-sm text-muted-foreground capitalize">{job.cleaning_type?.replace("_", " ")} Clean · {job.escrow_credits_reserved || 0} credits held</p>
                              </div>
                              <Button asChild size="sm" className="bg-success hover:bg-success/90 rounded-xl flex-shrink-0">
                                <Link to={`/job-approval/${job.id}`}><Check className="h-4 w-4 mr-1" />Approve</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 border-border/40">
                    <CardContent className="py-16 text-center">
                      <Check className="h-14 w-14 mx-auto text-success/40 mb-4" />
                      <h3 className="font-bold text-lg mb-2">All caught up!</h3>
                      <p className="text-muted-foreground">No jobs waiting for your approval.</p>
                    </CardContent>
                  </Card>
                )
              )}

              {/* PAST */}
              {activeTab === "past" && (
                pastJobs.length > 0 ? (
                  <div className="space-y-3">
                    {pastJobs.slice(0, 10).map((job, i) => (
                      <motion.div key={job.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className="hover:shadow-card transition-all opacity-85 hover:opacity-100">
                          <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-semibold text-muted-foreground flex-shrink-0">
                                {(job.cleaner?.first_name || "?").charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate capitalize">{(job.cleaning_type || "").replace("_"," ")} Clean</p>
                                <p className="text-sm text-muted-foreground">{job.scheduled_start_at ? format(new Date(job.scheduled_start_at), "MMM d, yyyy") : "–"}</p>
                              </div>
                              {getStatusBadge(job.status)}
                              <Button variant="ghost" size="sm" asChild className="h-8 rounded-xl text-xs">
                                <Link to={`/book?cleaner=${job.cleaner_id}`}><RotateCcw className="h-3.5 w-3.5 mr-1" />Rebook</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 border-border/40">
                    <CardContent className="py-16 text-center">
                      <Clock className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="font-bold text-lg mb-2">No past bookings yet</h3>
                      <p className="text-muted-foreground">Your completed jobs will appear here.</p>
                    </CardContent>
                  </Card>
                )
              )}

              {/* FAVOURITES */}
              {activeTab === "favorites" && (
                loadingFavorites ? <Skeleton className="h-32 rounded-2xl" />
                : favorites && favorites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {favorites.map((fav: any, i) => (
                      <motion.div key={fav.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}>
                        <Card className="hover:shadow-elevated hover:border-primary/30 transition-all">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg flex-shrink-0">
                              {(fav.cleaner?.first_name || "?").charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{fav.cleaner?.first_name} {fav.cleaner?.last_name}</p>
                              {fav.cleaner?.avg_rating && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 fill-warning text-warning" />{fav.cleaner.avg_rating.toFixed(1)}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" asChild className="h-8 rounded-xl text-xs"><Link to={`/book?cleaner=${fav.cleaner_id}`}>Book</Link></Button>
                              <Button size="sm" variant="ghost" onClick={() => removeFavorite(fav.id)} className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 border-border/40">
                    <CardContent className="py-16 text-center">
                      <Heart className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="font-bold text-lg mb-2">No favourites yet</h3>
                      <p className="text-muted-foreground mb-4">Heart a cleaner after a great clean to save them here.</p>
                      <Button asChild className="rounded-xl"><Link to="/discover">Browse Cleaners</Link></Button>
                    </CardContent>
                  </Card>
                )
              )}

              {/* RECURRING */}
              {activeTab === "recurring" && (
                recurring && recurring.length > 0 ? (
                  <div className="space-y-3">
                    {recurring.map((plan: any, i) => (
                      <motion.div key={plan.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <Card className="hover:shadow-card border-[hsl(var(--pt-purple)/0.2)] bg-[hsl(var(--pt-purple)/0.03)] transition-all">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--pt-purple)/0.1)] flex items-center justify-center flex-shrink-0">
                              <Repeat className="h-5 w-5 text-[hsl(var(--pt-purple))]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold capitalize">{plan.frequency?.replace("_"," ")} · {plan.cleaning_type?.replace("_"," ")}</p>
                              <p className="text-xs text-muted-foreground">Next: {plan.next_scheduled_at ? format(new Date(plan.next_scheduled_at), "MMM d") : "TBD"}</p>
                            </div>
                            <Badge variant="outline" className={`text-xs ${plan.is_active ? "border-success/40 text-success" : "text-muted-foreground"}`}>
                              {plan.is_active ? "Active" : "Paused"}
                            </Badge>
                            <Button variant="ghost" size="sm" asChild className="h-8 rounded-xl">
                              <Link to="/recurring"><ChevronRight className="h-4 w-4" /></Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 border-border/40">
                    <CardContent className="py-16 text-center">
                      <Repeat className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
                      <h3 className="font-bold text-lg mb-2">No recurring plans yet</h3>
                      <p className="text-muted-foreground mb-4">Save money with weekly, biweekly or monthly cleanings.</p>
                      <Button asChild className="rounded-xl"><Link to="/recurring">Set Up a Plan</Link></Button>
                    </CardContent>
                  </Card>
                )
              )}

            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
