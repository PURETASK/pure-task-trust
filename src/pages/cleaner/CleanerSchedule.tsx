import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, MapPin, Clock, Settings, DollarSign, Briefcase, Search, Zap, Calendar } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, isSameDay, differenceInHours } from "date-fns";
import { useCleanerJobs } from "@/hooks/useCleanerProfile";
import { useCleanerProfile } from "@/hooks/useCleanerProfile";
import scheduleBg from "@/assets/availability-bg.png";

const TIER_FEE: Record<string, number> = {
  platinum: 0.15,
  gold: 0.16,
  silver: 0.18,
  bronze: 0.20,
};

export default function CleanerSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"2weeks" | "month">("2weeks");
  
  const { jobs, isLoading } = useCleanerJobs();
  const { profile } = useCleanerProfile();
  const tier = profile?.tier || "bronze";
  const feeRate = TIER_FEE[tier] ?? 0.20;
  const getNet = (gross: number) => Math.round(gross * (1 - feeRate));

  const generateTwoWeeksCalendar = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = [];
    for (let i = 0; i < 14; i++) days.push(addDays(start, i));
    return days;
  };

  const generateMonthCalendar = () => {
    const start = startOfMonth(currentDate);
    const firstDayOfWeek = getDay(start);
    const daysInMonth = getDaysInMonth(currentDate);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    return days;
  };

  const navigateCalendar = (direction: "prev" | "next") => {
    if (viewMode === "2weeks") {
      setCurrentDate(direction === "next" ? addWeeks(currentDate, 2) : addWeeks(currentDate, -2));
    } else {
      setCurrentDate(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    }
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  const getJobsForDate = (date: Date) =>
    jobs.filter(job => job.scheduled_start_at && isSameDay(new Date(job.scheduled_start_at), date));

  const hasJobs = (date: Date) => getJobsForDate(date).length > 0;

  const selectedDateJobs = useMemo(() => getJobsForDate(selectedDate), [selectedDate, jobs]);
  const pendingJobs = selectedDateJobs.filter(j => j.status === 'pending' || j.status === 'created');
  const acceptedJobs = selectedDateJobs.filter(j => j.status === 'confirmed' || j.status === 'in_progress');

  // ── Daily earnings summary ───────────────────────────────────────────────
  const dailyGross = selectedDateJobs.reduce((sum, j) => sum + (j.escrow_credits_reserved || 0), 0);
  const dailyNet = getNet(dailyGross);
  const dailyHours = selectedDateJobs.reduce((sum, j) => sum + (j.estimated_hours || 2), 0);

  // ── Gap detection ─────────────────────────────────────────────────────────
  // Find ≥2 hour gaps between consecutive accepted jobs on selected date
  const gaps = useMemo(() => {
    const sorted = [...acceptedJobs]
      .filter(j => j.scheduled_start_at)
      .sort((a, b) => new Date(a.scheduled_start_at!).getTime() - new Date(b.scheduled_start_at!).getTime());
    const result: Array<{ gapStart: Date; gapEnd: Date; gapHours: number }> = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const jobEnd = new Date(sorted[i].scheduled_start_at!);
      jobEnd.setHours(jobEnd.getHours() + (sorted[i].estimated_hours || 2));
      const nextStart = new Date(sorted[i + 1].scheduled_start_at!);
      const gapHours = differenceInHours(nextStart, jobEnd);
      if (gapHours >= 2) {
        result.push({ gapStart: jobEnd, gapEnd: nextStart, gapHours });
      }
    }
    return result;
  }, [acceptedJobs]);

  const twoWeeksDays = generateTwoWeeksCalendar();
  const monthDays = generateMonthCalendar();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': case 'created': return <Badge variant="warning">Pending</Badge>;
      case 'confirmed': return <Badge variant="default">Confirmed</Badge>;
      case 'in_progress': return <Badge className="bg-primary/80 text-primary-foreground">In Progress</Badge>;
      case 'completed': return <Badge variant="success">Completed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <CleanerLayout>
      <Helmet><title>My Schedule | PureTask</title></Helmet>
      {/* Oversized transparent calendar background */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 flex items-center justify-center overflow-hidden">
        <img
          src={scheduleBg}
          alt=""
          loading="lazy"
          width={1024}
          height={1024}
          className="w-[135vmin] h-[135vmin] object-contain opacity-15 -translate-x-[15%]"
          aria-hidden="true"
        />
      </div>
      <div className="space-y-6 relative z-10">

        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/50 bg-gradient-to-br from-primary/25 via-background to-success/15 p-7">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-success/20 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-4">
              <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25 p-3">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">My Schedule</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Your upcoming jobs and availability at a glance</p>
              </div>
            </div>
            <Button variant="outline" asChild className="rounded-xl border-2 border-primary/40 hover:border-primary/70">
              <Link to="/cleaner/availability">
                <Settings className="h-4 w-4 mr-2" />
                Manage Availability
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Quick Stats Strip ─────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Today's Jobs",    value: getJobsForDate(new Date()).length,                           icon: Briefcase, border: "border-primary/50",                          bg: "bg-primary/20",                          icon_c: "text-primary",   icon_bg: "bg-primary/30" },
            { label: "This Week",       value: twoWeeksDays.slice(0,7).filter(d => hasJobs(d)).length,      icon: Calendar,  border: "border-success/50",                          bg: "bg-success/20",                          icon_c: "text-success",   icon_bg: "bg-success/30" },
            { label: "Pending Offers",  value: jobs.filter(j => j.status === 'pending' || j.status === 'created').length, icon: Clock, border: "border-warning/50",             bg: "bg-warning/20",                          icon_c: "text-warning",   icon_bg: "bg-warning/30" },
            { label: "Confirmed",       value: jobs.filter(j => j.status === 'confirmed').length,           icon: DollarSign, border: "border-[hsl(280,70%,55%)]/50",             bg: "bg-[hsl(280,70%,55%)]/20",               icon_c: "text-[hsl(280,70%,55%)]", icon_bg: "bg-[hsl(280,70%,55%)]/30" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border-2 ${s.border} ${s.bg} p-4 flex items-center gap-3`}>
              <div className={`h-10 w-10 rounded-xl ${s.icon_bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`h-5 w-5 ${s.icon_c}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Card */}
        <Card className="border-2 border-primary/30 rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4 bg-primary/15 border-b border-primary/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              {viewMode === "month" && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => navigateCalendar("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-24 text-center">{format(currentDate, "MMMM yyyy")}</span>
                  <Button variant="ghost" size="icon" onClick={() => navigateCalendar("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "2weeks" | "month")}>
                <TabsList className="h-9">
                  <TabsTrigger value="2weeks" className="text-xs px-3">2 Weeks</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs px-3">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "2weeks" && (
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={() => navigateCalendar("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {format(twoWeeksDays[0], "MMM d")} – {format(twoWeeksDays[13], "MMM d, yyyy")}
                </span>
                <Button variant="ghost" size="icon" onClick={() => navigateCalendar("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Week Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm text-muted-foreground py-2">{day}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            {viewMode === "2weeks" ? (
              <div className="grid grid-cols-7 gap-2">
                {twoWeeksDays.map((date, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg border transition-all relative
                      ${isToday(date) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                      ${isSelected(date) && !isToday(date) ? "border-primary" : "border-border"}
                    `}
                  >
                    <span className="text-xs text-muted-foreground">{format(date, "EEE")}</span>
                    <span className="text-lg font-semibold">{format(date, "d")}</span>
                    {hasJobs(date) && (
                      <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-success" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((date, i) => (
                  <div key={i} className="aspect-square">
                    {date ? (
                      <button
                        onClick={() => setSelectedDate(date)}
                        className={`w-full h-full flex items-center justify-center rounded-lg border transition-all relative
                          ${isToday(date) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                          ${isSelected(date) && !isToday(date) ? "border-primary" : "border-border"}
                        `}
                      >
                        <span className="text-sm font-medium">{format(date, "d")}</span>
                        {hasJobs(date) && (
                          <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-success" />
                        )}
                      </button>
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Date Summary */}
        <Card className="border-2 border-[hsl(280,70%,55%)]/40 rounded-2xl bg-[hsl(280,70%,55%)]/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-[hsl(280,70%,55%)]/15 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[hsl(280,70%,55%)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-0.5">
                    {format(selectedDate, "EEEE, MMMM d")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {pendingJobs.length} request{pendingJobs.length !== 1 ? 's' : ''} · {acceptedJobs.length} accepted
                  </p>
                </div>
              </div>
              {selectedDateJobs.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-warning/10 border border-warning/30">
                    <Clock className="h-4 w-4 text-warning" />
                    <span className="font-medium text-warning">{dailyHours}h scheduled</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl bg-success/10 border border-success/30">
                    <DollarSign className="h-4 w-4 text-success" />
                    <span className="font-semibold text-success">${dailyNet} projected</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Lists */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-warning">
              <Clock className="h-4 w-4" />
              Job Requests
            </h3>
            {isLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : pendingJobs.length === 0 ? (
              <Card className="border-2 border-warning/20 rounded-2xl">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No job requests for this day.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-elevated transition-all border-2 border-warning/30 rounded-2xl bg-warning/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {job.cleaning_type === 'deep' ? 'Deep Clean' : 
                             job.cleaning_type === 'move_out' ? 'Move-out Clean' : 'Standard Clean'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Client {job.client?.first_name ? `${job.client.first_name.charAt(0)}.` : '(Private)'}
                          </p>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'h:mm a') : 'TBD'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.estimated_hours || 2}h
                          </span>
                          {(job.escrow_credits_reserved || 0) > 0 && (
                            <span className="flex items-center gap-1 text-success font-medium">
                              <DollarSign className="h-3 w-3" />
                              {getNet(job.escrow_credits_reserved || 0)}
                            </span>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/cleaner/jobs/${job.id}`}>View</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-success">
              <Briefcase className="h-4 w-4" />
              Accepted Jobs
            </h3>
            {isLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : acceptedJobs.length === 0 ? (
              <Card className="border-2 border-success/20 rounded-2xl">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No accepted jobs for this day.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {acceptedJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-elevated transition-all border-2 border-success/30 rounded-2xl bg-success/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {job.cleaning_type === 'deep' ? 'Deep Clean' : 
                             job.cleaning_type === 'move_out' ? 'Move-out Clean' : 'Standard Clean'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Client {job.client?.first_name ? `${job.client.first_name.charAt(0)}.` : '(Private)'}
                          </p>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'h:mm a') : 'TBD'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.estimated_hours || 2}h
                          </span>
                          {(job.escrow_credits_reserved || 0) > 0 && (
                            <span className="flex items-center gap-1 text-success font-medium">
                              <DollarSign className="h-3 w-3" />
                              {getNet(job.escrow_credits_reserved || 0)}
                            </span>
                          )}
                        </div>
                        <Button variant="default" size="sm" asChild>
                          <Link to={`/cleaner/jobs/${job.id}`}>Start Job</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Gap Filler */}
        {gaps.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4" />
              Free Time Gaps — Fill Your Schedule
            </h3>
            {gaps.map((gap, i) => (
              <Card key={i} className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {gap.gapHours}h gap — {format(gap.gapStart, "h:mm a")} to {format(gap.gapEnd, "h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground">You could fit a job in this window</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 flex-shrink-0" asChild>
                    <Link to="/cleaner/marketplace">
                      <Search className="h-3.5 w-3.5" />
                      Find Jobs
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CleanerLayout>
  );
}
