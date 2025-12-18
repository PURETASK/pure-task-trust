import { useState } from "react";
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay } from "date-fns";

export default function CleanerSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"2weeks" | "month">("2weeks");

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
    
    // Add empty days for the start of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
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

  const twoWeeksDays = generateTwoWeeksCalendar();
  const monthDays = generateMonthCalendar();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
                      aspect-square flex flex-col items-center justify-center rounded-lg border transition-all
                      ${isToday(date) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                      ${isSelected(date) && !isToday(date) ? "border-primary" : "border-border"}
                    `}
                  >
                    <span className="text-xs text-muted-foreground">{format(date, "EEE")}</span>
                    <span className="text-lg font-semibold">{format(date, "d")}</span>
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
                          w-full h-full flex items-center justify-center rounded-lg border transition-all
                          ${isToday(date) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                          ${isSelected(date) && !isToday(date) ? "border-primary" : "border-border"}
                        `}
                      >
                        <span className="text-sm font-medium">{format(date, "d")}</span>
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
              0 job requests • 0 accepted jobs
            </p>
          </CardContent>
        </Card>

        {/* Job Lists */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Job Requests</h3>
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No job requests for this day.
              </CardContent>
            </Card>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Accepted Jobs</h3>
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No accepted jobs for this day.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CleanerLayout>
  );
}
