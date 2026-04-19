import { Link } from "react-router-dom";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useBackgroundChecks } from "@/hooks/useBackgroundChecks";
import { getTierFromScore, getTierConfig, CleanerTier } from "@/lib/tier-config";
import {
  User, Mail, Edit, MapPin, DollarSign, Wallet, Bell, Calendar,
  Shield, CheckCircle, XCircle, Clock, ChevronRight, Award, Briefcase,
  TrendingUp, Home, Dog, Leaf, Package, Users, Map, Star, Camera, Zap,
  Phone, Settings, Heart
} from "lucide-react";

const TIER_CONFIG: Record<string, { gradient: string; badge: string; icon: string; color: string }> = {
  bronze: { gradient: "from-amber-500/20 to-amber-600/5", badge: "bg-amber-500/10 text-amber-700 border-amber-500/30", icon: "🥉", color: "hsl(38 95% 55%)" },
  silver: { gradient: "from-slate-400/20 to-slate-500/5", badge: "bg-slate-400/10 text-slate-600 border-slate-400/30", icon: "🥈", color: "hsl(220 15% 55%)" },
  gold:   { gradient: "from-yellow-500/20 to-yellow-600/5", badge: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30", icon: "🥇", color: "hsl(45 95% 55%)" },
  platinum: { gradient: "from-cyan-500/20 to-cyan-600/5", badge: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30", icon: "💎", color: "hsl(190 90% 50%)" },
};

const QUICK_LINKS = [
  { to: "/cleaner/earnings",       label: "Earnings & Payouts",   desc: "View income and payout history",      icon: Wallet,    borderColor: "hsl(var(--success))",       shadowColor: "hsl(var(--success) / 0.2)" },
  { to: "/cleaner/availability",   label: "Availability",         desc: "Set working hours and time off",      icon: Calendar,  borderColor: "hsl(var(--success))",       shadowColor: "hsl(var(--success) / 0.2)" },
  { to: "/cleaner/service-areas",  label: "Service Areas",        desc: "Manage where you work",               icon: Map,       borderColor: "hsl(var(--warning))",       shadowColor: "hsl(var(--warning) / 0.2)" },
  { to: "/cleaner/team",           label: "My Team",              desc: "Manage your cleaning team",           icon: Users,     borderColor: "hsl(var(--pt-purple))",     shadowColor: "hsl(var(--pt-purple) / 0.2)" },
  { to: "/settings/notifications", label: "Notifications",        desc: "Email, push, and SMS preferences",    icon: Bell,      borderColor: "hsl(var(--warning))",       shadowColor: "hsl(var(--warning) / 0.2)" },
  { to: "/cleaner/verification",   label: "Verification & Trust", desc: "Background check and ID status",      icon: Shield,    borderColor: "hsl(var(--success))",       shadowColor: "hsl(var(--success) / 0.2)" },
];

// Green (success) = cleaner-facing, warning/purple = general features
const SECTION_STYLE = {
  borderColor: "hsl(var(--success))",
  shadowColor: "hsl(var(--success) / 0.15)",
};

export default function CleanerProfileView() {
  const { user } = useAuth();
  const { profile, isLoading, error } = useCleanerProfile();
  const { latestCheck } = useBackgroundChecks();

  const reliabilityScore = profile?.reliability_score || 0;
  const tier = getTierFromScore(reliabilityScore) as CleanerTier;
  const tierConfig = getTierConfig(tier);
  const theme = TIER_CONFIG[tier] || TIER_CONFIG.bronze;

  const getVerificationBadge = (status: string | null | undefined) => {
    if (!status || status === "pending") return <Badge variant="secondary" className="gap-1 h-6 text-xs"><Clock className="h-3 w-3" />Pending</Badge>;
    if (["passed", "verified"].includes(status)) return <Badge className="gap-1 h-6 text-xs bg-success/10 text-success border-success/30"><CheckCircle className="h-3 w-3" />Verified</Badge>;
    return <Badge variant="destructive" className="gap-1 h-6 text-xs"><XCircle className="h-3 w-3" />Failed</Badge>;
  };

  if (error) {
    return (
      <CleanerLayout>
        <div className="max-w-3xl flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Unable to load profile</h2>
          <p className="text-muted-foreground text-sm">Please check your connection and try again.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
            Try Again
          </Button>
        </div>
      </CleanerLayout>
    );
  }

  if (isLoading || !profile) {
    return (
      <CleanerLayout>
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-48 rounded-3xl" />
          <div className="grid grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </CleanerLayout>
    );
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Cleaner";

  return (
    <CleanerLayout>
      <div className="max-w-3xl space-y-5">

        {/* ── HERO BANNER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div
            className={`rounded-3xl overflow-hidden bg-gradient-to-br ${theme.gradient}`}
            style={{
              border: `2px solid ${SECTION_STYLE.borderColor}`,
              boxShadow: `0 4px 24px 0 ${SECTION_STYLE.shadowColor}`,
            }}
          >
            {/* Tier color accent bar */}
            <div className="h-1.5 w-full" style={{ background: theme.color }} />
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarImage src={profile?.profile_photo_url || undefined} />
                    <AvatarFallback className="text-2xl font-poppins font-bold bg-success/10 text-success">
                      {fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {profile?.is_available && (
                    <span className="absolute bottom-1 right-1 h-5 w-5 bg-success rounded-full border-2 border-background shadow-sm" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-2xl font-bold truncate">{fullName}</h1>
                    <Badge className={`${theme.badge} border capitalize font-bold gap-1 flex-shrink-0`}>
                      <span>{theme.icon}</span>{tier}
                    </Badge>
                    {profile?.is_available ? (
                      <Badge className="bg-success/10 text-success border-success/30 gap-1 text-xs flex-shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />Online
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 text-xs flex-shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />Offline
                      </Badge>
                    )}
                  </div>
                  {profile?.professional_headline && (
                    <p className="text-muted-foreground text-sm mb-2 truncate">{profile.professional_headline}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    {user?.email && (
                      <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-success" />
                      <span className="font-semibold text-foreground">${profile?.hourly_rate_credits || tierConfig.hourlyRateRange.min}/hr</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />{profile?.travel_radius_km || 15} mi radius
                    </span>
                  </div>
                </div>

                <Button asChild className="rounded-xl gap-2 flex-shrink-0 bg-success hover:bg-success/90 text-success-foreground">
                  <Link to="/cleaner/profile"><Edit className="h-4 w-4" />Edit Profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── PROFILE TABS: Public Performance vs Private Settings ── */}
        <Tabs defaultValue="performance" className="space-y-5">
          <TabsList className="w-full grid grid-cols-2 h-auto p-1">
            <TabsTrigger value="performance" className="text-sm py-2.5 gap-1.5 data-[state=active]:bg-success/10 data-[state=active]:text-success">
              <TrendingUp className="h-4 w-4" /> Performance & Public
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-sm py-2.5 gap-1.5">
              <Settings className="h-4 w-4" /> Account Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-5">
        {/* ── STATS ROW ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Jobs Done",     value: profile?.jobs_completed || 0,                      icon: Briefcase,  borderColor: "hsl(var(--success))",   shadowColor: "hsl(var(--success) / 0.15)" },
              { label: "Avg Rating",    value: profile?.avg_rating ? `${profile.avg_rating.toFixed(1)}★` : "New", icon: Star,       borderColor: "hsl(var(--warning))",   shadowColor: "hsl(var(--warning) / 0.15)" },
              { label: "Reliability",   value: `${reliabilityScore}%`,                            icon: TrendingUp, borderColor: "hsl(var(--success))",   shadowColor: "hsl(var(--success) / 0.15)" },
              { label: "Platform Fee",  value: `${tierConfig.platformFeePercent}%`,               icon: Zap,        borderColor: "hsl(var(--pt-purple))", shadowColor: "hsl(var(--pt-purple) / 0.15)" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 + i * 0.04 }}>
                <div
                  className="rounded-2xl p-3 bg-card text-center transition-all hover:-translate-y-0.5"
                  style={{ border: `2px solid ${s.borderColor}`, boxShadow: `0 4px 16px 0 ${s.shadowColor}` }}
                >
                  <s.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="font-bold text-sm">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── RELIABILITY PROGRESS ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div
            className="rounded-3xl p-5 bg-card"
            style={{
              border: `2px solid hsl(var(--success))`,
              boxShadow: `0 4px 20px 0 hsl(var(--success) / 0.15)`,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Reliability Score</h3>
                <p className="text-xs text-muted-foreground">Your trust metric with clients</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl font-poppins font-bold text-success">{reliabilityScore}</span>
              <div className="flex-1">
                <Progress value={reliabilityScore} className="h-3 rounded-full" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">/ 100</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Current tier: <span className="font-semibold text-foreground capitalize">{tier}</span>
                <span className="text-muted-foreground"> · </span>
                <span className="text-muted-foreground">Fee: {tierConfig.platformFeePercent}%</span>
              </span>
              {tier !== "platinum" && (
                <Button variant="link" asChild className="h-auto p-0 text-xs text-success">
                  <Link to="/cleaner/reliability">How to improve →</Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── ABOUT & BIO ── */}
        {(profile?.ai_bio || profile?.bio) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <div
              className="rounded-3xl p-5 bg-card"
              style={{
                border: `2px solid hsl(var(--success))`,
                boxShadow: `0 4px 20px 0 hsl(var(--success) / 0.12)`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-success/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-success" />
                  </div>
                  <h3 className="font-semibold text-sm">About Me</h3>
                </div>
                {(profile?.bio_score ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    {(profile.bio_score ?? 0) >= 90 ? (
                      <span className="text-xs font-semibold bg-success/10 text-success border border-success/30 rounded-full px-2 py-0.5">🔥 Top Profile · {profile.bio_score}/100</span>
                    ) : (profile.bio_score ?? 0) >= 75 ? (
                      <span className="text-xs font-semibold bg-primary/10 text-primary border border-primary/30 rounded-full px-2 py-0.5">✅ Strong · {profile.bio_score}/100</span>
                    ) : (
                      <span className="text-xs font-semibold bg-warning/10 text-warning border border-warning/30 rounded-full px-2 py-0.5">⚠️ {profile.bio_score}/100</span>
                    )}
                  </div>
                )}
              </div>
              <pre className="text-sm text-muted-foreground leading-relaxed font-sans whitespace-pre-wrap">
                {profile?.ai_bio || profile?.bio}
              </pre>
            </div>
          </motion.div>
        )}

        {/* ── SERVICE CAPABILITIES ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <div
            className="rounded-3xl p-5 bg-card"
            style={{
              border: `2px solid hsl(var(--success))`,
              boxShadow: `0 4px 20px 0 hsl(var(--success) / 0.12)`,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-success/10 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Service Capabilities</h3>
                <p className="text-xs text-muted-foreground">Your cleaning specialties &amp; skills</p>
              </div>
            </div>

            {/* Dynamic cleaning types from structured profile */}
            {((profile?.cleaning_types?.length ?? 0) > 0 || (profile?.specialties?.length ?? 0) > 0) ? (
              <div className="space-y-3">
                {(profile?.cleaning_types?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Cleaning Types</p>
                    <div className="flex flex-wrap gap-2">
                      {profile!.cleaning_types!.map((t) => (
                        <Badge key={t} variant="outline" className="gap-1.5 px-3 py-1 rounded-xl font-medium text-xs border bg-success/10 text-success border-success/30 capitalize">
                          {t.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(profile?.specialties?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {profile!.specialties!.map((s) => (
                        <Badge key={s} variant="outline" className="gap-1.5 px-3 py-1 rounded-xl font-medium text-xs border bg-warning/10 text-warning border-warning/30 capitalize">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile?.pet_friendly && <Badge variant="outline" className="gap-1.5 px-3 py-1 rounded-xl text-xs border bg-success/10 text-success border-success/30"><Dog className="h-3 w-3" />Pet Friendly</Badge>}
                  {profile?.supplies_provided && <Badge variant="outline" className="gap-1.5 px-3 py-1 rounded-xl text-xs border bg-primary/10 text-primary border-primary/30"><Package className="h-3 w-3" />Own Supplies</Badge>}
                  {(profile?.languages?.length ?? 0) > 0 && profile!.languages!.map((l) => (
                    <Badge key={l} variant="outline" className="gap-1.5 px-3 py-1 rounded-xl text-xs border bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple)/0.3)]">
                      💬 {l}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Home,    label: "Basic Cleaning",      color: "bg-success/10 text-success border-success/30" },
                  { icon: Camera,  label: "Photo Documentation", color: "bg-primary/10 text-primary border-primary/30" },
                  { icon: Dog,     label: "Pet Friendly",        color: "bg-warning/10 text-warning border-warning/30" },
                  { icon: Package, label: "Own Supplies",        color: "bg-[hsl(var(--pt-purple)/0.1)] text-[hsl(var(--pt-purple))] border-[hsl(var(--pt-purple)/0.3)]" },
                ].map(cap => (
                  <Badge key={cap.label} variant="outline" className={`gap-1.5 px-3 py-1 rounded-xl font-medium text-xs border ${cap.color}`}>
                    <cap.icon className="h-3 w-3" />{cap.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── VERIFICATION STATUS ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <div
            className="rounded-3xl p-5 bg-card"
            style={{
              border: `2px solid hsl(var(--success))`,
              boxShadow: `0 4px 20px 0 hsl(var(--success) / 0.12)`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-success/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Verification & Trust</h3>
                  <p className="text-xs text-muted-foreground">Your credentials</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-xl text-xs gap-1 border-success/30 text-success hover:bg-success/5">
                <Link to="/cleaner/verification"><Settings className="h-3 w-3" />Manage</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Background Check", status: latestCheck?.status, icon: Shield },
                { label: "ID Verification",  status: profile?.background_check_status, icon: User },
                { label: "Phone Verified",   status: null, icon: Phone },
              ].map(v => (
                <div
                  key={v.label}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50"
                >
                  <div className="h-9 w-9 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                    <v.icon className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1">{v.label}</p>
                    {getVerificationBadge(v.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

          </TabsContent>

          {/* ── PRIVATE SETTINGS TAB ── */}
          <TabsContent value="settings" className="space-y-4">
            <div
              className="rounded-3xl overflow-hidden bg-card"
              style={{
                border: `2px solid hsl(var(--success))`,
                boxShadow: `0 4px 20px 0 hsl(var(--success) / 0.12)`,
              }}
            >
              <div className="px-5 pt-5 pb-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-success/10 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Account & Settings</h3>
                  <p className="text-xs text-muted-foreground">Manage your private settings</p>
                </div>
              </div>
              <div className="divide-y divide-border/40">
                {QUICK_LINKS.map((link, i) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                        style={{ background: `${link.borderColor}18`, color: link.borderColor }}
                      >
                        <link.icon className="h-4.5 w-4.5" style={{ color: link.borderColor }} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{link.label}</p>
                        <p className="text-xs text-muted-foreground">{link.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
              <Separator />
              <div className="p-4">
                <Link to="/cleaner/referral" className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20 hover:from-success/15 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-success/15 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Refer & Earn $25</p>
                      <p className="text-xs text-muted-foreground">Invite friends, earn cash rewards</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-success group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </CleanerLayout>
  );
}
