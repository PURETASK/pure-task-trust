import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, Smartphone, MessageSquare } from "lucide-react";
import { useNotificationPreferences } from "@/hooks/useNotifications";

export function NotificationPreferencesForm() {
  const { 
    preferences, 
    isLoading, 
    initializePreferences, 
    updatePreferences,
  } = useNotificationPreferences();

  // Initialize preferences if empty
  useEffect(() => {
    if (!isLoading && !preferences) {
      initializePreferences.mutate();
    }
  }, [isLoading, preferences]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const channels = [
    {
      key: 'email_enabled' as const,
      label: 'Email Notifications',
      description: 'Receive booking confirmations, receipts, and updates via email',
      icon: <Mail className="h-5 w-5" />,
    },
    {
      key: 'push_enabled' as const,
      label: 'Push Notifications',
      description: 'Get instant alerts on your device for job updates and messages',
      icon: <Smartphone className="h-5 w-5" />,
    },
    {
      key: 'sms_enabled' as const,
      label: 'SMS Notifications',
      description: 'Receive text messages for urgent updates',
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to be notified about different activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {channels.map(channel => (
          <div 
            key={channel.key}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-muted">
                {channel.icon}
              </div>
              <div>
                <Label className="font-medium">{channel.label}</Label>
                <p className="text-sm text-muted-foreground">{channel.description}</p>
              </div>
            </div>
            <Switch
              checked={preferences?.[channel.key] ?? true}
              onCheckedChange={(checked) => {
                updatePreferences.mutate({ [channel.key]: checked });
              }}
              disabled={updatePreferences.isPending}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
