import { motion } from "framer-motion";
import {
  CheckCircle2, CreditCard, Clock, Star, RotateCcw,
  Shield, ArrowDownLeft, CalendarCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useClientJobs } from "@/hooks/useJob";
import { useWallet } from "@/hooks/useWallet";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  text: string;
  timestamp: string;
}

export function RecentActivityTimeline() {
  const { data: jobs } = useClientJobs();
  const { ledger } = useWallet();

  const activities = useMemo(() => {
    const items: ActivityItem[] = [];

    // Add job-related activities
    jobs?.slice(0, 10).forEach((job) => {
      if (job.status === "completed") {
        items.push({
          id: `completed-${job.id}`,
          icon: CheckCircle2,
          iconColor: "text-success",
          text: `Cleaning completed${job.cleaner ? ` with ${job.cleaner.first_name || "cleaner"}` : ""}`,
          timestamp: job.check_out_at || job.updated_at || job.created_at,
        });
      }
      if (job.status === "confirmed" && job.scheduled_start_at) {
        items.push({
          id: `confirmed-${job.id}`,
          icon: CalendarCheck,
          iconColor: "text-primary",
          text: `Booking confirmed for ${new Date(job.scheduled_start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          timestamp: job.created_at,
        });
      }
      if (job.escrow_credits_reserved && job.escrow_credits_reserved > 0 && job.status !== "completed") {
        items.push({
          id: `hold-${job.id}`,
          icon: Clock,
          iconColor: "text-warning",
          text: `$${job.escrow_credits_reserved} credits placed on hold`,
          timestamp: job.created_at,
        });
      }
    });

    // Add ledger activities
    ledger?.slice(0, 10).forEach((entry) => {
      if (entry.reason === "purchase") {
        items.push({
          id: `purchase-${entry.id}`,
          icon: CreditCard,
          iconColor: "text-primary",
          text: `$${entry.delta_credits} credits purchased`,
          timestamp: entry.created_at,
        });
      }
      if (entry.reason === "refund" || entry.reason === "escrow_release") {
        items.push({
          id: `refund-${entry.id}`,
          icon: ArrowDownLeft,
          iconColor: "text-success",
          text: `$${Math.abs(entry.delta_credits)} unused credits returned`,
          timestamp: entry.created_at,
        });
      }
    });

    // Sort by timestamp desc, take latest 8
    return items
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [jobs, ledger]);

  if (!activities.length) return null;

  return (
    <section>
      <h3 className="text-base sm:text-lg font-bold mb-3">Recent Activity</h3>
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="space-y-0">
            {activities.map((activity, i) => {
              const Icon = activity.icon;
              const isLast = i === activities.length - 1;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 relative"
                >
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-[13px] top-8 w-px h-[calc(100%-8px)] bg-border/60" />
                  )}
                  <div className={`h-7 w-7 rounded-full bg-muted/80 flex items-center justify-center flex-shrink-0 z-10 ${activity.iconColor}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <p className="text-sm text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
