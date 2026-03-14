
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Calendar, MessageCircle, Play, Eye, ArrowRight, DollarSign, ArrowUpDown, Briefcase, CheckCircle, Flame } from "lucide-react";
import { format } from "date-fns";
import { useCleanerJobs, useCleanerProfile } from "@/hooks/useCleanerProfile";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type SortKey = "date_asc" | "date_desc" | "earnings_desc";

const TIER_FEE: Record<string, number> = { platinum: 0.15, gold: 0.16, silver: 0.18, bronze: 0.20 };

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-warning", bg: "bg-warning/10" },
  created: { label: "New", color: "text-primary", bg: "bg-primary/10" },
  confirmed: { label: "Confirmed", color: "text-success", bg: "bg-success/10" },
  on_way: { label: "On the Way", color: "text-blue-500", bg: "bg-blue-500/10" },
  arrived: { label: "Arrived", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  in_progress: { label: "In Progress", color: "text-primary", bg: "bg-primary/10" },
  completed: { label: "Completed", color: "text-success", bg: "bg-success/10" },
};

export default function CleanerJobs() {
  const { jobs, isLoading } = useCleanerJobs();
  const { profile } = useCleanerProfile();
  const [sort, setSort] = useState<SortKey>("date_asc");

  const tier = profile?.tier || "bronze";
  const feeRate = TIER_FEE[tier] ?? 0.20;
  const getNet = (gross: number) => Math.round(gross * (1 - feeRate));

  const activeJobs = jobs.filter(j => ['confirmed', 'in_progress', 'on_way', 'arrived'].includes(j.status));
  const pendingJobs = jobs.filter(j => ['pending', 'created'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');

  const sortJobs = (list: typeof jobs) => [...list].sort((a, b) => {
    if (sort === "date_asc") return new Date(a.scheduled_start_at || 0).getTime() - new Date(b.scheduled_start_at || 0).getTime();
    if (sort === "date_desc") return new Date(b.scheduled_start_at || 0).getTime() - new Date(a.scheduled_start_at || 0).getTime();
    return (b.escrow_credits_reserved || 0) - (a.escrow_credits_reserved || 0);
  });

  const getCleaningLabel = (type: string) => ({ deep: "Deep Clean", move_out: "Move-out Clean" }[type] || "Standard Clean");

  const JobCard = ({ job, index }: { job: typeof jobs[0]; index: number }) => {
    const gross = job.escrow_credits_reserved || 0;
    const net = getNet(gross);
    const status = STATUS_CONFIG[job.status] || { label: job.status, color: "text-muted-foreground", bg: "bg-muted" };
    const isActive = ['confirmed', 'in_progress', 'on_way', 'arrived'].includes(job.status);

    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
        <Card className={`overflow-hidden hover:shadow-elevated transition-all duration-300 border-border/60 ${isActive ? 'ring-1 ring-primary/20' : ''}`}>
          <CardContent className="p-0">
            <div className="flex items-stretch">
              <div className={`w-1.5 flex-shrink-0 ${isActive ? 'bg-gradient-to-b from-primary to-violet-600' : job.status === 'completed' ? 'bg-success' : 'bg-muted-foreground/30'}`} />
              <div className="flex-1 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold">{getCleaningLabel(job.cleaning_type)}</h3>
                      <Badge className={`${status.bg} ${status.color} border-0 text-xs`}>{status.label}</Badge>
                      {isActive && <Flame className="h-4 w-4 text-orange-500 animate-pulse" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Client {job.client?.first_name ? `${job.client.first_name.charAt(0)}.` : '(Private)'}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'MMM d') : 'TBD'}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'h:mm a') : 'TBD'}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.estimated_hours || 2}h</span>
                      {net > 0 && <span className="flex items-center gap-1 font-bold text-success"><DollarSign className="h-3.5 w-3.5" />{net} you earn</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild className="h-9 w-9">
                      <Link to={`/cleaner/messages?job=${job.id}`}><MessageCircle className="h-4 w-4" /></Link>
                    </Button>
                    {job.status === 'confirmed' && (
                      <Button size="sm" asChild className="gap-1.5 bg-gradient-to-r from-primary to-primary/80">
                        <Link to={`/cleaner/jobs/${job.id}`}><Play className="h-3.5 w-3.5" />Start</Link>
                      </Button>
                    )}
                    {job.status === 'in_progress' && (
                      <Button size="sm" asChild className="gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600">
                        <Link to={`/cleaner/jobs/${job.id}`}><ArrowRight className="h-3.5 w-3.5" />Continue</Link>
                      </Button>
                    )}
                    {!['confirmed', 'in_progress'].includes(job.status) && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/cleaner/jobs/${job.id}`}><Eye className="h-3.5 w-3.5 mr-1.5" />View</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const EmptyState = ({ message, link }: { message: string; link?: string }) => (
    <Card className="border-dashed border-2">
      <CardContent className="py-12 text-center">
        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">{message}</p>
        {link && <Button variant="link" asChild className="mt-2"><Link to={link}>Browse marketplace →</Link></Button>}
      </CardContent>
    </Card>
  );

  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Jobs</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage and track your bookings</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-2 text-xs sm:text-sm">
              <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-success/10 text-success font-medium"><CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />{completedJobs.length} done</span>
              <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10 text-primary font-medium"><Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" />{activeJobs.length} active</span>
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-36 sm:w-44 h-9 text-xs sm:text-sm rounded-xl">
                <ArrowUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_asc">Earliest first</SelectItem>
                <SelectItem value="date_desc">Latest first</SelectItem>
                <SelectItem value="earnings_desc">Highest earnings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="rounded-xl w-full sm:w-auto">
            <TabsTrigger value="active" className="flex-1 sm:flex-none text-xs sm:text-sm">Active ({activeJobs.length})</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 sm:flex-none text-xs sm:text-sm">Pending ({pendingJobs.length})</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 sm:flex-none text-xs sm:text-sm">Done ({completedJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {isLoading ? <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
            : activeJobs.length === 0 ? <EmptyState message="No active jobs" link="/cleaner/marketplace" />
            : <div className="space-y-3">{sortJobs(activeJobs).map((job, i) => <JobCard key={job.id} job={job} index={i} />)}</div>}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {isLoading ? <Skeleton className="h-28 rounded-2xl" />
            : pendingJobs.length === 0 ? <EmptyState message="No pending jobs" />
            : <div className="space-y-3">{sortJobs(pendingJobs).map((job, i) => <JobCard key={job.id} job={job} index={i} />)}</div>}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {isLoading ? <Skeleton className="h-28 rounded-2xl" />
            : completedJobs.length === 0 ? <EmptyState message="No completed jobs yet" />
            : <div className="space-y-3">{sortJobs(completedJobs).map((job, i) => <JobCard key={job.id} job={job} index={i} />)}</div>}
          </TabsContent>
        </Tabs>
      </div>
    </CleanerLayout>
  );
}
