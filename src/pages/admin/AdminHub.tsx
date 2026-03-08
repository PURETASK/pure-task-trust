import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Activity, DollarSign, Users, Star, PieChart,
  Shield, AlertTriangle, FileText, CheckCircle, MapPin,
  Calendar, Briefcase, CreditCard, MessageSquare, Settings, Flag
} from "lucide-react";
import { useAdminCEOStats } from "@/hooks/useAdminStats";

const SECTIONS = [
  {
    title: "Analytics",
    color: "bg-primary/5 border-primary/20",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    items: [
      { title: "Analytics Hub", desc: "Platform-wide overview", href: "/admin/analytics", icon: BarChart3 },
      { title: "CEO Dashboard", desc: "GMV, revenue & growth KPIs", href: "/admin/ceo", icon: TrendingUp },
      { title: "Operations", desc: "Booking status & rates", href: "/admin/operations", icon: Activity },
      { title: "Finance", desc: "Revenue, payouts & reconciliation", href: "/admin/finance", icon: DollarSign },
      { title: "Growth", desc: "Acquisition & retention funnels", href: "/admin/growth", icon: Users },
      { title: "Performance", desc: "Ratings & top cleaners", href: "/admin/performance", icon: Star },
      { title: "Conversions", desc: "Funnel & A/B test results", href: "/admin/conversions", icon: PieChart },
      { title: "Cohort Analysis", desc: "12-month retention & LTV", href: "/admin/cohort-analysis", icon: BarChart3 },
      { title: "Geo Insights", desc: "Demand vs. supply heatmap", href: "/admin/geo-insights", icon: MapPin },
    ],
  },
  {
    title: "Trust & Safety",
    color: "bg-destructive/5 border-destructive/20",
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
    items: [
      { title: "Trust & Safety", desc: "Priority triage queue", href: "/admin/trust-safety", icon: Shield },
      { title: "Fraud Alerts", desc: "Suspicious activity flags", href: "/admin/fraud-alerts", icon: AlertTriangle },
      { title: "Disputes", desc: "Open dispute cases", href: "/admin/disputes", icon: FileText },
      { title: "Client Risk", desc: "Risk scoring by client", href: "/admin/client-risk", icon: Users },
      { title: "ID Verifications", desc: "Pending & expired IDs", href: "/admin/id-verifications", icon: CheckCircle },
      { title: "Safety Reports", desc: "Trust & safety incident log", href: "/admin/trust-safety-reports", icon: PieChart },
    ],
  },
  {
    title: "Management",
    color: "bg-success/5 border-success/20",
    iconColor: "text-success",
    iconBg: "bg-success/10",
    items: [
      { title: "Users", desc: "Clients, cleaners & admins", href: "/admin/users", icon: Users },
      { title: "Bookings", desc: "All jobs & booking console", href: "/admin/bookings", icon: Calendar },
      { title: "Client Jobs", desc: "Jobs by client view", href: "/admin/client-jobs", icon: Briefcase },
      { title: "Pricing Rules", desc: "Dynamic pricing config", href: "/admin/pricing-rules", icon: CreditCard },
      { title: "Pricing Management", desc: "Bundle offers & tiers", href: "/admin/pricing", icon: DollarSign },
      { title: "Bulk Comms", desc: "Targeted notifications", href: "/admin/bulk-comms", icon: MessageSquare },
      { title: "Platform Config", desc: "Live fees & feature flags", href: "/admin/platform-config", icon: Settings },
    ],
  },
];

export default function AdminHub() {
  const { data: stats } = useAdminCEOStats();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Command Center</h1>
              <p className="text-muted-foreground">Full platform overview & management</p>
            </div>
          </div>
        </div>

        {/* Live Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "GMV This Month", value: `${stats.gmvThis.toLocaleString()} cr`, icon: TrendingUp, color: "text-primary" },
              { label: "Platform Revenue", value: `${stats.revenueThis.toLocaleString()} cr`, icon: DollarSign, color: "text-success" },
              { label: "Bookings This Month", value: stats.bookingsThis, icon: Calendar, color: "text-blue-500" },
              { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-warning" },
            ].map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dashboard Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="h-1.5 w-5 rounded-full bg-primary inline-block" />
                {section.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} to={item.href}>
                      <Card className={`border hover:shadow-md transition-all hover:border-primary/30 ${section.color}`}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${section.iconBg}`}>
                            <Icon className={`h-4 w-4 ${section.iconColor}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
