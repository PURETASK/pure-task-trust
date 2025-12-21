import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { AvailabilityEditor } from "@/components/availability/AvailabilityEditor";
import { TimeOffManager } from "@/components/availability/TimeOffManager";
import { RescheduleRequestsList } from "@/components/scheduling/RescheduleRequestsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Umbrella, CalendarClock } from "lucide-react";

export default function CleanerAvailability() {
  return (
    <CleanerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Availability Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your working hours, time off, and reschedule requests
          </p>
        </div>

        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList>
            <TabsTrigger value="weekly" className="gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Hours
            </TabsTrigger>
            <TabsTrigger value="time-off" className="gap-2">
              <Umbrella className="h-4 w-4" />
              Time Off
            </TabsTrigger>
            <TabsTrigger value="reschedule" className="gap-2">
              <CalendarClock className="h-4 w-4" />
              Reschedules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <AvailabilityEditor />
          </TabsContent>

          <TabsContent value="time-off">
            <TimeOffManager />
          </TabsContent>

          <TabsContent value="reschedule">
            <RescheduleRequestsList />
          </TabsContent>
        </Tabs>
      </div>
    </CleanerLayout>
  );
}
