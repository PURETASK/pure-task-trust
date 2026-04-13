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

const alertStyles: Record<Alert["type"], { card: string; iconWrap: string; action: string; iconColor?: string }> = {
  approval: { card: "palette-card palette-card-amber", iconWrap: "palette-icon palette-icon-amber", action: "palette-pill palette-pill-amber" },
  payment: { card: "rounded-3xl border-2 border-destructive bg-destructive/5", iconWrap: "rounded-xl border-2 border-destructive bg-destructive/10", action: "rounded-full border-2 border-destructive bg-destructive/10 text-destructive", iconColor: "text-destructive" },
  reschedule: { card: "palette-card palette-card-amber", iconWrap: "palette-icon palette-icon-amber", action: "palette-pill palette-pill-amber" },
  message: { card: "palette-card palette-card-purple", iconWrap: "palette-icon palette-icon-purple", action: "palette-pill palette-pill-purple" },
  wallet: { card: "palette-card palette-card-green", iconWrap: "palette-icon palette-icon-green", action: "palette-pill palette-pill-green" },
  review: { card: "palette-card palette-card-blue", iconWrap: "palette-icon palette-icon-blue", action: "palette-pill palette-pill-blue" },
};

interface Props {
  alerts: Alert[];
}

export function AlertsSection({ alerts }: Props) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg palette-icon palette-icon-amber">
          <Bell className="h-3.5 w-3.5" />
        </div>
        <h3 className="font-bold text-sm">Action Needed</h3>
        {alerts.length > 0 && (
          <span className="h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </div>
      {alerts.length === 0 ? (
        <Card className="palette-card palette-card-green palette-card-dashed rounded-3xl">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl palette-icon palette-icon-green">
              <CheckCircle2 className="h-5 w-5" />
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
  style: { card: string; iconWrap: string; action: string; iconColor?: string };
  alert: Alert;
}) {
  return (
    <Card className={`transition-all cursor-pointer rounded-3xl ${style.card}`}>
      <CardContent className="p-3.5 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconWrap}`}>
          <Icon className={`h-4 w-4 ${style.iconColor ?? ""}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{alert.title}</p>
          <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
        </div>
        {alert.actionLabel && (
          <span className={`text-xs font-bold flex items-center gap-0.5 flex-shrink-0 px-2.5 py-1 ${style.action}`}>
            {alert.actionLabel}
            <ChevronRight className="h-3 w-3" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
