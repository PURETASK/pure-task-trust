import { Helmet } from "react-helmet-async";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { useEarningsForecasting } from "@/hooks/useEarningsForecasting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, DollarSign, Target, Lightbulb, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function CleanerEarningsForecast() {
  const { data: forecast, isLoading } = useEarningsForecasting();

  const trendIcon = forecast?.trend === 'up' ? TrendingUp : forecast?.trend === 'down' ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendColor = forecast?.trend === 'up' ? 'text-success' : forecast?.trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  const chartData = forecast ? [
    ...forecast.monthlyHistory.map(m => ({ ...m, type: 'actual' })),
    { month: 'Next Month', earned: forecast.predictedNextMonth, type: 'predicted' },
  ] : [];

  return (
    <main className="flex-1 bg-background min-h-screen">
      <Helmet><title>Earnings Forecast | PureTask</title></Helmet>
      <CleanerLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">📊 Earnings Forecast</h1>
            <p className="text-muted-foreground">AI-powered predictions based on your history and availability</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
          ) : forecast ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Predicted Next Month</p>
                        <p className="text-2xl font-bold">${forecast.predictedNextMonth}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {forecast.confidence} confidence
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Next 3 Months</p>
                        <p className="text-2xl font-bold">${forecast.predictedNext3Months}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center`}>
                        <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Trend</p>
                        <p className="text-2xl font-bold capitalize">{forecast.trend}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" /> Monthly Earnings & Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                          formatter={(value: number) => [`$${value}`, 'Earned']}
                        />
                        <Bar
                          dataKey="earned"
                          fill="hsl(var(--primary))"
                          radius={[6, 6, 0, 0]}
                          opacity={0.85}
                        />
                        <ReferenceLine
                          y={forecast.predictedNextMonth}
                          stroke="hsl(var(--primary))"
                          strokeDasharray="5 5"
                          label={{ value: 'Forecast', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              {forecast.insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-warning" /> AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {forecast.insights.map((insight, i) => (
                        <p key={i} className="text-sm text-muted-foreground">{insight}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </div>
      </CleanerLayout>
    </main>
  );
}
