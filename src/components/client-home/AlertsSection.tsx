import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2, CreditCard, MessageCircle, AlertTriangle,
  Star, Wallet, ChevronRight, Bell
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Alert } from "@/hooks/useClientHome";

const alertIcons: Record<Alert["type"], typeof CheckCircle2> = {
  approval: CheckCircle2,
  payment: CreditCard,
  reschedule: AlertTriangle,
  message: MessageCircle,
  wallet: Wallet,
  review: Star,
};

const alertStyles: Record<Alert["type"], { icon: string; bg: string; border: string }> = {
  approval: { icon: "text-warning", bg: "bg-warning/10", border: "border-2 border-warning/30" },
  payment: { icon: "text-destructive", bg: "bg-destructive/10", border: "border-2 border-destructive/30" },
  reschedule: { icon: "text-warning", bg: "bg-warning/10", border: "border-2 border-warning/30" },
  message: { icon: "text-[hsl(var(--pt-purple))]", bg: "bg-[hsl(var(--pt-purple))]/10", border: "border-2 border-[hsl(var(--pt-purple))]/30" },
  wallet: { icon: "text-success", bg: "bg-success/10", border: "border-2 border-success/30" },
  review: { icon: "text-primary", bg: "bg-primary/10", border: "border-2 border-primary/30" },
};

interface Props {
  alerts: Alert[];
}

export function AlertsSection({ alerts }: Props) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg bg-warning/10 flex items-center justify-center">
          <Bell className="h-3.5 w-3.5 text-warning" />
        </div>
        <h3 className="font-bold text-sm">Action Needed</h3>
        {alerts.length > 0 && (
          <span className="h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </div>
      {alerts.length === 0 ? (
        <Card className="border-2 border-dashed border-success/30 rounded-3xl">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-success/10 border-2 border-success/30 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-bold">You're all caught up.</p>
              <p className="text-xs text-muted-foreground">No pending actions right now</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const Icon = alertIcons[alert.type];
            const style = alertStyles[alert.type];

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {alert.actionHref ? (
                  <Link to={alert.actionHref}>
                    <AlertCard icon={Icon} style={style} alert={alert} />
                  </Link>
                ) : (
                  <AlertCard icon={Icon} style={style} alert={alert} />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AlertCard({
  icon: Icon,
  style,
  alert,
}: {
  icon: typeof CheckCircle2;
  style: { icon: string; bg: string; border: string };
  alert: Alert;
}) {
  return (
    <Card className={`hover:shadow-card transition-all cursor-pointer rounded-2xl ${style.border}`}>
      <CardContent className="p-3.5 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
          <Icon className={`h-4 w-4 ${style.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{alert.title}</p>
          <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
        </div>
        {alert.actionLabel && (
          <span className="text-xs font-bold text-primary flex items-center gap-0.5 flex-shrink-0 bg-primary/5 px-2.5 py-1 rounded-full border-2 border-primary/20">
            {alert.actionLabel}
            <ChevronRight className="h-3 w-3" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
