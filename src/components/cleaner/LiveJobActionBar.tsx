import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCleanerJobs } from "@/hooks/useCleanerProfile";
import { Timer, ArrowRight, Flame, MapPin } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LiveJobActionBar() {
  const { user, isAuthenticated } = useAuth();
  const isCleaner = isAuthenticated && user?.role === "cleaner";

  // Always call the hook — it returns empty array when not enabled
  const { jobs } = useCleanerJobs();

  const liveJob = isCleaner ? jobs.find(j => j.status === "in_progress") : undefined;

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!liveJob?.check_in_at) return;
    const update = () => setElapsed(differenceInMinutes(new Date(), new Date(liveJob.check_in_at!)));
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, [liveJob?.check_in_at]);

  if (!liveJob) return null;

  const type = (liveJob.cleaning_type || "standard").replace(/_/g, " ");
  const hrs = Math.floor(elapsed / 60);
  const mins = elapsed % 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="fixed bottom-14 md:bottom-0 left-0 right-0 z-50"
      >
        <Link
          to={`/cleaner/jobs`}
          className="block mx-2 mb-2 md:mx-0 md:mb-0"
        >
          <div className="bg-warning/95 backdrop-blur-md text-warning-foreground rounded-2xl md:rounded-none px-4 py-3 flex items-center gap-3 shadow-lg border-2 border-warning/60 md:border-0 md:border-t">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide opacity-80">Live Job</p>
              <p className="font-bold text-sm capitalize truncate">{type} Clean</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold bg-white/20 rounded-xl px-3 py-1.5 shrink-0">
              <Timer className="h-4 w-4" />
              {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 opacity-70" />
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
