import { RescheduleRequestsList } from "@/components/scheduling/RescheduleRequestsList";
import { CalendarClock } from "lucide-react";

export default function RescheduleRequests() {
  return (
    <main className="flex-1 py-8">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CalendarClock className="h-8 w-8 text-primary" />
            Reschedule Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and respond to reschedule requests from cleaners
          </p>
        </div>

        <RescheduleRequestsList />
      </div>
    </main>
  );
}
