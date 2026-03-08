
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackgroundChecks } from "@/hooks/useBackgroundChecks";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, Clock, AlertTriangle, ExternalLink, Camera, MapPin, FileCheck, Loader2, Star, Lock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const VERIFICATION_ITEMS = [
  { icon: FileCheck, title: "Background Check", desc: "National criminal & identity verification", color: "text-primary", bg: "bg-primary/10", key: "background" },
  { icon: Camera, title: "Photo Documentation", desc: "Before & after photos for every job", color: "text-violet-500", bg: "bg-violet-500/10", key: "photo", auto: true },
  { icon: MapPin, title: "GPS Check-In", desc: "Location verified at job arrival", color: "text-rose-500", bg: "bg-rose-500/10", key: "gps", auto: true },
  { icon: Star, title: "Client Reviews", desc: "Verified ratings from past clients", color: "text-amber-500", bg: "bg-amber-500/10", key: "reviews", auto: true },
];

export default function CleanerVerification() {
  const { toast } = useToast();
  const { profile, isLoading: profileLoading } = useCleanerProfile();
  const { latestCheck, isVerified, isLoading, requestCheck } = useBackgroundChecks();
  const isRequesting = requestCheck.isPending;

  const handleRequest = async () => {
    try {
      await requestCheck.mutateAsync("checkr");
      toast({ title: "Background check requested", description: "You'll receive an email with next steps." });
    } catch (e: any) { toast({ title: "Request failed", description: e.message, variant: "destructive" }); }
  };

  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`relative overflow-hidden rounded-3xl p-8 border ${isVerified ? 'bg-gradient-to-br from-success/10 to-emerald-500/5 border-success/30' : 'bg-gradient-to-br from-warning/10 to-amber-500/5 border-warning/30'}`}>
            <div className="flex items-center gap-5">
              <div className={`h-20 w-20 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0 ${isVerified ? 'bg-gradient-to-br from-success to-emerald-600 shadow-success/25' : 'bg-gradient-to-br from-warning to-amber-500 shadow-warning/25'}`}>
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold">{isVerified ? "Verified Cleaner" : "Build Your Trust Profile"}</h1>
                  {isVerified && <Badge className="bg-success/20 text-success border-success/30"><CheckCircle className="h-3.5 w-3.5 mr-1" />Verified</Badge>}
                </div>
                <p className="text-muted-foreground">
                  {isVerified
                    ? "Your profile is fully verified. Clients can see your trust badges and feel confident booking you."
                    : "Complete the steps below to become a verified cleaner and unlock 3× more bookings."
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Benefits Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "3×", label: "More Bookings", color: "text-primary" },
            { value: "Top", label: "Search Results", color: "text-success" },
            { value: "VIP", label: "Client Trust", color: "text-violet-500" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-border/60 text-center">
                <CardContent className="p-4">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Verification Steps */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Verification Steps</h2>
          {VERIFICATION_ITEMS.map((item, i) => {
            const isCompleted = item.auto || (item.key === 'background' && latestCheck?.status === 'completed');
            const isPending = item.key === 'background' && latestCheck?.status === 'pending';

            return (
              <motion.div key={item.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className={`border-border/60 overflow-hidden ${isCompleted ? 'border-success/30 bg-success/5' : isPending ? 'border-warning/30 bg-warning/5' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{item.title}</h3>
                          {isCompleted && <Badge className="bg-success/10 text-success border-success/30 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>}
                          {isPending && <Badge className="bg-warning/10 text-warning border-warning/30 text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>}
                          {item.auto && <Badge variant="outline" className="text-xs">Auto-verified</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                        {item.key === 'background' && latestCheck?.completed_at && (
                          <p className="text-xs text-muted-foreground mt-1">Completed {format(new Date(latestCheck.completed_at), 'MMM d, yyyy')}</p>
                        )}
                        {item.key === 'background' && latestCheck?.expires_at && (
                          <p className="text-xs text-muted-foreground">Expires {format(new Date(latestCheck.expires_at), 'MMM d, yyyy')}</p>
                        )}
                      </div>

                      {item.key === 'background' && (
                        <div>
                          {isLoading || profileLoading ? <Skeleton className="h-9 w-32" /> :
                          latestCheck?.report_url ? (
                            <Button variant="outline" size="sm" asChild>
                              <a href={latestCheck.report_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5" />View Report</a>
                            </Button>
                          ) : !latestCheck ? (
                            <Button size="sm" onClick={handleRequest} disabled={isRequesting} className="bg-gradient-to-r from-primary to-primary/80">
                              {isRequesting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Start Check
                            </Button>
                          ) : latestCheck.status !== 'pending' ? (
                            <Button variant="outline" size="sm" onClick={handleRequest} disabled={isRequesting}>
                              {isRequesting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Renew
                            </Button>
                          ) : null}
                        </div>
                      )}

                      {item.auto && <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Security badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card className="overflow-hidden border-0">
            <div className="bg-gradient-to-br from-primary to-violet-600 p-8 text-white text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-2xl font-bold mb-2">Your Data is Secure</h3>
              <p className="text-white/80 max-w-md mx-auto">All verification data is encrypted and stored securely. We never share your information with third parties without your consent.</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </CleanerLayout>
  );
}
