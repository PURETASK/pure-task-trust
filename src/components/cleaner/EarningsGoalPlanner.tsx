import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Edit2, Check, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";

interface EarningsGoalPlannerProps {
  cleanerId: string;
  currentGoal: number | null;
  earnings: Array<{ net_credits: number; created_at: string }>;
}

export function EarningsGoalPlanner({ cleanerId, currentGoal, earnings }: EarningsGoalPlannerProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(currentGoal || ""));

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const mtdEarnings = earnings
    .filter(e => {
      const d = new Date(e.created_at);
      return d >= monthStart && d <= monthEnd;
    })
    .reduce((sum, e) => sum + e.net_credits, 0);

  const goal = currentGoal || 0;
  const progress = goal > 0 ? Math.min(100, (mtdEarnings / goal) * 100) : 0;

  // Trajectory calculation
  const dayOfMonth = now.getDate();
  const totalDays = getDaysInMonth(now);
  const expectedByNow = goal > 0 ? (goal / totalDays) * dayOfMonth : 0;
  const trajectoryPct = expectedByNow > 0 ? ((mtdEarnings - expectedByNow) / expectedByNow) * 100 : 0;

  const getTrajectory = () => {
    if (goal === 0) return null;
    if (trajectoryPct >= 5) return { label: "Ahead of pace", color: "text-success", icon: TrendingUp };
    if (trajectoryPct <= -10) return { label: "Behind pace", color: "text-destructive", icon: TrendingDown };
    return { label: "On track", color: "text-primary", icon: Minus };
  };
  const trajectory = getTrajectory();

  const saveGoal = useMutation({
    mutationFn: async (newGoal: number) => {
      const { error } = await supabase
        .from("cleaner_profiles")
        .update({ monthly_earnings_goal: newGoal } as any)
        .eq("id", cleanerId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Monthly goal saved!");
      queryClient.invalidateQueries({ queryKey: ["cleaner-profile", cleanerId] });
      setEditing(false);
    },
    onError: () => toast.error("Failed to save goal"),
  });

  const handleSave = () => {
    const val = parseInt(inputVal, 10);
    if (isNaN(val) || val < 1) { toast.error("Enter a valid goal amount"); return; }
    saveGoal.mutate(val);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="h-4 w-4 text-primary" />
          </div>
          Monthly Earnings Goal
          {!editing && (
            <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={() => { setInputVal(String(goal || "")); setEditing(true); }}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="e.g. 2000"
              className="h-9"
              autoFocus
            />
            <Button size="icon" className="h-9 w-9 flex-shrink-0" onClick={handleSave} disabled={saveGoal.isPending}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : goal === 0 ? (
          <button
            onClick={() => setEditing(true)}
            className="w-full text-center py-4 border-2 border-dashed border-primary/30 rounded-xl text-sm text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
          >
            + Set a monthly earnings goal
          </button>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold">${mtdEarnings.toFixed(0)}</span>
                <span className="text-muted-foreground text-sm ml-1">/ ${goal} goal</span>
              </div>
              {trajectory && (
                <Badge variant="secondary" className={`gap-1 ${trajectory.color}`}>
                  <trajectory.icon className="h-3 w-3" />
                  {trajectory.label}
                </Badge>
              )}
            </div>
            <Progress value={progress} className="h-2.5" />
            <p className="text-xs text-muted-foreground">
              {progress >= 100
                ? "🎉 Goal reached this month — amazing work!"
                : `$${(goal - mtdEarnings).toFixed(0)} remaining to reach your goal`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
