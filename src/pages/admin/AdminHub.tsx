import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { RevenueTicker } from "@/components/admin/RevenueTicker";
import { useAdminCEOStats } from "@/hooks/useAdminStats";
import adminHeroImg from "@/assets/admin-hero.jpg";
import {
  BarChart3, TrendingUp, Activity, DollarSign, Users, Star, PieChart,
  Shield, AlertTriangle, FileText, CheckCircle, MapPin,
  Calendar, Briefcase, CreditCard, MessageSquare, Settings, Flag,
  Zap, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronRight, Terminal,
  Award, Target, Package
} from "lucide-react";

interface DashSection {
  title: string;
  emoji: string;
  accent: string;
  accentText: string;
  accentBg: string;
  items: { title: string; desc: string; href: string; icon: any; badge?: string }[];
}

const SECTIONS: DashSection[] = [
  {
    title: "Analytics & Insights",
    emoji: "📊",
    accent: "border-primary/20",
    accentText: "text-primary",
    accentBg: "bg-primary/5",
    items: [
      { icon: TrendingUp, title: "CEO Dashboard", desc: "GMV, revenue & growth KPIs", href: "/admin/ceo", badge: "Live" },
      { icon: BarChart3, title: "Analytics Hub", desc: "Platform-wide overview", href: "/admin/analytics" },
      { icon: Activity, title: "Operations", desc: "Booking status & rates", href: "/admin/operations" },
      { icon: DollarSign, title: "Finance", desc: "Revenue, payouts & reconciliation", href: "/admin/finance" },
      { icon: Users, title: "Growth", desc: "Acquisition & retention funnels", href: "/admin/growth" },
      { icon: Star, title: "Performance", desc: "Ratings & top cleaners", href: "/admin/performance" },
      { icon: PieChart, title: "Conversions", desc: "Funnel & A/B test results", href: "/admin/conversions" },
      { icon: BarChart3, title: "Cohort Analysis", desc: "12-month retention & LTV", href: "/admin/cohort-analysis" },
      { icon: MapPin, title: "Geo Insights", desc: "Demand vs. supply heatmap", href: "/admin/geo-insights" },
    ],
  },
  {
    title: "Trust & Safety",
    emoji: "🛡️",
    accent: "border-destructive/20",
    accentText: "text-destructive",
    accentBg: "bg-destructive/5",
    items: [
      { icon: Shield, title: "Trust & Safety", desc: "Priority triage queue", href: "/admin/trust-safety", badge: "Priority" },
      { icon: AlertTriangle, title: "Fraud Alerts", desc: "Suspicious activity flags", href: "/admin/fraud-alerts" },
      { icon: FileText, title: "Disputes", desc: "Open dispute cases", href: "/admin/disputes" },
      { icon: Users, title: "Client Risk", desc: "Risk scoring by client", href: "/admin/client-risk" },
      { icon: CheckCircle, title: "ID Verifications", desc: "Pending & expired IDs", href: "/admin/id-verifications" },
      { icon: Flag, title: "Safety Reports", desc: "Trust & safety incident log", href: "/admin/trust-safety-reports" },
    ],
  },
  {
    title: "Platform Management",
    emoji: "⚙️",
    accent: "border-success/20",
    accentText: "text-success",
    accentBg: "bg-success/5",
    items: [
      { icon: Users, title: "Users", desc: "Clients, cleaners & admins", href: "/admin/users" },
      { icon: Calendar, title: "Bookings Console", desc: "All jobs & booking status", href: "/admin/bookings" },
      { icon: Briefcase, title: "Client Jobs", desc: "Jobs by client view", href: "/admin/client-jobs" },
      { icon: CreditCard, title: "Pricing Rules", desc: "Dynamic pricing config", href: "/admin/pricing-rules" },
      { icon: Package, title: "Pricing Mgmt", desc: "Bundle offers & tiers", href: "/admin/pricing" },
      { icon: MessageSquare, title: "Bulk Comms", desc: "Targeted notifications", href: "/admin/bulk-comms" },
      { icon: Settings, title: "Platform Config", desc: "Live fees & feature flags", href: "/admin/platform-config" },
      { icon: FileText, title: "Audit Trail", desc: "Searchable action timeline", href: "/admin/audit-log", badge: "New" },
      { icon: DollarSign, title: "Refund Queue", desc: "Review refund requests", href: "/admin/refund-queue", badge: "New" },
      { icon: Zap, title: "Webhook Log", desc: "Stripe event debugging", href: "/admin/webhook-log", badge: "New" },
      { icon: Activity, title: "System Health", desc: "Function success & latency", href: "/admin/health", badge: "New" },
    ],
  },
];

function StatKPI({ label, value, change, icon: Icon, color }: { label: string; value: string | number; change?: number; icon: any; color: string }) {
  return (
    <Card className={`border ${color} hover:shadow-elevated transition-all`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`h-10 w-10 rounded-xl ${color.replace("border-", "bg-").replace("/20", "/10")} flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${color.replace("border-", "text-").replace("/20", "")}`} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center text-xs font-semibold ${change >= 0 ? "text-success" : "text-destructive"}`}>
              {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-poppins font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminHub() {
  const { data: stats, isLoading, refetch } = useAdminCEOStats();

  return (
    <main className="flex-1 bg-background min-h-screen">
      {/* Epic Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[hsl(220,20%,6%)] to-[hsl(210,30%,12%)] text-white">
        <div className="absolute inset-0">
          <img src={adminHeroImg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,20%,6%)/95] via-[hsl(220,20%,6%)/80] to-transparent" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative container px-4 sm:px-6 py-10 sm:py-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm font-medium">PureTask</p>
                    <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-white">Admin Command Center</h1>
                  </div>
                </div>
                <p className="text-white/60 text-base max-w-xl">Full platform control — analytics, trust & safety, user management, and live configuration.</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge className="bg-success/20 text-success border-success/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-success mr-1.5 animate-pulse" />System Operational
                  </Badge>
                  <Badge className="bg-white/10 text-white/80 border-white/20">
                    <Terminal className="h-3 w-3 mr-1" /> Press ⌘K for commands
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading} className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white rounded-xl">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
                </Button>
                <Button asChild size="sm" className="bg-white text-[hsl(220,20%,6%)] hover:bg-white/90 rounded-xl font-bold">
                  <Link to="/admin/ceo"><TrendingUp className="h-4 w-4 mr-2" /> CEO View</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 sm:px-6 py-8 space-y-10">
        <RevenueTicker />

        {/* KPI Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Live Metrics</h2>
            <Link to="/admin/analytics" className="text-sm text-primary hover:underline flex items-center gap-1">
              Full Analytics <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
          ) : stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatKPI icon={DollarSign} label="GMV This Month" value={`${stats.gmvThis.toLocaleString()} cr`} change={stats.gmvChange} color="border-primary/20" />
              <StatKPI icon={TrendingUp} label="Platform Revenue" value={`${stats.revenueThis.toLocaleString()} cr`} change={stats.revenueChange} color="border-success/20" />
              <StatKPI icon={Calendar} label="Bookings (30d)" value={stats.bookingsThis} change={stats.bookingsChange} color="border-warning/20" />
              <StatKPI icon={Users} label="Total Users" value={stats.totalUsers.toLocaleString()} color="border-[hsl(var(--pt-purple)/0.2)]" />
            </div>
          )}
        </section>

        {/* Dashboard Sections */}
        {SECTIONS.map((section, si) => (
          <motion.section key={section.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: si * 0.06 }}>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">{section.emoji}</span>
              <h2 className="text-xl font-bold">{section.title}</h2>
              <div className={`h-1 w-8 rounded-full ${section.accentText.replace("text-", "bg-")} opacity-60`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.href} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} whileHover={{ y: -2, scale: 1.01 }}>
                    <Link to={item.href}>
                      <Card className={`border ${section.accent} ${section.accentBg} hover:shadow-elevated hover:border-opacity-60 transition-all duration-200 h-full`}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl ${section.accentBg} border ${section.accent} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-5 w-5 ${section.accentText}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{item.title}</p>
                              {item.badge && (
                                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">{item.badge}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{item.desc}</p>
                          </div>
                          <ChevronRight className={`h-4 w-4 flex-shrink-0 ${section.accentText} opacity-40`} />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        ))}

        {/* Quick Access footer */}
        <Card className="border-border/40 bg-muted/20">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" /> Quick Access
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Users", href: "/admin/users" },
                { label: "Live Bookings", href: "/admin/bookings" },
                { label: "Fraud Queue", href: "/admin/fraud-alerts" },
                { label: "Disputes", href: "/admin/disputes" },
                { label: "Pricing", href: "/admin/pricing-rules" },
                { label: "Bulk SMS/Email", href: "/admin/bulk-comms" },
                { label: "Platform Flags", href: "/admin/platform-config" },
                { label: "ID Verifications", href: "/admin/id-verifications" },
              ].map(l => (
                <Button key={l.href} variant="outline" size="sm" asChild className="rounded-xl h-8 text-xs">
                  <Link to={l.href}>{l.label}</Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
