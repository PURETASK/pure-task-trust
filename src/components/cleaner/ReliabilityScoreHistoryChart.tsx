import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Dot
} from "recharts";
import { format, subDays } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface HistoryEntry {
  id: string;
  cleaner_id: string;
  old_score: number;
  new_score: number;
  new_tier: string | null;
  reason: string | null;
  created_at: string;
}

interface ChartPoint {
  date: string;
  dateLabel: string;
  score: number;
  event?: string;
  tier?: string;
  isPromotion?: boolean;
  isDemotion?: boolean;
  isNoShow?: boolean;
}

const TIER_COLORS = {
  platinum: "hsl(var(--pt-purple))",
  gold:     "hsl(var(--warning))",
  silver:   "hsl(var(--muted-foreground))",
  bronze:   "hsl(36 100% 50%)",
};

const EVENT_ICONS: Record<string, string> = {
  nightly_recalculation: "📊",
  tier_promotion:        "🎉",
  tier_demotion:         "⬇️",
  no_show:               "❌",
  cancellation:          "📋",
  dispute_lost:          "⚠️",
};

function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload?.event) return null;

  const isPositive = payload.isPromotion;
  const isNegative = payload.isDemotion || payload.isNoShow;
  const color = isPositive ? "hsl(var(--success))" : isNegative ? "hsl(var(--destructive))" : "hsl(var(--primary))";

  return (
    <circle
      cx={cx} cy={cy} r={5}
      fill={color}
      stroke="hsl(var(--background))"
      strokeWidth={2}
    />
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload as ChartPoint;

  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-elevated text-sm min-w-[160px]">
      <p className="font-semibold text-foreground mb-1">{data.dateLabel}</p>
      <p className="text-2xl font-black text-foreground mb-1">{data.score}</p>
      <p className="text-xs text-muted-foreground capitalize">
        {data.tier || "—"} tier
      </p>
      {data.event && (
        <p className="text-xs mt-2 pt-2 border-t border-border">
          {EVENT_ICONS[data.event] || "📌"} {data.event.replace(/_/g, " ")}
        </p>
      )}
    </div>
  );
}

export function ReliabilityScoreHistoryChart() {
  const { profile } = useCleanerProfile();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      const since = subDays(new Date(), 90).toISOString();
      const { data, error } = await supabase
        .from("reliability_history")
        .select("*")
        .eq("cleaner_id", profile.id)
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      if (!error && data) setHistory(data as HistoryEntry[]);
      setIsLoading(false);
    };

    fetchHistory();
  }, [profile?.id]);

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  // Build chart data — fill gaps with current score for a continuous line
  const currentScore = profile?.reliability_score ?? 0;

  if (history.length === 0) {
    // No history yet — show a flat line at current score
    const today = new Date();
    const chartData: ChartPoint[] = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      return {
        date: d.toISOString(),
        dateLabel: format(d, "MMM d"),
        score: currentScore,
        tier: profile?.tier || "bronze",
      };
    });

    return <ChartCard data={chartData} currentScore={currentScore} hasHistory={false} />;
  }

  // Build chart points from history entries
  const chartData: ChartPoint[] = history.map((entry) => ({
    date: entry.created_at,
    dateLabel: format(new Date(entry.created_at), "MMM d"),
    score: entry.new_score,
    tier: entry.new_tier || undefined,
    event: entry.reason || undefined,
    isPromotion: entry.new_score > entry.old_score && Math.abs(entry.new_score - entry.old_score) >= 5,
    isDemotion:  entry.new_score < entry.old_score && Math.abs(entry.new_score - entry.old_score) >= 5,
    isNoShow: entry.reason === "no_show",
  }));

  // Add today's current score if last entry is not today
  const lastEntry = chartData[chartData.length - 1];
  const todayStr = format(new Date(), "MMM d");
  if (lastEntry?.dateLabel !== todayStr) {
    chartData.push({
      date: new Date().toISOString(),
      dateLabel: todayStr,
      score: currentScore,
      tier: profile?.tier || "bronze",
    });
  }

  // Score delta vs 30 days ago
  const thirtyDaysAgo = history.filter(h => {
    const d = new Date(h.created_at);
    return d >= subDays(new Date(), 30);
  });
  const firstScore = thirtyDaysAgo[0]?.old_score ?? currentScore;
  const scoreDelta = currentScore - firstScore;

  return <ChartCard data={chartData} currentScore={currentScore} scoreDelta={scoreDelta} hasHistory={true} />;
}

function ChartCard({
  data,
  currentScore,
  scoreDelta,
  hasHistory,
}: {
  data: ChartPoint[];
  currentScore: number;
  scoreDelta?: number;
  hasHistory: boolean;
}) {
  const DeltaIcon = !scoreDelta || scoreDelta === 0 ? Minus : scoreDelta > 0 ? TrendingUp : TrendingDown;
  const deltaColor = !scoreDelta || scoreDelta === 0 ? "text-muted-foreground" : scoreDelta > 0 ? "text-success" : "text-destructive";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Score History (90 Days)
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasHistory && scoreDelta !== undefined && (
                <Badge
                  variant="outline"
                  className={`gap-1 text-xs ${deltaColor} border-current`}
                >
                  <DeltaIcon className="h-3 w-3" />
                  {scoreDelta > 0 ? "+" : ""}{scoreDelta} pts (30d)
                </Badge>
              )}
              {!hasHistory && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Complete jobs to build history
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 pb-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              {/* Tier zone backgrounds */}
              <ReferenceArea y1={90}  y2={100} fill="hsl(var(--pt-purple)/0.06)" />
              <ReferenceArea y1={70}  y2={90}  fill="hsl(var(--warning)/0.06)"  />
              <ReferenceArea y1={50}  y2={70}  fill="hsl(var(--muted)/0.5)"     />
              <ReferenceArea y1={0}   y2={50}  fill="hsl(36 100% 50%/0.05)"    />

              {/* Tier boundary lines */}
              <ReferenceLine y={90} stroke="hsl(var(--pt-purple)/0.4)" strokeDasharray="3 3"
                label={{ value: "Plat", position: "insideTopRight", fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <ReferenceLine y={70} stroke="hsl(var(--warning)/0.4)" strokeDasharray="3 3"
                label={{ value: "Gold", position: "insideTopRight", fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <ReferenceLine y={50} stroke="hsl(var(--muted-foreground)/0.4)" strokeDasharray="3 3"
                label={{ value: "Silv", position: "insideTopRight", fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />

              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" vertical={false} />

              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                ticks={[0, 50, 70, 90, 100]}
              />

              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={<CustomDot />}
                activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {[
              { color: "hsl(var(--pt-purple))", label: "Platinum (90+)" },
              { color: "hsl(var(--warning))",   label: "Gold (70–89)"   },
              { color: "hsl(var(--muted-foreground))", label: "Silver (50–69)" },
              { color: "hsl(36 100% 50%)",      label: "Bronze (0–49)"  },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="h-2 w-3 rounded-full opacity-60" style={{ backgroundColor: color }} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {hasHistory && (
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Promotion / Score gain</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="text-xs text-muted-foreground">Score drop / No-show</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
