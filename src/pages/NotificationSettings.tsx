import { motion } from "framer-motion";
import { Bell, Smartphone, History } from "lucide-react";
import { NotificationPreferencesForm } from "@/components/notifications/NotificationPreferencesForm";
import { PushNotificationSetup } from "@/components/notifications/PushNotificationSetup";
import { NotificationHistory } from "@/components/notifications/NotificationHistory";

export default function NotificationSettings() {
  return (
    <main className="flex-1">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-background">
        <div className="container max-w-4xl px-4 sm:px-6 py-10 sm:py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Notification Settings</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Manage how and when you receive alerts</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Preferences</span>
            </div>
            <NotificationPreferencesForm />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Push & History</span>
            </div>
            <PushNotificationSetup />
            <NotificationHistory />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
