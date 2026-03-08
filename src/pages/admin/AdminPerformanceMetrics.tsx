import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const TIER_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  platinum: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Platinum' },
  gold: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Gold' },
  silver: { bg: 'bg-slate-400/10', text: 'text-slate-500', label: 'Silver' },
  bronze: { bg: 'bg-orange-700/10', text: 'text-orange-700', label: 'Bronze' },
};

const rankBg = (i: number) => i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-600' : 'bg-primary/60';

const AdminPerformanceMetrics = () => {
  const { data, isLoading, refetch } = useAdminPerformanceStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary">Analytics</Link>
              <span>/</span><span>Performance Metrics</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Performance Metrics</h1>
            <p className="text-muted-foreground mt-1">Live cleaner reliability scores, ratings, and quality metrics</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : (
            <>
              <Card className="border-t-4 border-t-yellow-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                      <div className="flex items-center gap-1">
                        <p className="text-2xl font-bold">{(data?.avgRating || 0).toFixed(2)}</p>
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">From {data?.reviewCount || 0} reviews</p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Top Cleaners</p>
                      <p className="text-2xl font-bold">{data?.topPerformersCount || 0}</p>
                      <p className="text-sm text-muted-foreground mt-1">Rating ≥ 4.8</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Reliability</p>
                      <p className="text-2xl font-bold">{data?.avgReliability || 0}%</p>
                      <p className="text-sm text-muted-foreground mt-1">Platform average</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reviews</p>
                      <p className="text-2xl font-bold">{data?.reviewCount || 0}</p>
                      <p className="text-sm text-muted-foreground mt-1">All time</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" />Rating Distribution</CardTitle>
              <CardDescription>Breakdown of all customer ratings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px]" /> : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={data?.ratingDistribution || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="rating" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Platform Quality Overview</CardTitle>
              <CardDescription>Calculated from cleaner_metrics table</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[300px]" /> : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <RadarChart data={data?.performanceMetrics || []} cx="50%" cy="50%" outerRadius="80%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.3)" fillOpacity={0.6} />
                  </RadarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-yellow-500" />
              Top 10 Cleaner Leaderboard
            </CardTitle>
            <CardDescription>Ranked by average rating — real-time data</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64" /> : (
              <div className="space-y-2">
                {/* Header row */}
                <div className="grid grid-cols-12 text-xs text-muted-foreground px-4 pb-1">
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
                    return (
                      <div key={cleaner.id} className={`grid grid-cols-12 items-center p-3 rounded-xl transition-colors ${index < 3 ? 'bg-primary/5 border border-primary/10' : 'bg-muted/40 hover:bg-muted'}`}>
                        {/* Rank */}
                        <div className="col-span-1">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-white text-xs ${rankBg(index)}`}>
                            {index + 1}
                          </div>
                        </div>
                        {/* Name */}
                        <div className="col-span-4">
                          <p className="font-semibold text-sm">{cleaner.name || 'Unknown'}</p>
                        </div>
                        {/* Tier */}
                        <div className="col-span-2 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ts.bg} ${ts.text}`}>
                            {ts.label}
                          </span>
                        </div>
                        {/* Jobs */}
                        <div className="col-span-2 text-center text-sm font-medium">{cleaner.jobs}</div>
                        {/* Rating */}
                        <div className="col-span-1 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold">{cleaner.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        {/* Reliability */}
                        <div className="col-span-2 flex flex-col items-end gap-1">
                          <span className="text-xs font-medium">{cleaner.reliability}%</span>
                          <Progress value={cleaner.reliability} className="h-1.5 w-16" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link to="/admin/analytics">← Back to Analytics</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPerformanceMetrics;
