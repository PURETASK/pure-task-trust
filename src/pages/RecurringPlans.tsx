
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Repeat, Calendar, Star, Pause, Play, X, RotateCcw, Loader2, Plus, Zap, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecurringBookings } from "@/hooks/useRecurringBookings";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const FREQUENCY_LABELS: Record<string, { label: string; desc: string; savings: string }> = {
  weekly: { label: "Weekly", desc: "Every 7 days", savings: "Save 15%" },
  biweekly: { label: "Biweekly", desc: "Every 2 weeks", savings: "Save 10%" },
  monthly: { label: "Monthly", desc: "Every 4 weeks", savings: "Save 5%" },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  active: { bg: "bg-success/10", text: "text-success", border: "border-success/30" },
  paused: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
  cancelled: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
};

export default function RecurringPlans() {
  const { data: plans, isLoading } = useRecurringBookings();
  const queryClient = useQueryClient();
  const [cancelPlanId, setCancelPlanId] = useState<string | null>(null);

  const updatePlan = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("cleaning_subscriptions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      const labels = { paused: "Plan paused", active: "Plan resumed", cancelled: "Plan cancelled" } as Record<string, string>;
      toast.success(labels[status] || "Updated");
      queryClient.invalidateQueries({ queryKey: ["recurring-bookings"] });
    },
    onError: () => toast.error("Failed to update plan"),
  });

  const activePlans = plans?.filter((p) => p.status === "active") ?? [];
  const pausedPlans = plans?.filter((p) => p.status === "paused") ?? [];
  const cancelledPlans = plans?.filter((p) => p.status === "cancelled") ?? [];

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-3xl">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-violet-500/5 to-cyan-500/10 border border-primary/20 p-8 mb-8">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/5 rounded-full" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/25">
                <Repeat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Recurring Plans</h1>
                <p className="text-muted-foreground mt-1">Save money with scheduled cleanings</p>
              </div>
            </div>
            <Button asChild className="gap-2 bg-gradient-to-r from-primary to-violet-600 shadow-lg">
              <Link to="/book"><Plus className="h-4 w-4" />New Plan</Link>
            </Button>
          </div>
        </div>

        {/* Savings banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/20 mb-6">
          <Zap className="h-5 w-5 text-success flex-shrink-0" />
          <p className="text-sm text-success font-medium">Recurring plans save you up to 15% on every booking vs one-time rates</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
        ) : !plans || plans.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-dashed border-2">
              <CardContent className="py-20 text-center">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Repeat className="h-10 w-10 text-primary opacity-60" />
                </div>
                <h3 className="text-xl font-bold mb-2">No recurring plans yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Set up weekly or monthly cleanings for consistent care and save on every visit</p>
                <Button asChild size="lg" className="gap-2"><Link to="/book"><Plus className="h-5 w-5" />Create Your First Plan</Link></Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {activePlans.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <h2 className="text-sm font-bold text-success uppercase tracking-wide">Active Plans ({activePlans.length})</h2>
                </div>
                <div className="space-y-3">
                  {activePlans.map((plan, i) => <PlanCard key={plan.id} plan={plan} index={i} onPause={() => updatePlan.mutate({ id: plan.id, status: "paused" })} onCancel={() => setCancelPlanId(plan.id)} isPending={updatePlan.isPending} />)}
                </div>
              </section>
            )}
            {pausedPlans.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <h2 className="text-sm font-bold text-warning uppercase tracking-wide">Paused ({pausedPlans.length})</h2>
                </div>
                <div className="space-y-3">
                  {pausedPlans.map((plan, i) => <PlanCard key={plan.id} plan={plan} index={i} onResume={() => updatePlan.mutate({ id: plan.id, status: "active" })} onCancel={() => setCancelPlanId(plan.id)} isPending={updatePlan.isPending} />)}
                </div>
              </section>
            )}
            {cancelledPlans.length > 0 && (
              <section className="opacity-50">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">Cancelled ({cancelledPlans.length})</h2>
                <div className="space-y-3">
                  {cancelledPlans.map((plan, i) => <PlanCard key={plan.id} plan={plan} index={i} isPending={false} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={!!cancelPlanId} onOpenChange={(o) => !o && setCancelPlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel recurring plan?</AlertDialogTitle>
            <AlertDialogDescription>This will stop future cleanings from being scheduled. You can create a new plan anytime.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Plan</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (cancelPlanId) updatePlan.mutate({ id: cancelPlanId, status: "cancelled" }); setCancelPlanId(null); }}>
              Cancel Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function PlanCard({ plan, index, onPause, onResume, onCancel, isPending }: {
  plan: any; index: number; onPause?: () => void; onResume?: () => void; onCancel?: () => void; isPending: boolean;
}) {
  const cleanerName = plan.cleaner ? `${plan.cleaner.first_name || ""} ${plan.cleaner.last_name || ""}`.trim() || "Assigned" : "Any available cleaner";
  const statusStyle = STATUS_STYLES[plan.status] || STATUS_STYLES.cancelled;
  const freqInfo = FREQUENCY_LABELS[plan.frequency] || { label: plan.frequency, desc: "", savings: "" };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
      <Card className="overflow-hidden border-border/60 hover:shadow-elevated transition-all">
        <CardContent className="p-0">
          <div className="flex items-stretch">
            {/* Color bar */}
            <div className={`w-1.5 flex-shrink-0 ${plan.status === 'active' ? 'bg-success' : plan.status === 'paused' ? 'bg-warning' : 'bg-muted-foreground/30'}`} />
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Repeat className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold capitalize">{(plan.cleaning_type || "standard").replace("_", " ")} Clean</h3>
                      <Badge className={`${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} text-xs`}>{plan.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="font-medium text-foreground">{freqInfo.label}</span>
                      {freqInfo.savings && <Badge variant="outline" className="text-success border-success/30 text-xs">{freqInfo.savings}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{plan.credit_amount}</p>
                  <p className="text-xs text-muted-foreground">credits/session</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {cleanerName}{plan.cleaner?.avg_rating && ` (${plan.cleaner.avg_rating.toFixed(1)})`}
                </span>
                {plan.next_job_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Next: {format(new Date(plan.next_job_date), "MMM d")}
                  </span>
                )}
              </div>

              {(onPause || onResume || onCancel) && (
                <div className="flex gap-2">
                  {onResume && (
                    <Button size="sm" className="flex-1 gap-1.5 bg-success/10 text-success border-success/30 hover:bg-success/20" variant="outline" onClick={onResume} disabled={isPending}>
                      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}Resume
                    </Button>
                  )}
                  {onPause && (
                    <Button size="sm" className="flex-1 gap-1.5" variant="outline" onClick={onPause} disabled={isPending}>
                      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}Pause
                    </Button>
                  )}
                  {onCancel && (
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onCancel} disabled={isPending}>
                      <X className="h-3.5 w-3.5 mr-1" />Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
