import { Check, Clock, Circle, X } from "lucide-react";
import { format } from "date-fns";

interface VerificationItem {
  status: string | null;
  completedAt?: string | null;
  expiresAt?: string | null;
  documentType?: string | null;
}

interface VerificationChecklistProps {
  backgroundCheck?: VerificationItem | null;
  idVerification?: VerificationItem | null;
  compact?: boolean;
}

function getStatusConfig(status: string | null) {
  switch (status?.toLowerCase()) {
    case "completed":
    case "passed":
    case "verified":
      return {
        icon: Check,
        color: "text-success",
        bgColor: "bg-success",
        borderColor: "border-success",
        label: "Verified",
      };
    case "pending":
    case "in_progress":
      return {
        icon: Clock,
        color: "text-warning",
        bgColor: "bg-warning",
        borderColor: "border-warning",
        label: "In Progress",
      };
    case "failed":
    case "rejected":
      return {
        icon: X,
        color: "text-destructive",
        bgColor: "bg-destructive",
        borderColor: "border-destructive",
        label: "Failed",
      };
    default:
      return {
        icon: Circle,
        color: "text-muted-foreground",
        bgColor: "bg-muted/50",
        borderColor: "border-muted",
        label: "Not Started",
      };
  }
}

function VerificationRow({
  title,
  item,
  compact,
}: {
  title: string;
  item?: VerificationItem | null;
  compact?: boolean;
}) {
  const config = getStatusConfig(item?.status ?? null);
  const Icon = config.icon;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return null;
    }
  };

  const completedDate = formatDate(item?.completedAt);
  const expiresDate = formatDate(item?.expiresAt);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-md ${config.bgColor} border ${config.borderColor}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className="text-sm font-medium">{title}</span>
        <span className={`text-xs ${config.color} ml-auto`}>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
      <div className={`mt-0.5 p-1 rounded-full ${config.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{title}</span>
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {completedDate ? (
            <>
              Completed {completedDate}
              {expiresDate && ` · Expires ${expiresDate}`}
              {item?.documentType && ` · ${item.documentType.replace(/_/g, " ")}`}
            </>
          ) : (
            "Not yet completed"
          )}
        </div>
      </div>
    </div>
  );
}

export function VerificationChecklist({
  backgroundCheck,
  idVerification,
  compact = false,
}: VerificationChecklistProps) {
  return (
    <div className={`space-y-${compact ? "2" : "2"}`}>
      <VerificationRow
        title="Background Check"
        item={
          backgroundCheck
            ? {
                status: backgroundCheck.status,
                completedAt: backgroundCheck.completedAt,
                expiresAt: backgroundCheck.expiresAt,
              }
            : null
        }
        compact={compact}
      />
      <VerificationRow
        title="ID Verification"
        item={
          idVerification
            ? {
                status: idVerification.status,
                completedAt: idVerification.completedAt,
                expiresAt: idVerification.expiresAt,
                documentType: idVerification.documentType,
              }
            : null
        }
        compact={compact}
      />
    </div>
  );
}
