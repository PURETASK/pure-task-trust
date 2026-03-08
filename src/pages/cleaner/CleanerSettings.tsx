import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { NotificationPreferencesForm } from "@/components/notifications/NotificationPreferencesForm";
import { PushNotificationSetup } from "@/components/notifications/PushNotificationSetup";
import {
  Bell, User, MapPin, Calendar, Shield, CreditCard,
  Link2, Users, AlertTriangle, ChevronRight, Settings
} from "lucide-react";

const SETTINGS_LINKS = [
  {
    group: "Profile",
    items: [
      { icon: User, label: "Profile Settings", desc: "Edit your rates, bio, and photo", href: "/cleaner/profile" },
      { icon: User, label: "View Public Profile", desc: "See how clients see you", href: "/cleaner/profile/view" },
    ],
  },
  {
    group: "Availability & Services",
    items: [
      { icon: Calendar, label: "Availability", desc: "Manage your working hours & time off", href: "/cleaner/availability" },
      { icon: MapPin, label: "Service Areas", desc: "Set the areas you serve", href: "/cleaner/service-areas" },
      { icon: Link2, label: "Calendar Sync", desc: "Connect Google/Apple calendar", href: "/cleaner/calendar-sync" },
    ],
  },
  {
    group: "Account & Payments",
    items: [
      { icon: CreditCard, label: "Earnings & Payouts", desc: "Bank details and payout history", href: "/cleaner/earnings" },
      { icon: Shield, label: "Verification", desc: "ID and background check status", href: "/cleaner/verification" },
      { icon: Users, label: "My Team", desc: "Manage team members", href: "/cleaner/team" },
    ],
  },
  {
    group: "Policies",
    items: [
      { icon: AlertTriangle, label: "Cancellation Policy", desc: "Review cancellation rules and penalties", href: "/cleaner/cancellation-policy" },
    ],
  },
];

export default function CleanerSettings() {
  return (
    <CleanerLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, notifications, and preferences
          </p>
        </div>

        {/* Quick Links */}
        {SETTINGS_LINKS.map((group) => (
          <Card key={group.group}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{group.group}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {group.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group ${
                      i < group.items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {/* Notification Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationPreferencesForm />
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Push Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <PushNotificationSetup />
          </CardContent>
        </Card>
      </div>
    </CleanerLayout>
  );
}
