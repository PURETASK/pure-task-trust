import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  Award, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  ThumbsUp,
  Medal
} from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const ratingDistribution = [
  { rating: "5 Stars", count: 245 },
  { rating: "4 Stars", count: 89 },
  { rating: "3 Stars", count: 23 },
  { rating: "2 Stars", count: 8 },
  { rating: "1 Star", count: 3 },
];

const performanceMetrics = [
  { metric: "On-Time", value: 94 },
  { metric: "Quality", value: 92 },
  { metric: "Communication", value: 88 },
  { metric: "Photo Compliance", value: 96 },
  { metric: "Reliability", value: 91 },
  { metric: "Repeat Rate", value: 78 },
];

const topCleaners = [
  { id: 1, name: "Sarah Johnson", rating: 4.98, jobs: 156, reliability: 99, tier: "Elite" },
  { id: 2, name: "Michael Chen", rating: 4.95, jobs: 142, reliability: 98, tier: "Elite" },
  { id: 3, name: "Emily Davis", rating: 4.92, jobs: 128, reliability: 97, tier: "Pro" },
  { id: 4, name: "James Wilson", rating: 4.89, jobs: 118, reliability: 96, tier: "Pro" },
  { id: 5, name: "Lisa Martinez", rating: 4.87, jobs: 105, reliability: 95, tier: "Pro" },
];

const chartConfig = {
  count: { label: "Count", color: "hsl(var(--primary))" },
  value: { label: "Score", color: "hsl(var(--chart-1))" },
};

const AdminPerformanceMetrics = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link to="/admin/analytics" className="hover:text-primary">Analytics</Link>
              <span>/</span>
              <span>Performance Metrics</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Performance Metrics</h1>
            <p className="text-muted-foreground mt-1">
              Cleaner reliability scores, ratings, and quality metrics
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-t-4 border-t-yellow-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold">4.8</p>
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">From 368 reviews</p>
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
                    <p className="text-2xl font-bold">45</p>
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
                    <p className="text-2xl font-bold">91%</p>
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
                    <p className="text-sm text-muted-foreground">On-Time Rate</p>
                    <p className="text-2xl font-bold">94%</p>
                    <p className="text-sm text-muted-foreground mt-1">Check-in punctuality</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Rating Distribution
                </CardTitle>
                <CardDescription>Breakdown of all customer ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={ratingDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="rating" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Performance Overview
                </CardTitle>
                <CardDescription>Platform-wide quality metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <RadarChart data={performanceMetrics} cx="50%" cy="50%" outerRadius="80%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary)/0.3)"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Cleaners */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                Top Performing Cleaners
              </CardTitle>
              <CardDescription>Highest rated cleaners this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCleaners.map((cleaner, index) => (
                  <div key={cleaner.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' : 'bg-primary'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{cleaner.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{cleaner.jobs} jobs</span>
                          <span>•</span>
                          <Badge variant={cleaner.tier === "Elite" ? "default" : "secondary"}>
                            {cleaner.tier}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{cleaner.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                      <div className="w-24">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Reliability</span>
                          <span className="text-xs font-medium">{cleaner.reliability}%</span>
                        </div>
                        <Progress value={cleaner.reliability} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="mt-8">
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">← Back to Analytics</Link>
            </Button>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPerformanceMetrics;
