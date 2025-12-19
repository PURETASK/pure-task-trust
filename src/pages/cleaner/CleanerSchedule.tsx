import { useState, useMemo } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, isSameDay } from "date-fns";
import { useCleanerJobs } from "@/hooks/useCleanerProfile";

export default function CleanerSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"2weeks" | "month">("2weeks");
  
  const { jobs, isLoading } = useCleanerJobs();

  const generateTwoWeeksCalendar = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = [];
    for (let i = 0; i < 14; i++) {
      days.push(addDays(start, i));
    }
    return days;
  };

  const generateMonthCalendar = () => {
    const start = startOfMonth(currentDate);
    const firstDayOfWeek = getDay(start);
    const daysInMonth = getDaysInMonth(currentDate);
    const days = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
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

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Get jobs for a specific date
  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => {
      if (!job.scheduled_start_at) return false;
      return isSameDay(new Date(job.scheduled_start_at), date);
    });
  };

  // Check if date has jobs
  const hasJobs = (date: Date) => {
    return getJobsForDate(date).length > 0;
  };

  // Jobs for selected date
  const selectedDateJobs = useMemo(() => getJobsForDate(selectedDate), [selectedDate, jobs]);
  const pendingJobs = selectedDateJobs.filter(j => j.status === 'pending' || j.status === 'created');
  const acceptedJobs = selectedDateJobs.filter(j => j.status === 'confirmed' || j.status === 'in_progress');

  const twoWeeksDays = generateTwoWeeksCalendar();
  const monthDays = generateMonthCalendar();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'created':
        return <Badge variant="warning">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <CleanerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Schedule</h1>

        {/* Calendar Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg">Calendar</CardTitle>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "2weeks" | "month")}>
              <TabsList className="h-9">
                <TabsTrigger value="2weeks" className="text-xs px-3">2 Weeks</TabsTrigger>
                <TabsTrigger value="month" className="text-xs px-3">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {viewMode === "month" && (
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={() => navigateCalendar("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h3>
                <Button variant="ghost" size="icon" onClick={() => navigateCalendar("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Week Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {viewMode === "2weeks" ? (
              <div className="grid grid-cols-7 gap-2">
                {twoWeeksDays.map((date, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-lg border transition-all relative
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
                        className={`
                          w-full h-full flex items-center justify-center rounded-lg border transition-all relative
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

        {/* Selected Date Info */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold mb-1">
              {format(selectedDate, "EEEE, MMMM d")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {pendingJobs.length} job request{pendingJobs.length !== 1 ? 's' : ''} • {acceptedJobs.length} accepted job{acceptedJobs.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Job Lists */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Job Requests</h3>
            {isLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : pendingJobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No job requests for this day.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {job.cleaning_type === 'deep' ? 'Deep Clean' : 
                             job.cleaning_type === 'move_out' ? 'Move-out Clean' : 'Standard Clean'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {job.client?.first_name} {job.client?.last_name}
                          </p>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'h:mm a') : 'TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.estimated_hours || 2}h
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-3">Accepted Jobs</h3>
            {isLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : acceptedJobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No accepted jobs for this day.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {acceptedJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {job.cleaning_type === 'deep' ? 'Deep Clean' : 
                             job.cleaning_type === 'move_out' ? 'Move-out Clean' : 'Standard Clean'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {job.client?.first_name} {job.client?.last_name}
                          </p>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.scheduled_start_at ? format(new Date(job.scheduled_start_at), 'h:mm a') : 'TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.estimated_hours || 2}h
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CleanerLayout>
  );
}
