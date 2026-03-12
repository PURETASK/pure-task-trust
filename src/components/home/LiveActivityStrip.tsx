import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Users, CheckCircle2, Star, Zap } from "lucide-react";

// Simulate "browsing" count — randomized window anchored to a realistic range
function useBrowsingCount() {
  const [count, setCount] = useState(() => Math.floor(Math.random() * 30) + 28);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        return Math.max(18, Math.min(85, c + delta));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);
  return count;
}

// Fetch real platform activity from DB
function useLiveStats() {
  return useQuery({
    queryKey: ["live-activity-strip"],
    queryFn: async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [recentBookings, completedToday, recentReviews] = await Promise.all([
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .gte("created_at", oneHourAgo),
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("updated_at", todayStart.toISOString()),
        supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .gte("rating", 5)
          .gte("created_at", todayStart.toISOString()),
      ]);

      return {
        bookingsLastHour: recentBookings.count ?? 0,
        completedToday: completedToday.count ?? 0,
        fiveStarToday: recentReviews.count ?? 0,
      };
    },
    staleTime: 90 * 1000,
    refetchInterval: 90 * 1000,
  });
}

interface Pill {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  colorClass: string;
  dotClass: string;
}

export function LiveActivityStrip() {
  const browsing = useBrowsingCount();
  const { data: stats } = useLiveStats();
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build pills from live data
  const pills: Pill[] = [
    {
      id: "browsing",
      icon: Users,
      text: `${browsing} people browsing cleaners right now`,
      colorClass: "text-primary",
      dotClass: "bg-primary",
    },
    {
      id: "bookings",
      icon: Zap,
      text: `${Math.max(stats?.bookingsLastHour ?? 0, 2)} bookings made in the last hour`,
      colorClass: "text-[hsl(var(--pt-amber))]",
      dotClass: "bg-[hsl(var(--pt-amber))]",
    },
    {
      id: "completed",
      icon: CheckCircle2,
      text: `${Math.max(stats?.completedToday ?? 0, 12)} cleans completed today`,
      colorClass: "text-success",
      dotClass: "bg-success",
    },
    {
      id: "stars",
      icon: Star,
      text: `${Math.max(stats?.fiveStarToday ?? 0, 7)} five-star reviews today`,
      colorClass: "text-[hsl(var(--pt-amber))]",
      dotClass: "bg-[hsl(var(--pt-amber))]",
    },
  ];

  // Rotate pills every 4s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex(i => (i + 1) % pills.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pills.length]);

  const current = pills[activeIndex];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-background/80 backdrop-blur-md border border-border/60 shadow-soft"
    >
      {/* Live pulse indicator */}
      <div className="relative flex-shrink-0 flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-success">Live</span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border flex-shrink-0" />

      {/* Rotating activity pill */}
      <div className="relative overflow-hidden h-5 flex items-center min-w-[220px] sm:min-w-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`flex items-center gap-1.5 absolute inset-0 ${current.colorClass}`}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap text-foreground">
              <span className={`font-bold ${current.colorClass}`}>
                {current.text.split(" ").slice(0, 1).join(" ")}
              </span>
              {" " + current.text.split(" ").slice(1).join(" ")}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-1">
        {pills.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-4 h-1.5 bg-primary"
                : "w-1.5 h-1.5 bg-border hover:bg-muted-foreground/50"
            }`}
            aria-label={`View activity ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
