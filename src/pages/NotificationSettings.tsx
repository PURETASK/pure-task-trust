import { Link } from "react-router-dom";
import { ArrowLeft, Bell, Smartphone, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPreferencesForm } from "@/components/notifications/NotificationPreferencesForm";
import { PushNotificationSetup } from "@/components/notifications/PushNotificationSetup";
import { NotificationHistory } from "@/components/notifications/NotificationHistory";
import { motion } from "framer-motion";

const f = (delay = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.3 } });

export default function NotificationSettings() {
  return (
    <main className="flex-1 bg-background min-h-screen">
      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-3xl">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 rounded-xl" asChild>
          <Link to="/account"><ArrowLeft className="mr-1 h-4 w-4" /> Account</Link>
        </Button>

        {/* Header */}
        <motion.div {...f(0)} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-warning/10 border-2 border-warning/30 flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Notifications</h1>
              <p className="text-muted-foreground text-sm">Manage how and when you receive alerts</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Preferences */}
          <motion.div {...f(0.04)}>
            <div className="rounded-3xl border-2 border-border/40 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-black">Notification Preferences</h2>
              </div>
              <NotificationPreferencesForm />
            </div>
          </motion.div>

          {/* Push setup */}
          <motion.div {...f(0.08)}>
            <div className="rounded-3xl border-2 border-border/40 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-black">Push Notifications</h2>
              </div>
              <PushNotificationSetup />
            </div>
          </motion.div>

          {/* History */}
          <motion.div {...f(0.12)}>
            <div className="rounded-3xl border-2 border-border/40 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-black">Recent Notifications</h2>
              </div>
              <NotificationHistory />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
