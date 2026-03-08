import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Star, XCircle, FileX, CheckCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export type TrustQueueItemType = "EXPIRED_ID" | "BACKGROUND_FAIL" | "FLAGGED_REVIEW" | "HIGH_RISK_CLIENT" | "FRAUD_ALERT";
export type TrustSeverity = "critical" | "high" | "medium";

export interface TrustQueueItemData {
  id: string;
  type: TrustQueueItemType;
  severity: TrustSeverity;
  subject_name: string;
  subject_role: "client" | "cleaner";
  created_at: string;
  action_url?: string;
  description?: string;
}

const TYPE_CONFIG: Record<TrustQueueItemType, { icon: any; label: string; color: string }> = {
  EXPIRED_ID: { icon: FileX, label: "Expired ID", color: "text-orange-600" },
  BACKGROUND_FAIL: { icon: Shield, label: "Background Check Failed", color: "text-destructive" },
  FLAGGED_REVIEW: { icon: Star, label: "Flagged Review", color: "text-warning" },
  HIGH_RISK_CLIENT: { icon: AlertTriangle, label: "High Risk Client", color: "text-orange-600" },
  FRAUD_ALERT: { icon: AlertTriangle, label: "Fraud Alert", color: "text-destructive" },
};

const SEVERITY_STYLES: Record<TrustSeverity, string> = {
  critical: "border-destructive/30 bg-destructive/5",
  high: "border-orange-500/30 bg-orange-500/5",
  medium: "border-warning/30 bg-warning/5",
};

const SEVERITY_BADGE: Record<TrustSeverity, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  medium: "bg-warning/10 text-warning border-warning/30",
};

interface TrustQueueItemProps {
  item: TrustQueueItemData;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  isActing?: boolean;
}

export function TrustQueueItem({ item, onResolve, onDismiss, isActing }: TrustQueueItemProps) {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border ${SEVERITY_STYLES[item.severity]} transition-all`}>
      <div className={`h-10 w-10 rounded-xl bg-background/80 flex items-center justify-center flex-shrink-0 border`}>
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-sm">{config.label}</span>
          <Badge variant="outline" className={`text-xs capitalize ${SEVERITY_BADGE[item.severity]}`}>
            {item.severity}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">{item.subject_role}</Badge>
        </div>
        <p className="text-sm font-medium">{item.subject_name}</p>
        {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(item.created_at), "MMM d, yyyy 'at' HH:mm")}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {item.action_url && (
          <Button variant="outline" size="sm" asChild className="gap-1 text-xs">
            <Link to={item.action_url}>
              <ExternalLink className="h-3 w-3" />View
            </Link>
          </Button>
        )}
        <Button
          size="sm"
          variant="default"
          className="gap-1 text-xs"
          onClick={() => onResolve(item.id)}
          disabled={isActing}
        >
          <CheckCircle className="h-3.5 w-3.5" />Resolve
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1 text-xs text-muted-foreground"
          onClick={() => onDismiss(item.id)}
          disabled={isActing}
        >
          <XCircle className="h-3.5 w-3.5" />Dismiss
        </Button>
      </div>
    </div>
  );
}
