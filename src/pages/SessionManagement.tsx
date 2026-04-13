import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Monitor, Smartphone, Tablet, LogOut, Trash2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { MFASetup } from "@/components/security/MFASetup";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

function getDeviceIcon(device?: string | null) {
  if (device === 'Mobile') return Smartphone;
  if (device === 'Tablet') return Tablet;
  return Monitor;
}

const f = (delay = 0) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.3 } });

export default function SessionManagement() {
  const { sessions, isLoading, revokeSession, revokeAllOther } = useSessionManagement();

  return (
    <main className="flex-1 bg-background min-h-screen">
      <Helmet><title>Security & Sessions | PureTask</title></Helmet>
      <div className="container px-4 sm:px-6 py-5 sm:py-8 max-w-3xl">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 rounded-xl" asChild>
          <Link to="/account"><ArrowLeft className="mr-1 h-4 w-4" /> Account</Link>
        </Button>

        {/* Header */}
        <motion.div {...f(0)} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-success/10 border-2 border-success/30 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Security</h1>
              <p className="text-muted-foreground text-sm">Manage sessions, MFA, and login activity</p>
            </div>
          </div>
        </motion.div>

        {/* MFA */}
        <motion.div {...f(0.04)} className="mb-6">
          <MFASetup />
        </motion.div>

        {/* Sessions */}
        <motion.div {...f(0.08)}>
          <div className="rounded-3xl border-2 border-border/40 overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted border-2 border-border/40 flex items-center justify-center">
                    <Key className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Active Sessions</h2>
                    <p className="text-xs text-muted-foreground">Devices currently logged in</p>
                  </div>
                </div>
                {sessions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 rounded-xl text-xs"
                    onClick={() => revokeAllOther.mutateAsync().then(() => toast.success('All other sessions revoked'))}
                    disabled={revokeAllOther.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Revoke All Others
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
              ) : sessions.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-muted-foreground">No active sessions found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session, i) => {
                    const DeviceIcon = getDeviceIcon(session.device_name);
                    return (
                      <motion.div key={session.id} {...f(0.1 + i * 0.03)}>
                        <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border/40 bg-card">
                          <div className="h-11 w-11 rounded-xl bg-muted border-2 border-border/40 flex items-center justify-center flex-shrink-0">
                            <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm truncate">{session.device_name || 'Unknown Device'}</p>
                              {session.is_current && <Badge className="bg-success/10 text-success border-success/30 text-[10px] h-5 font-bold">Current</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{session.browser || 'Unknown browser'}</p>
                            {session.last_active_at && (
                              <p className="text-xs text-muted-foreground">Last active: {format(new Date(session.last_active_at), "MMM d, h:mm a")}</p>
                            )}
                          </div>
                          {!session.is_current && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => revokeSession.mutateAsync(session.id).then(() => toast.success('Session revoked'))}
                              disabled={revokeSession.isPending}
                            >
                              <LogOut className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
