import { Link } from "react-router-dom";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useBackgroundChecks } from "@/hooks/useBackgroundChecks";
import { getTierFromScore, getTierConfig, CleanerTier } from "@/lib/tier-config";
import {
  User, Mail, Edit, MapPin, DollarSign, Wallet, Bell, Calendar,
  Shield, CheckCircle, XCircle, Clock, ChevronRight, Award, Briefcase,
  TrendingUp, Home, Dog, Leaf, Package, Users, Map, Star, Camera, Zap
} from "lucide-react";

const TIER_THEMES: Record<string, { gradient: string; badge: string; icon: string }> = {
  bronze: { gradient: "from-amber-500/15 to-amber-600/5", badge: "bg-amber-500/10 text-amber-700 border-amber-500/30", icon: "🥉" },
  silver: { gradient: "from-slate-400/15 to-slate-500/5", badge: "bg-slate-400/10 text-slate-600 border-slate-400/30", icon: "🥈" },
  gold: { gradient: "from-yellow-500/15 to-yellow-600/5", badge: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30", icon: "🥇" },
  platinum: { gradient: "from-cyan-500/15 to-cyan-600/5", badge: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30", icon: "💎" },
};

const QUICK_LINKS = [
  { to: "/cleaner/earnings", label: "Earnings & Payouts", desc: "View income and payout history", icon: Wallet, color: "bg-success/10", iconColor: "text-success" },
  { to: "/cleaner/availability", label: "Availability", desc: "Set working hours and time off", icon: Calendar, color: "bg-primary/10", iconColor: "text-primary" },
  { to: "/cleaner/service-areas", label: "Service Areas", desc: "Manage where you work", icon: Map, color: "bg-warning/10", iconColor: "text-warning" },
  { to: "/cleaner/team", label: "My Team", desc: "Manage your cleaning team", icon: Users, color: "bg-violet-500/10", iconColor: "text-violet-500" },
  { to: "/notification-settings", label: "Notifications", desc: "Email, push, and SMS preferences", icon: Bell, color: "bg-rose-500/10", iconColor: "text-rose-500" },
  { to: "/cleaner/verification", label: "Verification & Trust", desc: "Background check and ID status", icon: Shield, color: "bg-cyan-500/10", iconColor: "text-cyan-500" },
];

export default function CleanerProfileView() {
  const { user } = useAuth();
  const { profile, isLoading } = useCleanerProfile();
  const { latestCheck } = useBackgroundChecks();

  const reliabilityScore = profile?.reliability_score || 0;
  const tier = getTierFromScore(reliabilityScore) as CleanerTier;
  const tierConfig = getTierConfig(tier);
  const theme = TIER_THEMES[tier] || TIER_THEMES.bronze;

  const getVerificationBadge = (status: string | null | undefined) => {
    if (!status || status === "pending") return <Badge variant="secondary" className="gap-1 h-6"><Clock className="h-3 w-3" />Pending</Badge>;
    if (["passed", "verified"].includes(status)) return <Badge className="gap-1 h-6 bg-success/10 text-success border-success/30"><CheckCircle className="h-3 w-3" />Verified</Badge>;
    return <Badge variant="destructive" className="gap-1 h-6"><XCircle className="h-3 w-3" />Failed</Badge>;
  };

  if (isLoading) {
    return (
      <CleanerLayout>
        <div className="max-w-3xl space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </CleanerLayout>
    );
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Cleaner";

  return (
    <CleanerLayout>
      <div className="max-w-3xl space-y-6">

        {/* Tier Banner Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`overflow-hidden bg-gradient-to-br ${theme.gradient} border-border/50`}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                    <AvatarImage src={profile?.profile_photo_url || undefined} />
                    <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
                      {fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {profile?.is_available && (
                    <span className="absolute bottom-0 right-0 h-5 w-5 bg-success rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-2xl font-bold">{fullName}</h1>
                    <Badge className={`${theme.badge} border capitalize font-bold gap-1`}>
                      <span>{theme.icon}</span>{tier}
                    </Badge>
                  </div>
                  {profile?.professional_headline && (
                    <p className="text-muted-foreground text-sm mb-2">{profile.professional_headline}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    {user?.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span>}
                    <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-success" /><span className="font-semibold text-foreground">${profile?.hourly_rate_credits || tierConfig.hourlyRateRange.min}/hr</span></span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile?.travel_radius_km || 15} mi radius</span>
                  </div>
                </div>
                <Button asChild className="rounded-xl gap-2 flex-shrink-0">
                  <Link to="/cleaner/profile"><Edit className="h-4 w-4" />Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Jobs Done", value: profile?.jobs_completed || 0, icon: Briefcase, color: "text-primary" },
              { label: "Avg Rating", value: profile?.avg_rating ? `${profile.avg_rating.toFixed(1)}★` : "New", icon: Star, color: "text-warning" },
              { label: "Reliability", value: `${reliabilityScore}%`, icon: TrendingUp, color: "text-success" },
              { label: "Platform Fee", value: `${tierConfig.platformFeePercent}%`, icon: Zap, color: "text-muted-foreground" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 + i * 0.04 }}>
                <Card className="text-center">
                  <CardContent className="p-3">
                    <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                    <p className="font-bold text-sm">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Reliability Progress */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-success" />
                Reliability Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl font-black">{reliabilityScore}</span>
                <div className="flex-1">
                  <Progress value={reliabilityScore} className="h-3 rounded-full" />
                </div>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current tier: <span className="font-semibold text-foreground capitalize">{tier}</span></span>
                {tier !== "platinum" && (
                  <Button variant="link" asChild className="h-auto p-0 text-xs text-primary">
                    <Link to="/cleaner/reliability">How to improve →</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About & Services */}
        {profile?.bio && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4 text-primary" />About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Briefcase className="h-4 w-4 text-primary" />Service Preferences</CardTitle>
              <CardDescription>Your cleaning specialties and capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1"><Home className="h-3 w-3" />Basic Cleaning</Badge>
                <Badge variant="secondary" className="gap-1"><Camera className="h-3 w-3" />Photo Documentation</Badge>
                <Badge variant="secondary" className="gap-1"><Dog className="h-3 w-3" />Pet Friendly</Badge>
                <Badge variant="secondary" className="gap-1"><Leaf className="h-3 w-3" />Eco-Friendly</Badge>
                <Badge variant="secondary" className="gap-1"><Package className="h-3 w-3" />Own Supplies</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification Status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4 text-primary" />Verification Status</CardTitle>
              <CardDescription>Your trust and verification badges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Background Check", status: latestCheck?.status, icon: Shield },
                  { label: "ID Verification", status: profile?.background_check_status, icon: User },
                  { label: "Phone Verified", status: null, icon: User },
                ].map(v => (
                  <div key={v.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <v.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1">{v.label}</p>
                      {getVerificationBadge(v.status)}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" asChild className="w-full rounded-xl">
                <Link to="/cleaner/verification">Manage Verifications</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Links</CardTitle>
              <CardDescription>Access your account features</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {QUICK_LINKS.map(link => (
                  <Link key={link.to} to={link.to} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl ${link.color} flex items-center justify-center`}>
                        <link.icon className={`h-5 w-5 ${link.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{link.label}</p>
                        <p className="text-xs text-muted-foreground">{link.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </CleanerLayout>
  );
}
