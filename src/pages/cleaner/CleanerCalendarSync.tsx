import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendarSync } from "@/hooks/useCalendarSync";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Link2, Unlink, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function CleanerCalendarSync() {
  const { toast } = useToast();
  const { connections, isLoading, toggleSync: toggleSyncMutation, disconnectCalendar } = useCalendarSync();
  const isDisconnecting = disconnectCalendar.isPending;
  
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const handleToggleSync = async (connectionId: number, enabled: boolean) => {
    setSyncingId(connectionId);
    try {
      await toggleSyncMutation.mutateAsync({ connectionId, enabled });
      toast({ 
        title: enabled ? "Sync enabled" : "Sync disabled",
        description: enabled ? "Your calendar will now sync automatically" : "Calendar sync has been paused"
      });
    } catch (error: any) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (connectionId: number) => {
    try {
      await disconnectCalendar.mutateAsync(connectionId);
      toast({ title: "Calendar disconnected" });
    } catch (error: any) {
      toast({ title: "Failed to disconnect", description: error.message, variant: "destructive" });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return '🔴';
      case 'outlook':
      case 'microsoft':
        return '🔵';
      case 'apple':
        return '⚪';
      default:
        return '📅';
    }
  };

  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar Sync</h1>
          <p className="text-muted-foreground mt-1">
            Connect your external calendars to sync your availability
          </p>
        </div>

        {/* Connect New Calendar */}
        <Card className="border-dashed border-2">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Link2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Connect a Calendar</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Sync your Google, Outlook, or Apple calendar to automatically block times when you're busy
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="outline">
                  <span className="mr-2">🔴</span>
                  Google Calendar
                </Button>
                <Button variant="outline">
                  <span className="mr-2">🔵</span>
                  Outlook
                </Button>
                <Button variant="outline">
                  <span className="mr-2">⚪</span>
                  Apple Calendar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Calendar sync requires authentication with your calendar provider
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Connected Calendars */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Connected Calendars
            </CardTitle>
            <CardDescription>
              Manage your synced calendar connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
              </div>
            ) : connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div 
                    key={connection.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-card flex items-center justify-center text-2xl">
                        {getProviderIcon(connection.provider)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold capitalize">{connection.provider}</h3>
                          {connection.sync_enabled ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Synced
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Paused
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {connection.email || connection.external_id}
                        </p>
                        {connection.last_synced_at && (
                          <p className="text-xs text-muted-foreground">
                            Last synced: {format(new Date(connection.last_synced_at), 'MMM d, h:mm a')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Sync</span>
                        <Switch
                          checked={connection.sync_enabled}
                          onCheckedChange={(checked) => handleToggleSync(connection.id, checked)}
                          disabled={syncingId === connection.id}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDisconnect(connection.id)}
                        disabled={isDisconnecting}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No calendars connected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect a calendar above to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Calendar Sync Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">1. Connect</h4>
                <p className="text-sm text-muted-foreground">
                  Authorize access to your calendar
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">2. Sync</h4>
                <p className="text-sm text-muted-foreground">
                  Your busy times are automatically imported
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">3. Avoid Conflicts</h4>
                <p className="text-sm text-muted-foreground">
                  Jobs won't be scheduled when you're busy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CleanerLayout>
  );
}
