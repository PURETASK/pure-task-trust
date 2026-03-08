import { RescheduleRequestsList } from "@/components/scheduling/RescheduleRequestsList";
import { CalendarClock, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function RescheduleRequests() {
  return (
    <main className="flex-1">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-background">
        <div className="container max-w-4xl px-4 sm:px-6 py-10 sm:py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CalendarClock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Reschedule Requests</h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-0.5">
                  Review and respond to reschedule requests from cleaners
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <RescheduleRequestsList />
        </motion.div>
      </div>
    </main>
  );
}
