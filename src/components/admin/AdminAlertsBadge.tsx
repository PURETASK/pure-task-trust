import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export function AdminAlertsBadge() {
  const { data } = useQuery({
    queryKey: ["admin-alerts-count"],
    queryFn: async () => {
      const [disputes, fraud] = await Promise.all([
        supabase
          .from("disputes")
          .select("id", { count: "exact", head: true })
          .eq("status", "open"),
        supabase
          .from("fraud_alerts")
          .select("id", { count: "exact", head: true })
          .eq("status", "open"),
      ]);
      return (disputes.count || 0) + (fraud.count || 0);
    },
    refetchInterval: 30_000,
  });

  const count = data ?? 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/admin/disputes"
            className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-secondary transition-colors"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          {count > 0 ? `${count} open alert${count > 1 ? "s" : ""} (disputes + fraud)` : "No open alerts"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
