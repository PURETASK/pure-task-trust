import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotificationPreferencesForm } from "@/components/notifications/NotificationPreferencesForm";
import { PushNotificationSetup } from "@/components/notifications/PushNotificationSetup";
import { NotificationHistory } from "@/components/notifications/NotificationHistory";

export default function NotificationSettings() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Notification Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage how and when you receive notifications
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <NotificationPreferencesForm />
            </div>
            <div className="space-y-6">
              <PushNotificationSetup />
              <NotificationHistory />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
