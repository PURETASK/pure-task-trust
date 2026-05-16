import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft, ChevronRight, Clock, MapPin, DollarSign, Calendar as CalendarIcon,
} from "lucide-react";
import {
  format, addMonths, subMonths, startOfMonth, getDaysInMonth, getDay, isSameDay, isAfter,
} from "date-fns";
import { useCleanerJobs } from "@/hooks/useCleanerProfile";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CleanerMyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { jobs, isLoading } = useCleanerJobs();

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const firstDayOfWeek = getDay(start);
    const daysInMonth = getDaysInMonth(currentDate);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentDate]);

  const getJobsForDate = (date: Date) =>
    jobs.filter(j => j.scheduled_start_at && isSameDay(new Date(j.scheduled_start_at), date));

  const today = new Date();
  const isToday = (d: Date) => isSameDay(d, today);

  const upcomingJobs = useMemo(
    () =>
      jobs
        .filter(j => j.scheduled_start_at && isAfter(new Date(j.scheduled_start_at), new Date(Date.now() - 60 * 60 * 1000)))
        .slice(0, 8),
    [jobs]
  );

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "created":
        return <Badge variant="warning">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-primary/15 text-primary hover:bg-primary/20">Confirmed</Badge>;
      case "in_progress":
        return <Badge className="bg-primary text-primary-foreground">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const cleaningLabel = (t: string | null | undefined) =>
    t === "deep" ? "Deep Clean" : t === "move_out" ? "Move-out Clean" : "Standard Clean";

  return (
    <CleanerLayout>
      <Helmet>
        <title>My Schedule | PureTask</title>
        <meta name="description" content="View your upcoming cleaning jobs on a monthly calendar." />
      </Helmet>

      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-poppins font-bold tracking-tight">My Schedule</h1>
        </header>

        {/* Month calendar */}
        <Card className="border border-hairline-soft rounded-3xl overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(d => (
                <div key={d} className="text-center text-xs font-medium text-ink-muted py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((date, i) => {
                if (!date) return <div key={i} className="aspect-square" />;
                const dayJobs = getJobsForDate(date);
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg border border-hairline-soft p-1.5 flex flex-col items-start text-left transition-colors ${
                      isToday(date) ? "bg-primary/10 border-primary/40" : "bg-app-surface"
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold ${
                        isToday(date)
                          ? "h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                          : "text-ink"
                      }`}
                    >
                      {format(date, "d")}
                    </span>
                    {dayJobs[0] && (
                      <span className="mt-auto text-[10px] font-medium text-primary truncate w-full">
                        {format(new Date(dayJobs[0].scheduled_start_at!), "h:mm a")}{" "}
                        {cleaningLabel(dayJobs[0].cleaning_type).split(" ")[0]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Jobs */}
        <section>
          <h2 className="text-xl font-poppins font-bold mb-3">Upcoming Jobs</h2>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          ) : upcomingJobs.length === 0 ? (
            <Card className="border border-hairline-soft rounded-2xl">
              <CardContent className="p-8 text-center text-ink-muted">
                No upcoming jobs scheduled.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingJobs.map(job => {
                const start = job.scheduled_start_at ? new Date(job.scheduled_start_at) : null;
                return (
                  <Link
                    key={job.id}
                    to={`/cleaner/jobs/${job.id}`}
                    className="block"
                  >
                    <Card className="border border-hairline-soft rounded-2xl hover:shadow-wf-hover transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        {start && (
                          <div className="shrink-0 text-center rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 min-w-[64px]">
                            <div className="text-[10px] font-semibold uppercase text-primary tracking-wide">
                              {format(start, "EEE")}
                            </div>
                            <div className="text-2xl font-bold leading-none my-0.5">
                              {format(start, "d")}
                            </div>
                            <div className="text-[10px] uppercase text-ink-muted">
                              {format(start, "MMM")}
                            </div>
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold truncate">{cleaningLabel(job.cleaning_type)}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                            {start && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {format(start, "h:mm a")}
                              </span>
                            )}
                            {(job as any).address && (
                              <span className="flex items-center gap-1 truncate max-w-[260px]">
                                <MapPin className="h-3.5 w-3.5" />
                                {(job as any).address}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="mb-1.5">{statusBadge(job.status)}</div>
                          {typeof job.escrow_credits_reserved === "number" && (
                            <div className="flex items-center justify-end gap-0.5 font-semibold text-success">
                              <DollarSign className="h-4 w-4" />
                              {Number(job.escrow_credits_reserved).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex justify-center pt-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/cleaner/availability">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Manage availability
            </Link>
          </Button>
        </div>
      </div>
    </CleanerLayout>
  );
}