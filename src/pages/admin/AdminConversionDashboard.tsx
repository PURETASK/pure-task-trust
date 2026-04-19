import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, MousePointerClick, Target, BarChart3, FlaskConical, Mail, ArrowDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/seo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FunnelChart } from "@/components/analytics/FunnelChart";
import { ABTestResults } from "@/components/analytics/ABTestResults";
import { useABTests } from "@/hooks/useABTest";
import { format, subDays } from "date-fns";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface EventCount { event_name: string; count: number; }
interface LeadStats {
  total: number;
  bySource: Record<string, number>;
  recentLeads: Array<{ email: string; source: string; created_at: string }>;
}

export default function AdminConversionDashboard() {
  const [dateRange] = useState(7);

  const { data: eventCounts, isLoading: eventsLoading } = useQuery({
    queryKey: ["admin-event-counts", dateRange],
    queryFn: async (): Promise<EventCount[]> => {
      const startDate = subDays(new Date(), dateRange).toISOString();
      const { data, error } = await supabase.from("analytics_events").select("event_name").gte("created_at", startDate);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const event of data || []) counts[event.event_name] = (counts[event.event_name] || 0) + 1;
      return Object.entries(counts).map(([event_name, count]) => ({ event_name, count })).sort((a, b) => b.count - a.count);
    },
  });

  const { data: leadStats, isLoading: leadsLoading } = useQuery({
    queryKey: ["admin-lead-stats", dateRange],
    queryFn: async (): Promise<LeadStats> => {
      const startDate = subDays(new Date(), dateRange).toISOString();
      const { data, error } = await supabase.from("leads").select("email, source, created_at").gte("created_at", startDate).order("created_at", { ascending: false });
      if (error) throw error;
      const bySource: Record<string, number> = {};
      for (const lead of data || []) { const source = lead.source || "unknown"; bySource[source] = (bySource[source] || 0) + 1; }
      return { total: data?.length || 0, bySource, recentLeads: data?.slice(0, 10) || [] };
    },
  });

  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ["admin-funnel-data", dateRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), dateRange).toISOString();
      const { data, error } = await supabase.from("analytics_events").select("event_name, event_properties")
        .in("event_name", ["funnel_step_started", "funnel_step_completed", "funnel_completed"]).gte("created_at", startDate);
      if (error) throw error;
      const bookingSteps = ["start", "address", "datetime", "cleaner", "payment", "confirm", "complete"];
      const stepCounts: Record<string, number> = {};
      for (const event of data || []) {
        const props = event.event_properties as Record<string, unknown>;
        if (props?.funnel_type === "booking" && props?.step_name) stepCounts[props.step_name as string] = (stepCounts[props.step_name as string] || 0) + 1;
      }
      return { booking: bookingSteps.map((step) => ({ name: step, count: stepCounts[step] || 0 })) };
    },
  });

  const { data: abTests, isLoading: abTestsLoading } = useABTests();

  const pageViews = eventCounts?.find((e) => e.event_name === "page_view")?.count || 0;
  const buttonClicks = eventCounts?.find((e) => e.event_name === "button_click")?.count || 0;
  const conversions = eventCounts?.find((e) => e.event_name === "conversion")?.count || 0;
  const conversionRate = pageViews > 0 ? (conversions / pageViews) * 100 : 0;

  const KPI_CARDS = [
    { label: 'Page Views', value: pageViews.toLocaleString(), icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/25' },
    { label: 'Button Clicks', value: buttonClicks.toLocaleString(), icon: MousePointerClick, color: 'text-[hsl(var(--pt-blue))]', bg: 'bg-[hsl(var(--pt-blue)/0.1)]', border: 'border-[hsl(var(--pt-blue)/0.25)]' },
    { label: 'Conversions', value: conversions.toLocaleString(), icon: Target, color: 'text-success', bg: 'bg-success/10', border: 'border-success/25' },
    { label: 'Conversion Rate', value: `${conversionRate.toFixed(2)}%`, icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/25' },
  ];

  return (
    <main className="min-h-screen bg-background">
      <SEO title="Conversion Dashboard" description="Monitor conversion funnels, A/B tests, and lead capture performance" noIndex />
      <div className="container px-4 py-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/admin/analytics" className="hover:text-primary transition-colors">Analytics</Link>
            <span>/</span><span>Conversion Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold">Conversion Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track user behavior, conversion funnels, and A/B test performance</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {KPI_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
            <motion.div key={label} whileHover={{ y: -2 }}>
              <Card className={`border ${border} hover:shadow-elevated transition-all`}>
                <CardContent className="p-5">
                  <div className={`h-11 w-11 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  {eventsLoading ? <Skeleton className="h-8 w-20 mb-1" /> : <p className="text-2xl font-poppins font-bold">{value}</p>}
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="funnels" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="funnels" className="gap-2"><ArrowDownRight className="h-4 w-4" />Funnels</TabsTrigger>
            <TabsTrigger value="ab-tests" className="gap-2"><FlaskConical className="h-4 w-4" />A/B Tests</TabsTrigger>
            <TabsTrigger value="leads" className="gap-2"><Mail className="h-4 w-4" />Leads</TabsTrigger>
            <TabsTrigger value="events" className="gap-2"><BarChart3 className="h-4 w-4" />Events</TabsTrigger>
          </TabsList>

          <TabsContent value="funnels">
            <Card className="border-border/60">
              <CardHeader><CardTitle className="text-base">Booking Funnel</CardTitle></CardHeader>
              <CardContent>
                {funnelLoading ? <Skeleton className="h-64 w-full" /> : funnelData?.booking
                  ? <FunnelChart steps={funnelData.booking} />
                  : <p className="text-center text-muted-foreground py-8">No funnel data available yet</p>
                }
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ab-tests">
            {abTestsLoading ? (
              <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
            ) : abTests?.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {abTests.map((test) => (
                  <ABTestResults key={test.id} testId={test.id} testName={test.name} variants={test.variants as string[]} />
                ))}
              </div>
            ) : (
              <Card className="border-border/60"><CardContent className="py-8 text-center text-muted-foreground">No A/B tests configured</CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="leads">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-border/60">
                <CardHeader><CardTitle className="text-base">Total Leads</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-poppins font-bold">{leadsLoading ? <Skeleton className="h-9 w-20 inline-block" /> : leadStats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Last {dateRange} days</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 md:col-span-2">
                <CardHeader><CardTitle className="text-base">By Source</CardTitle></CardHeader>
                <CardContent>
                  {leadsLoading ? <Skeleton className="h-20 w-full" /> : (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(leadStats?.bySource || {}).map(([source, count]) => (
                        <Badge key={source} variant="secondary" className="gap-1">{source}: {count}</Badge>
                      ))}
                      {Object.keys(leadStats?.bySource || {}).length === 0 && <p className="text-muted-foreground text-sm">No leads captured yet</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <Card className="mt-6 border-border/60">
              <CardHeader><CardTitle className="text-base">Recent Leads</CardTitle></CardHeader>
              <CardContent>
                {leadsLoading ? <Skeleton className="h-32 w-full" /> : leadStats?.recentLeads.length ? (
                  <div className="space-y-2">
                    {leadStats.recentLeads.map((lead, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                        <div>
                          <p className="font-medium text-sm">{lead.email}</p>
                          <p className="text-xs text-muted-foreground">{lead.source}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{format(new Date(lead.created_at), "MMM d, h:mm a")}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-muted-foreground py-4">No leads captured yet</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="border-border/60">
              <CardHeader><CardTitle className="text-base">Event Counts (Last {dateRange} days)</CardTitle></CardHeader>
              <CardContent>
                {eventsLoading ? <Skeleton className="h-64 w-full" /> : eventCounts?.length ? (
                  <div className="space-y-2">
                    {eventCounts.slice(0, 15).map((event) => (
                      <div key={event.event_name} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                        <span className="font-medium text-sm capitalize">{event.event_name.replace(/_/g, " ")}</span>
                        <Badge variant="secondary">{event.count.toLocaleString()}</Badge>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-muted-foreground py-8">No events recorded yet</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Button variant="outline" asChild><Link to="/admin/analytics">← Back to Analytics</Link></Button>
        </div>
      </div>
    </main>
  );
}
