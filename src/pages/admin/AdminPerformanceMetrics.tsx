import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Award, TrendingUp, Clock, CheckCircle, Medal, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useAdminPerformanceStats } from "@/hooks/useAdminStats";

const chartConfig = {
  count: { label: "Count", color: "hsl(var(--primary))" },
  value: { label: "Score", color: "hsl(var(--chart-1))" },
};

const TIER_STYLES: Record<string, { badge: string; text: string }> = {
  platinum: { badge: 'bg-primary/10 border border-primary/20', text: 'text-primary' },
  gold: { badge: 'bg-warning/10 border border-warning/20', text: 'text-warning' },
  silver: { badge: 'bg-muted border border-border', text: 'text-muted-foreground' },
  bronze: { badge: 'bg-[hsl(25,80%,50%/0.1)] border border-[hsl(25,80%,50%/0.2)]', text: 'text-[hsl(25,80%,40%)]' },
};

const RANK_STYLES = ['bg-warning text-white', 'bg-muted-foreground text-white', 'text-white bg-[hsl(25,80%,50%)]'];

const AdminPerformanceMetrics = () => {
  const { data, isLoading, refetch } = useAdminPerformanceStats();

  const KPI_CARDS = [
    { label: 'Avg Rating', value: `${(data?.avgRating || 0).toFixed(2)} ★`, sublabel: `From ${data?.reviewCount || 0} reviews`, icon: Star, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/25' },
    { label: 'Top Cleaners', value: data?.topPerformersCount || 0, sublabel: 'Rating ≥ 4.8', icon: Award, color: 'text-[hsl(var(--pt-purple))]', bg: 'bg-[hsl(var(--pt-purple)/0.1)]', border: 'border-[hsl(var(--pt-purple)/0.25)]' },
    { label: 'Avg Reliability', value: `${data?.avgReliability || 0}%`, sublabel: 'Platform average', icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', border: 'border-success/25' },
    { label: 'Total Reviews', value: data?.reviewCount || 0, sublabel: 'All time', icon: Clock, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/25' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary transition-colors">Analytics</Link>
              <span>/</span><span>Performance Metrics</span>
            </div>
            <h1 className="text-3xl font-bold">Performance Metrics</h1>
            <p className="text-muted-foreground mt-1">Live cleaner reliability scores, ratings, and quality metrics</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh
          </Button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : KPI_CARDS.map(({ label, value, sublabel, icon: Icon, color, bg, border }) => (
            <motion.div key={label} whileHover={{ y: -2 }}>
              <Card className={`border ${border} hover:shadow-elevated transition-all`}>
                <CardContent className="p-5">
                  <div className={`h-11 w-11 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-poppins font-bold">{value}</p>
                  <p className="text-xs font-medium text-foreground mt-1">{label}</p>
                  <p className="text-xs text-muted-foreground">{sublabel}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-5 w-5 text-warning" />Rating Distribution
              </CardTitle>
              <CardDescription>Breakdown of all customer ratings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[280px]" /> : (
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <BarChart data={data?.ratingDistribution || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="rating" type="category" width={80} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary" />Platform Quality Overview
              </CardTitle>
              <CardDescription>Aggregated from cleaner metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[280px]" /> : (
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <RadarChart data={data?.performanceMetrics || []} cx="50%" cy="50%" outerRadius="80%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-warning" />Top 10 Cleaner Leaderboard
            </CardTitle>
            <CardDescription>Ranked by average rating — real-time data</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64" /> : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 text-xs text-muted-foreground px-4 pb-2">
                  <span className="col-span-1">#</span>
                  <span className="col-span-4">Cleaner</span>
                  <span className="col-span-2 text-center">Tier</span>
                  <span className="col-span-2 text-center">Jobs</span>
                  <span className="col-span-1 text-center">Rating</span>
                  <span className="col-span-2 text-right">Reliability</span>
                </div>
                {(data?.topPerformers || []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No review data yet</p>
                ) : (
                  data?.topPerformers.map((cleaner, index) => {
                    const ts = TIER_STYLES[cleaner.tier] || TIER_STYLES.bronze;
                    const rankStyle = RANK_STYLES[index] || 'bg-muted text-muted-foreground';
                    return (
                      <motion.div key={cleaner.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
                        className={`grid grid-cols-12 items-center p-3 rounded-xl transition-colors ${index < 3 ? 'bg-primary/5 border border-primary/10' : 'bg-muted/30 hover:bg-muted/50'}`}>
                        <div className="col-span-1">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${rankStyle}`}>{index + 1}</div>
                        </div>
                        <div className="col-span-4">
                          <p className="font-semibold text-sm">{cleaner.name || 'Unknown'}</p>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ts.badge} ${ts.text}`}>{cleaner.tier}</span>
                        </div>
                        <div className="col-span-2 text-center text-sm font-medium">{cleaner.jobs}</div>
                        <div className="col-span-1 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            <span className="text-sm font-bold">{cleaner.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="col-span-2 flex flex-col items-end gap-1">
                          <span className="text-xs font-medium">{cleaner.reliability}%</span>
                          <Progress value={cleaner.reliability} className="h-1.5 w-16" />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button variant="outline" asChild><Link to="/admin/analytics">← Back to Analytics</Link></Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPerformanceMetrics;
