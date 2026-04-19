import { CleanerLayout } from "@/components/cleaner/CleanerLayout";
import { AvailabilityEditor } from "@/components/availability/AvailabilityEditor";
import { TimeOffManager } from "@/components/availability/TimeOffManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Umbrella, Info } from "lucide-react";
import { motion } from "framer-motion";
import availabilityBg from "@/assets/availability-bg.png";

export default function CleanerAvailability() {
  return (
    <CleanerLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary/40 p-8">
            <img
              src={availabilityBg}
              alt=""
              loading="lazy"
              width={1024}
              height={1024}
              className="absolute inset-0 w-full h-full object-contain object-center opacity-60 pointer-events-none select-none"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 rounded-3xl" />
            <div className="flex items-center gap-4 relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary flex items-center justify-center shadow-lg shadow-primary/25">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex items-start gap-3 p-4 rounded-2xl border-2 border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Set your weekly hours so clients know when to book you. Tap <strong>✏️</strong> on any time slot to edit it directly. Use <strong>Days Off</strong> to block out holidays or personal days.
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Tabs defaultValue="weekly" className="space-y-5">
            <TabsList className="rounded-2xl h-12 p-1 border-2 border-border/60 bg-muted/40 w-full">
              <TabsTrigger value="weekly" className="flex-1 gap-2 rounded-xl font-semibold data-[state=active]:bg-primary data-[state=active]:text-white">
                <Calendar className="h-4 w-4" /> Weekly Hours
              </TabsTrigger>
              <TabsTrigger value="time-off" className="flex-1 gap-2 rounded-xl font-semibold data-[state=active]:bg-warning data-[state=active]:text-white">
                <Umbrella className="h-4 w-4" /> Days Off
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weekly">
              <AvailabilityEditor />
            </TabsContent>
            <TabsContent value="time-off">
              <TimeOffManager />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </CleanerLayout>
  );
}
