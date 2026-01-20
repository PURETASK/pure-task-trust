import { Check, AlertCircle, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PhotoRequirementsProps {
  beforeCount: number;
  afterCount: number;
  minRequired?: number;
  className?: string;
}

export function PhotoRequirements({ 
  beforeCount, 
  afterCount, 
  minRequired = 1,
  className 
}: PhotoRequirementsProps) {
  const beforeComplete = beforeCount >= minRequired;
  const afterComplete = afterCount >= minRequired;

  return (
    <div className={cn("flex gap-3", className)}>
      <RequirementBadge
        label="Before"
        count={beforeCount}
        required={minRequired}
        complete={beforeComplete}
      />
      <RequirementBadge
        label="After"
        count={afterCount}
        required={minRequired}
        complete={afterComplete}
      />
    </div>
  );
}

interface RequirementBadgeProps {
  label: string;
  count: number;
  required: number;
  complete: boolean;
}

function RequirementBadge({ label, count, required, complete }: RequirementBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
        complete
          ? "bg-success/10 border-success/30 text-success"
          : "bg-warning/10 border-warning/30 text-warning"
      )}
    >
      {complete ? (
        <Check className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <span className="text-sm font-medium">
        {label}: {count}/{required}
      </span>
    </div>
  );
}

export function useJobPhotoValidation(photos: Array<{ photo_url: string; photo_type?: string }>) {
  const beforePhotos = photos.filter(p => 
    p.photo_type === 'before' || p.photo_url.includes('/before-')
  );
  const afterPhotos = photos.filter(p => 
    p.photo_type === 'after' || p.photo_url.includes('/after-')
  );

  return {
    beforeCount: beforePhotos.length,
    afterCount: afterPhotos.length,
    beforePhotos,
    afterPhotos,
    canCheckout: beforePhotos.length >= 1 && afterPhotos.length >= 1,
    missingBefore: beforePhotos.length < 1,
    missingAfter: afterPhotos.length < 1,
  };
}
