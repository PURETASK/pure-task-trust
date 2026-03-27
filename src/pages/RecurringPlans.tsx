
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Repeat, Calendar, Star, Pause, Play, X, Loader2, Plus, Zap, Check } from "lucide-react";
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

const f = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

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
      <div className="container px-3 sm:px-4 lg:px-6 max-w-4xl">
        {/* Hero */}
        <motion.div {...f(0)}>
          <div className="relative overflow-hidden rounded-3xl border-2 border-[hsl(var(--pt-purple))]/50 p-6 sm:p-8 mb-6 sm:mb-8"
            style={{ background: "linear-gradient(135deg, hsl(var(--pt-purple)/0.15) 0%, hsl(var(--primary)/0.06) 60%, hsl(var(--background)) 100%)" }}>
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: "hsl(var(--pt-purple)/0.12)" }} />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[hsl(var(--pt-purple))]/15 border-2 border-[hsl(var(--pt-purple))]/40 flex items-center justify-center">
                  <Repeat className="h-7 w-7 sm:h-8 sm:w-8 text-[hsl(var(--pt-purple))]" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black">Recurring Plans</h1>
                  <p className="text-muted-foreground mt-1">Save money with scheduled cleanings</p>
                </div>
              </div>
              <Button asChild className="gap-2">
                <Link to="/book"><Plus className="h-4 w-4" />New Plan</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Savings banner */}
        <motion.div {...f(0.06)}>
          <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-success/40 bg-success/5 mb-6">
            <Zap className="h-5 w-5 text-success flex-shrink-0" />
            <p className="text-sm text-success font-bold">Recurring plans save you up to 15% on every booking vs one-time rates</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">{[1,2].map((i) => <Skeleton key={i} className="h-44 rounded-3xl" />)}</div>
        ) : !plans || plans.length === 0 ? (
          <motion.div {...f(0.1)}>
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-border">
              <div className="h-20 w-20 rounded-2xl bg-[hsl(var(--pt-purple))]/10 border-2 border-[hsl(var(--pt-purple))]/20 flex items-center justify-center mx-auto mb-6">
                <Repeat className="h-10 w-10 text-[hsl(var(--pt-purple))]/60" />
              </div>
              <h3 className="text-xl font-black mb-2">No recurring plans yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Set up weekly or monthly cleanings for consistent care and save on every visit</p>
              <Button asChild size="lg" className="gap-2"><Link to="/book"><Plus className="h-5 w-5" />Create Your First Plan</Link></Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {activePlans.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <h2 className="text-xs font-black text-success uppercase tracking-widest">Active Plans ({activePlans.length})</h2>
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
                  <h2 className="text-xs font-black text-warning uppercase tracking-widest">Paused ({pausedPlans.length})</h2>
                </div>
                <div className="space-y-3">
                  {pausedPlans.map((plan, i) => <PlanCard key={plan.id} plan={plan} index={i} onResume={() => updatePlan.mutate({ id: plan.id, status: "active" })} onCancel={() => setCancelPlanId(plan.id)} isPending={updatePlan.isPending} />)}
                </div>
              </section>
            )}
            {cancelledPlans.length > 0 && (
              <section className="opacity-50">
                <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Cancelled ({cancelledPlans.length})</h2>
                <div className="space-y-3">
                  {cancelledPlans.map((plan, i) => <PlanCard key={plan.id} plan={plan} index={i} isPending={false} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={!!cancelPlanId} onOpenChange={(o) => !o && setCancelPlanId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black">Cancel recurring plan?</AlertDialogTitle>
            <AlertDialogDescription>This will stop future cleanings from being scheduled. You can create a new plan anytime.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-2">Keep Plan</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl" onClick={() => { if (cancelPlanId) updatePlan.mutate({ id: cancelPlanId, status: "cancelled" }); setCancelPlanId(null); }}>
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
  const freqInfo = FREQUENCY_LABELS[plan.frequency] || { label: plan.frequency, desc: "", savings: "" };
  const statusColor = plan.status === 'active' ? 'border-success/50' : plan.status === 'paused' ? 'border-warning/50' : 'border-border';
  const barColor = plan.status === 'active' ? 'bg-success' : plan.status === 'paused' ? 'bg-warning' : 'bg-muted-foreground/30';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
      <div className={`rounded-3xl border-2 ${statusColor} hover:shadow-elevated transition-all overflow-hidden`}>
        <div className="flex items-stretch">
          <div className={`w-1.5 flex-shrink-0 ${barColor}`} />
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-[hsl(var(--pt-purple))]/10 border-2 border-[hsl(var(--pt-purple))]/30 flex items-center justify-center flex-shrink-0">
                  <Repeat className="h-6 w-6 text-[hsl(var(--pt-purple))]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-black capitalize">{(plan.cleaning_type || "standard").replace("_", " ")} Clean</h3>
                    <Badge className={`text-xs font-bold border-2 ${
                      plan.status === 'active' ? 'bg-success/10 text-success border-success/40' :
                      plan.status === 'paused' ? 'bg-warning/10 text-warning border-warning/40' :
                      'bg-muted text-muted-foreground border-border'
                    }`}>{plan.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <span className="font-bold text-foreground">{freqInfo.label}</span>
                    {freqInfo.savings && <Badge className="text-success border-2 border-success/30 bg-success/10 text-xs font-bold">{freqInfo.savings}</Badge>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-primary">{plan.credit_amount}</p>
                <p className="text-xs text-muted-foreground">credits/session</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{cleanerName}{plan.cleaner?.avg_rating && ` (${plan.cleaner.avg_rating.toFixed(1)})`}</span>
              {plan.next_job_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Next: {format(new Date(plan.next_job_date), "MMM d")}</span>}
            </div>

            {(onPause || onResume || onCancel) && (
              <div className="flex gap-2">
                {onResume && (
                  <Button size="sm" className="flex-1 gap-1.5 bg-success/10 text-success border-2 border-success/30 hover:bg-success/20 rounded-xl" variant="outline" onClick={onResume} disabled={isPending}>
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}Resume
                  </Button>
                )}
                {onPause && (
                  <Button size="sm" className="flex-1 gap-1.5 rounded-xl border-2" variant="outline" onClick={onPause} disabled={isPending}>
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}Pause
                  </Button>
                )}
                {onCancel && (
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={onCancel} disabled={isPending}>
                    <X className="h-3.5 w-3.5 mr-1" />Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
