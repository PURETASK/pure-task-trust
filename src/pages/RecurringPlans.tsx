import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Repeat, Calendar, Star, Pause, Play, X, RotateCcw, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecurringBookings } from "@/hooks/useRecurringBookings";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
};

export default function RecurringPlans() {
  const { data: plans, isLoading } = useRecurringBookings();
  const queryClient = useQueryClient();
  const [cancelPlanId, setCancelPlanId] = useState<string | null>(null);

  const updatePlan = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("cleaning_subscriptions")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      const label = status === "paused" ? "Plan paused" : status === "active" ? "Plan resumed" : "Plan cancelled";
      toast.success(label);
      queryClient.invalidateQueries({ queryKey: ["recurring-bookings"] });
    },
    onError: () => toast.error("Failed to update plan"),
  });

  const activePlans = plans?.filter((p) => p.status === "active") ?? [];
  const pausedPlans = plans?.filter((p) => p.status === "paused") ?? [];
  const cancelledPlans = plans?.filter((p) => p.status === "cancelled") ?? [];

  return (
    <main className="flex-1 py-6 sm:py-10">
      <div className="container px-4 sm:px-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Repeat className="h-6 w-6 text-primary" />
                Recurring Plans
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage your scheduled cleaning plans</p>
            </div>
            <Button asChild>
              <Link to="/book">
                <RotateCcw className="h-4 w-4 mr-2" />
                New Plan
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
            </div>
          ) : !plans || plans.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Repeat className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-40" />
                <h3 className="font-semibold mb-1">No recurring plans yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Set up weekly or monthly cleanings for consistent care</p>
                <Button asChild><Link to="/book">Create a Plan</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Active */}
              {activePlans.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Active ({activePlans.length})</h2>
                  <div className="space-y-3">
                    {activePlans.map((plan, i) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        index={i}
                        onPause={() => updatePlan.mutate({ id: plan.id, status: "paused" })}
                        onCancel={() => setCancelPlanId(plan.id)}
                        isPending={updatePlan.isPending}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Paused */}
              {pausedPlans.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Paused ({pausedPlans.length})</h2>
                  <div className="space-y-3">
                    {pausedPlans.map((plan, i) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        index={i}
                        onResume={() => updatePlan.mutate({ id: plan.id, status: "active" })}
                        onCancel={() => setCancelPlanId(plan.id)}
                        isPending={updatePlan.isPending}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Cancelled */}
              {cancelledPlans.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Cancelled ({cancelledPlans.length})</h2>
                  <div className="space-y-3 opacity-60">
                    {cancelledPlans.map((plan, i) => (
                      <PlanCard key={plan.id} plan={plan} index={i} isPending={false} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={!!cancelPlanId} onOpenChange={(o) => !o && setCancelPlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel recurring plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop future cleanings from being scheduled. You can always create a new plan later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep plan</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (cancelPlanId) updatePlan.mutate({ id: cancelPlanId, status: "cancelled" });
                setCancelPlanId(null);
              }}
            >
              Cancel plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function PlanCard({
  plan,
  index,
  onPause,
  onResume,
  onCancel,
  isPending,
}: {
  plan: ReturnType<typeof useRecurringBookings>["data"] extends Array<infer T> ? T : never;
  index: number;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  isPending: boolean;
}) {
  const cleanerName = plan.cleaner
    ? `${plan.cleaner.first_name || ""} ${plan.cleaner.last_name || ""}`.trim() || "Assigned"
    : "Any available cleaner";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Card className={plan.status === "paused" ? "border-warning/40 bg-warning/5" : ""}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Repeat className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold capitalize">
                  {(plan.cleaning_type || "standard").replace("_", " ")} Clean
                </h3>
                <Badge
                  variant={plan.status === "active" ? "success" : plan.status === "paused" ? "pending" : "secondary"}
                  className="text-xs"
                >
                  {plan.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {FREQUENCY_LABELS[plan.frequency] ?? plan.frequency} · {plan.credit_amount} credits/session
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  {cleanerName}
                  {plan.cleaner?.avg_rating && ` (${plan.cleaner.avg_rating.toFixed(1)})`}
                </span>
                {plan.next_job_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Next: {format(new Date(plan.next_job_date), "MMM d")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {(onPause || onResume || onCancel) && (
            <div className="flex gap-2 mt-4">
              {onResume && (
                <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={onResume} disabled={isPending}>
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  Resume
                </Button>
              )}
              {onPause && (
                <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={onPause} disabled={isPending}>
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />}
                  Pause
                </Button>
              )}
              {onCancel && (
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/5" onClick={onCancel} disabled={isPending}>
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
