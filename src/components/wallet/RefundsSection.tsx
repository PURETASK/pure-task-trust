import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Clock, CheckCircle2, XCircle, ChevronRight, Shield } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface RefundEntry {
  id: string;
  amount: number;
  status: "pending" | "approved" | "denied";
  reason: string;
  created_at: string;
  resolved_at?: string;
}

// Placeholder data — will be replaced with real hook
const mockRefunds: RefundEntry[] = [];

const statusConfig = {
  pending: { label: "Pending", icon: Clock, class: "bg-warning/10 text-warning border-warning/30" },
  approved: { label: "Approved", icon: CheckCircle2, class: "bg-success/10 text-success border-success/30" },
  denied: { label: "Denied", icon: XCircle, class: "bg-destructive/10 text-destructive border-destructive/30" },
};

export function RefundsSection() {
  const refunds = mockRefunds;

  return (
    <div className="rounded-3xl border-2 border-border/40 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <RotateCcw className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black">Refunds</h2>
              <p className="text-xs text-muted-foreground">Track refund requests and credits returned</p>
            </div>
          </div>
        </div>

        {refunds.length === 0 ? (
          <div className="py-10 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="font-bold text-muted-foreground">No refund requests</p>
            <p className="text-sm text-muted-foreground mt-1">
              If a cleaning doesn't meet expectations, you can request a refund from the job detail page.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {refunds.map((refund, i) => {
              const config = statusConfig[refund.status];
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={refund.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors"
                >
                  <div className="h-11 w-11 rounded-xl border-2 border-border/40 bg-muted/50 flex items-center justify-center flex-shrink-0">
                    <StatusIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{refund.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(refund.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] font-semibold border ${config.class}`}>
                      {config.label}
                    </Badge>
                    <p className="font-black tabular-nums">${refund.amount}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3" />
          Approved refunds are returned as wallet credits within 24 hours.
        </p>
      </div>
    </div>
  );
}
