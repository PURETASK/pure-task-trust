import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { NotificationPreferencesForm } from "@/components/notifications/NotificationPreferencesForm";
import { PushNotificationSetup } from "@/components/notifications/PushNotificationSetup";
import { MFASetup } from "@/components/security/MFASetup";
import {
  Bell, User, MapPin, Calendar, Shield, CreditCard,
  Link2, Users, AlertTriangle, ChevronRight, Settings, Palette,
  ExternalLink, Award, FileText, Download, Lock
} from "lucide-react";
import { motion } from "framer-motion";

const SETTINGS_LINKS = [
  {
    group: "Profile",
    icon: User,
    color: "text-primary",
    bg: "bg-primary/10",
    items: [
      { icon: User, label: "Edit Profile", desc: "Update rates, bio, and photo", href: "/cleaner/profile" },
      { icon: ExternalLink, label: "Public Profile", desc: "Preview how clients see you", href: "/cleaner/profile/view" },
      { icon: Award, label: "Certifications", desc: "Upload and manage credentials", href: "/cleaner/certifications" },
    ],
  },
  {
    group: "Availability & Services",
    icon: Calendar,
    color: "text-success",
    bg: "bg-success/10",
    items: [
      { icon: Calendar, label: "Availability Schedule", desc: "Working hours & time-off blocks", href: "/cleaner/availability" },
      { icon: MapPin, label: "Service Areas", desc: "Configure your service radius", href: "/cleaner/service-areas" },
      { icon: Link2, label: "Calendar Sync", desc: "Connect Google / Apple calendar", href: "/cleaner/calendar-sync" },
    ],
  },
  {
    group: "Account & Payments",
    icon: CreditCard,
    color: "text-warning",
    bg: "bg-warning/10",
    items: [
      { icon: CreditCard, label: "Earnings & Payouts", desc: "Bank account & payout history", href: "/cleaner/earnings" },
      { icon: Shield, label: "Verification Center", desc: "ID and background check status", href: "/cleaner/verification" },
      { icon: Users, label: "My Team", desc: "Manage team members", href: "/cleaner/team" },
    ],
  },
  {
    group: "Tools",
    icon: Settings,
    color: "text-[hsl(var(--pt-aqua))]",
    bg: "bg-[hsl(var(--pt-aqua))]/10",
    items: [
      { icon: FileText, label: "Client Notes", desc: "Private notes about client preferences", href: "/cleaner/client-notes" },
      { icon: Shield, label: "Active Sessions", desc: "Manage logged-in devices", href: "/sessions" },
      { icon: Download, label: "Data Export", desc: "Download all your data", href: "/data-export" },
    ],
  },
  {
    group: "Policies",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    items: [
      { icon: AlertTriangle, label: "Cancellation Policy", desc: "Review rules and penalties", href: "/cleaner/cancellation-policy" },
    ],
  },
];

export default function CleanerSettings() {
  return (
    <CleanerLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account, preferences, and configuration</p>
        </motion.div>

        {/* Settings Groups */}
        {SETTINGS_LINKS.map((group, gi) => (
          <motion.div key={group.group} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.08 }}>
            <Card className="overflow-hidden">
              <CardHeader className="pb-0 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <group.icon className={`h-3.5 w-3.5 ${group.color}`} />
                  {group.group}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                {group.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors group ${i < group.items.length - 1 ? 'border-b border-border/50' : ''}`}
                    >
                      <div className={`h-9 w-9 rounded-xl ${group.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-4 w-4 ${group.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationPreferencesForm />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PushNotificationSetup />
            </CardContent>
          </Card>
        </motion.div>

        {/* Two-Factor Authentication */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <MFASetup />
        </motion.div>
      </div>
    </CleanerLayout>
  );
}
