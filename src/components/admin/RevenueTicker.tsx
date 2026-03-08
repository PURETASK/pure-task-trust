import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

function Ticker({ label, value, change, live }: { label: string; value: number; change: number; live?: boolean }) {
  const up = change >= 0;
  return (
    <div className="flex flex-col items-center min-w-[140px]">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        {live && <span className="relative flex h-1.5 w-1.5 mr-0.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" /></span>}
        {label}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="text-xl font-bold tabular-nums"
        >
          {value.toLocaleString()} cr
        </motion.div>
      </AnimatePresence>
      <div className={`flex items-center gap-0.5 text-xs mt-0.5 ${up ? "text-success" : "text-destructive"}`}>
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {up ? "+" : ""}{change}% vs prior
      </div>
    </div>
  );
}

export function RevenueTicker() {
  const [liveRevenue, setLiveRevenue] = useState(0);

  const { data } = useQuery({
    queryKey: ["revenue-ticker"],
    queryFn: async () => {
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const weekStart = startOfWeek(now).toISOString();
      const monthStart = startOfMonth(now).toISOString();
      const prevDayStart = startOfDay(subDays(now, 1)).toISOString();
      const prevWeekStart = startOfWeek(subWeeks(now, 1)).toISOString();
      const prevMonthStart = startOfMonth(subMonths(now, 1)).toISOString();

      const [today, prevDay, week, prevWeek, month, prevMonth] = await Promise.all([
        supabase.from("cleaner_earnings").select("platform_fee_credits").gte("created_at", todayStart),
        supabase.from("cleaner_earnings").select("platform_fee_credits").gte("created_at", prevDayStart).lt("created_at", todayStart),
        supabase.from("cleaner_earnings").select("platform_fee_credits").gte("created_at", weekStart),
        supabase.from("cleaner_earnings").select("platform_fee_credits").gte("created_at", prevWeekStart).lt("created_at", weekStart),
        supabase.from("cleaner_earnings").select("platform_fee_credits").gte("created_at", monthStart),
        supabase.from("cleaner_earnings").select("platform_fee_credits").gte("created_at", prevMonthStart).lt("created_at", monthStart),
      ]);

      const sum = (rows: any[] | null) => (rows || []).reduce((s, r) => s + (r.platform_fee_credits || 0), 0);
      const pct = (cur: number, prev: number) => prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 100);

      const todayVal = sum(today.data);
      const weekVal = sum(week.data);
      const monthVal = sum(month.data);
      setLiveRevenue(todayVal);

      return {
        today: todayVal,
        todayChange: pct(todayVal, sum(prevDay.data)),
        week: weekVal,
        weekChange: pct(weekVal, sum(prevWeek.data)),
        month: monthVal,
        monthChange: pct(monthVal, sum(prevMonth.data)),
      };
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // Realtime: listen for new cleaner_earnings inserts
  useEffect(() => {
    const channel = supabase
      .channel("revenue-ticker-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "cleaner_earnings" }, (payload) => {
        setLiveRevenue((prev) => prev + ((payload.new as any).platform_fee_credits || 0));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl mb-6 overflow-x-auto">
      <div className="flex items-center gap-2 mr-4 flex-shrink-0">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Live Revenue</span>
      </div>
      <div className="flex items-center gap-6 divide-x divide-border/50">
        <Ticker label="Today" value={liveRevenue || data?.today || 0} change={data?.todayChange || 0} live />
        <div className="pl-6"><Ticker label="This Week" value={data?.week || 0} change={data?.weekChange || 0} /></div>
        <div className="pl-6"><Ticker label="Month to Date" value={data?.month || 0} change={data?.monthChange || 0} /></div>
      </div>
    </div>
  );
}
