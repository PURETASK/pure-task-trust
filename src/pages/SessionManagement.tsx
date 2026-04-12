import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { MFASetup } from "@/components/security/MFASetup";
import { Monitor, Smartphone, Tablet, Shield, LogOut, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

function getDeviceIcon(device?: string | null) {
  if (device === 'Mobile') return Smartphone;
  if (device === 'Tablet') return Tablet;
  return Monitor;
}

export default function SessionManagement() {
  const { sessions, isLoading, revokeSession, revokeAllOther } = useSessionManagement();

  return (
    <>
      <Helmet><title>Security & Sessions | PureTask</title></Helmet>
      <div className="container max-w-2xl py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" aria-hidden="true" /> Security & Sessions
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your security settings and active devices</p>
          </div>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30"
              onClick={() => revokeAllOther.mutateAsync().then(() => toast.success('All other sessions revoked'))}
              disabled={revokeAllOther.isPending}
              aria-label="Revoke all other sessions"
            >
              <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" /> Revoke All Others
            </Button>
          )}
        </div>

        {/* MFA Section */}
        <MFASetup />

        {/* Sessions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Active Sessions</h2>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : sessions.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No active sessions found</CardContent></Card>
          ) : (
            <div className="space-y-3" role="list" aria-label="Active device sessions">
              {sessions.map(session => {
                const Icon = getDeviceIcon(session.device_name);
                return (
                  <Card key={session.id} className={session.is_current ? 'border-primary/30 bg-primary/5' : ''} role="listitem">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center" aria-hidden="true">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{session.browser || 'Unknown'} on {session.device_name || 'Unknown'}</p>
                          {session.is_current && <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">Current</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Last active: {format(new Date(session.last_active_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      {!session.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeSession.mutateAsync(session.id).then(() => toast.success('Session revoked'))}
                          disabled={revokeSession.isPending}
                          aria-label={`Revoke session for ${session.browser || 'unknown device'}`}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
