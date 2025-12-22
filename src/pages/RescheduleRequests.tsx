import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RescheduleRequestsList } from "@/components/scheduling/RescheduleRequestsList";
import { CalendarClock } from "lucide-react";

export default function RescheduleRequests() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
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

          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Accept or decline requests to reschedule your bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RescheduleRequestsList />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
