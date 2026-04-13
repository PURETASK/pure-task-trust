import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2, CreditCard, MessageCircle, AlertTriangle,
  Star, Wallet, ChevronRight
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

const alertColors: Record<Alert["type"], string> = {
  approval: "text-warning bg-warning/10",
  payment: "text-destructive bg-destructive/10",
  reschedule: "text-warning bg-warning/10",
  message: "text-primary bg-primary/10",
  wallet: "text-warning bg-warning/10",
  review: "text-primary bg-primary/10",
};

interface Props {
  alerts: Alert[];
}

export function AlertsSection({ alerts }: Props) {
  return (
    <section>
      <h3 className="font-semibold text-sm mb-3">Action Needed</h3>
      {alerts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">You're all caught up.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const Icon = alertIcons[alert.type];
            const colorClass = alertColors[alert.type];

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {alert.actionHref ? (
                  <Link to={alert.actionHref}>
                    <AlertItem icon={Icon} colorClass={colorClass} alert={alert} />
                  </Link>
                ) : (
                  <AlertItem icon={Icon} colorClass={colorClass} alert={alert} />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AlertItem({
  icon: Icon,
  colorClass,
  alert,
}: {
  icon: typeof CheckCircle2;
  colorClass: string;
  alert: Alert;
}) {
  return (
    <Card className="hover:shadow-card transition-all cursor-pointer">
      <CardContent className="p-3 flex items-center gap-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{alert.title}</p>
          <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
        </div>
        {alert.actionLabel && (
          <span className="text-xs font-semibold text-primary flex items-center gap-0.5 flex-shrink-0">
            {alert.actionLabel}
            <ChevronRight className="h-3 w-3" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
