import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Bell, BellOff, Trash2 } from "lucide-react";
import { useDeviceTokens } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function PushNotificationSetup() {
  const { tokens, isLoading, registerToken, deactivateToken } = useDeviceTokens();
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPushPermission = async () => {
    setIsRequesting(true);
    
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        toast.error('Push notifications not supported in this browser');
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // In a real app, you would get a token from FCM or your push service
        // For now, we'll create a mock token for demonstration
        const mockToken = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await registerToken.mutateAsync({
          token: mockToken,
          platform: 'web',
          deviceName: navigator.userAgent.includes('Chrome') ? 'Chrome Browser' 
            : navigator.userAgent.includes('Firefox') ? 'Firefox Browser'
            : navigator.userAgent.includes('Safari') ? 'Safari Browser'
            : 'Web Browser',
        });
      } else if (permission === 'denied') {
        toast.error('Push notifications blocked. Please enable in browser settings.');
      } else {
        toast.info('Push notification permission dismissed');
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
      toast.error('Failed to enable push notifications');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeactivate = async (tokenId: string) => {
    try {
      await deactivateToken.mutateAsync(tokenId);
      toast.success('Device removed');
    } catch (error) {
      toast.error('Failed to remove device');
    }
  };

  const hasActiveTokens = tokens && tokens.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Manage devices that receive push notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status indicator */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            {hasActiveTokens ? (
              <Bell className="h-5 w-5 text-success" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {hasActiveTokens ? 'Push notifications enabled' : 'Push notifications disabled'}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasActiveTokens 
                  ? `${tokens.length} device${tokens.length > 1 ? 's' : ''} registered` 
                  : 'Enable to receive instant updates'}
              </p>
            </div>
          </div>
          {!hasActiveTokens && (
            <Button 
              onClick={requestPushPermission}
              disabled={isRequesting || registerToken.isPending}
            >
              {isRequesting ? 'Requesting...' : 'Enable'}
            </Button>
          )}
        </div>

        {/* Registered devices */}
        {hasActiveTokens && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Registered Devices</p>
            {tokens.map(token => (
              <div 
                key={token.id} 
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {token.device_name || token.platform}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {token.last_used_at 
                        ? `Last used ${formatDistanceToNow(new Date(token.last_used_at), { addSuffix: true })}`
                        : `Added ${formatDistanceToNow(new Date(token.created_at), { addSuffix: true })}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {token.platform}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeactivate(token.id)}
                    disabled={deactivateToken.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add another device */}
        {hasActiveTokens && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={requestPushPermission}
            disabled={isRequesting || registerToken.isPending}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Add This Device
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
