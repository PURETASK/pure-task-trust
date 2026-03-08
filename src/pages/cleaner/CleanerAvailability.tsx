
import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { AvailabilityEditor } from "@/components/availability/AvailabilityEditor";
import { TimeOffManager } from "@/components/availability/TimeOffManager";
import { RescheduleRequestsList } from "@/components/scheduling/RescheduleRequestsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Umbrella, CalendarClock, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function CleanerAvailability() {
  return (
    <CleanerLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-cyan-500/5 to-violet-500/10 border border-primary/20 p-8">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/5 rounded-full" />
            <div className="flex items-center gap-4 relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Availability Settings</h1>
                <p className="text-muted-foreground mt-1">Control when you work and manage your schedule</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info tip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">Setting accurate availability helps you get matched with the right jobs. Clients can only book you during your available times.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Tabs defaultValue="weekly" className="space-y-6">
            <TabsList className="rounded-xl h-11 p-1">
              <TabsTrigger value="weekly" className="gap-2 rounded-lg"><Calendar className="h-4 w-4" />Weekly Hours</TabsTrigger>
              <TabsTrigger value="time-off" className="gap-2 rounded-lg"><Umbrella className="h-4 w-4" />Time Off</TabsTrigger>
              <TabsTrigger value="reschedule" className="gap-2 rounded-lg"><CalendarClock className="h-4 w-4" />Reschedules</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly"><AvailabilityEditor /></TabsContent>
            <TabsContent value="time-off"><TimeOffManager /></TabsContent>
            <TabsContent value="reschedule"><RescheduleRequestsList /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </CleanerLayout>
  );
}
